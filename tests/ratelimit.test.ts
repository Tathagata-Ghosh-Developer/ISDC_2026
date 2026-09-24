/**
 * The in-memory limiter.
 *
 * The bug this file exists for: the first version pushed the timestamp
 * before deciding whether the request was allowed, so every refused
 * retry went into the window too. Someone who read "wait a few
 * minutes" and came back a few minutes later renewed their own lockout,
 * and could never get in again by following the instructions.
 *
 * The buckets map is module state shared by every test in this file, so
 * each test uses its own key.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { clientKey, rateLimit, rateLimitReset } from "@/lib/ratelimit";

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-10-16T08:30:00+05:30"));
});

afterEach(() => {
  vi.useRealTimers();
});

describe("rateLimit", () => {
  it("allows exactly max requests inside the window", () => {
    const key = "allows-max";
    for (let i = 0; i < 3; i++) {
      expect(rateLimit(key, { max: 3, windowMs: 60_000 }).ok, `request ${i + 1}`).toBe(true);
    }
    expect(rateLimit(key, { max: 3, windowMs: 60_000 }).ok).toBe(false);
  });

  it("does not count refused requests, so the window still expires", () => {
    // The regression test. Exhaust the limit, then keep hammering for
    // most of the window the way an impatient person would, then wait
    // out the window from the moment of the LAST refusal. If refusals
    // were counted, the window would have been pushed forward by every
    // one of them and this would still be refused.
    const key = "refusals-not-counted";
    const opts = { max: 3, windowMs: 60_000 };

    for (let i = 0; i < 3; i++) expect(rateLimit(key, opts).ok).toBe(true);

    for (let i = 0; i < 10; i++) {
      vi.advanceTimersByTime(5_000); // 50s of retrying
      expect(rateLimit(key, opts).ok, `retry ${i + 1}`).toBe(false);
    }

    // 60s after the last retry. The three allowed hits are now 110s old
    // and must have fallen out of the window.
    vi.advanceTimersByTime(60_001);
    expect(rateLimit(key, opts).ok).toBe(true);
  });

  it("frees one slot at a time as the window slides", () => {
    const key = "sliding";
    const opts = { max: 2, windowMs: 10_000 };

    expect(rateLimit(key, opts).ok).toBe(true); // t=0
    vi.advanceTimersByTime(4_000);
    expect(rateLimit(key, opts).ok).toBe(true); // t=4000
    expect(rateLimit(key, opts).ok).toBe(false); // full

    vi.advanceTimersByTime(6_001); // t=10001, first hit has aged out
    expect(rateLimit(key, opts).ok).toBe(true);
    expect(rateLimit(key, opts).ok).toBe(false);
  });

  it("reports a retryAfter in whole seconds that a human can act on", () => {
    const key = "retry-after";
    const opts = { max: 1, windowMs: 600_000 };
    expect(rateLimit(key, opts)).toEqual({ ok: true, retryAfter: 0 });
    const refused = rateLimit(key, opts);
    expect(refused.ok).toBe(false);
    expect(refused.retryAfter).toBe(600);
    expect(Number.isInteger(refused.retryAfter)).toBe(true);
  });

  it("keeps separate keys apart", () => {
    const a = "separate:a";
    const b = "separate:b";
    const opts = { max: 2, windowMs: 60_000 };

    expect(rateLimit(a, opts).ok).toBe(true);
    expect(rateLimit(a, opts).ok).toBe(true);
    expect(rateLimit(a, opts).ok).toBe(false);

    // b has spent nothing.
    expect(rateLimit(b, opts).ok).toBe(true);
    expect(rateLimit(b, opts).ok).toBe(true);
    expect(rateLimit(b, opts).ok).toBe(false);

    // and a is still refused.
    expect(rateLimit(a, opts).ok).toBe(false);
  });

  describe("with a block", () => {
    it("reports the block length, not the window, as the wait", () => {
      const key = "block-retry-after";
      const opts = { max: 2, windowMs: 60_000, blockMs: 900_000 };
      rateLimit(key, opts);
      rateLimit(key, opts);
      expect(rateLimit(key, opts)).toEqual({ ok: false, retryAfter: 900 });
    });

    it("does not extend the block when the blocked person keeps trying", () => {
      // The login lockout is fifteen minutes. Someone who retries at
      // minute fourteen must still be let in at minute fifteen.
      const key = "block-not-extended";
      const opts = { max: 5, windowMs: 600_000, blockMs: 900_000 };

      for (let i = 0; i < 5; i++) expect(rateLimit(key, opts).ok).toBe(true);
      expect(rateLimit(key, opts).ok).toBe(false); // block starts here

      for (let i = 0; i < 14; i++) {
        vi.advanceTimersByTime(60_000);
        expect(rateLimit(key, opts).ok, `minute ${i + 1}`).toBe(false);
      }

      vi.advanceTimersByTime(60_001); // past fifteen minutes
      expect(rateLimit(key, opts).ok).toBe(true);
    });

    it("counts down the remaining block rather than restarting it", () => {
      const key = "block-countdown";
      const opts = { max: 1, windowMs: 60_000, blockMs: 900_000 };
      rateLimit(key, opts);
      expect(rateLimit(key, opts).retryAfter).toBe(900);
      vi.advanceTimersByTime(300_000);
      expect(rateLimit(key, opts).retryAfter).toBe(600);
    });
  });
});

describe("rateLimitReset", () => {
  it("clears a key so the next request starts fresh", () => {
    const key = "reset-me";
    const opts = { max: 2, windowMs: 60_000 };
    rateLimit(key, opts);
    rateLimit(key, opts);
    expect(rateLimit(key, opts).ok).toBe(false);

    rateLimitReset(key);
    expect(rateLimit(key, opts).ok).toBe(true);
    expect(rateLimit(key, opts).ok).toBe(true);
    expect(rateLimit(key, opts).ok).toBe(false);
  });

  it("clears an active block too", () => {
    const key = "reset-block";
    const opts = { max: 1, windowMs: 60_000, blockMs: 900_000 };
    rateLimit(key, opts);
    expect(rateLimit(key, opts).ok).toBe(false);
    rateLimitReset(key);
    expect(rateLimit(key, opts).ok).toBe(true);
  });

  it("does not touch any other key", () => {
    const opts = { max: 1, windowMs: 60_000 };
    rateLimit("reset-neighbour:a", opts);
    rateLimit("reset-neighbour:b", opts);
    rateLimitReset("reset-neighbour:a");
    expect(rateLimit("reset-neighbour:a", opts).ok).toBe(true);
    expect(rateLimit("reset-neighbour:b", opts).ok).toBe(false);
  });

  it("is harmless on a key that was never used", () => {
    expect(() => rateLimitReset("never-seen")).not.toThrow();
  });
});

describe("clientKey", () => {
  const req = (headers: Record<string, string>) =>
    new Request("https://example.test/api/donations", { headers });

  it("uses the first address in x-forwarded-for", () => {
    expect(clientKey(req({ "x-forwarded-for": "203.0.113.7, 10.0.0.1" }), "donate")).toBe(
      "donate:203.0.113.7",
    );
  });

  it("trims whitespace around the address", () => {
    expect(clientKey(req({ "x-forwarded-for": "  203.0.113.7  " }), "donate")).toBe(
      "donate:203.0.113.7",
    );
  });

  it("falls back to x-real-ip", () => {
    expect(clientKey(req({ "x-real-ip": "203.0.113.9" }), "login")).toBe("login:203.0.113.9");
  });

  it("falls back to a shared anonymous bucket with no headers at all", () => {
    expect(clientKey(req({}), "track")).toBe("track:anonymous");
  });

  it("scopes the key, so the donate limit and the login limit are separate", () => {
    const r = req({ "x-forwarded-for": "203.0.113.7" });
    expect(clientKey(r, "donate")).not.toBe(clientKey(r, "login"));
  });
});

describe("eviction", () => {
  it("a flood of new keys wipes everyone's counters, including an exhausted one", () => {
    // Characterisation, not an endorsement. buckets.clear() at 2000
    // entries means anyone who can make 2000 requests with 2000
    // different forwarded addresses resets the limiter for everybody,
    // themselves included. Written down so the behaviour is a decision
    // rather than a surprise. See the report.
    const victim = "eviction:victim";
    const opts = { max: 1, windowMs: 600_000 };
    expect(rateLimit(victim, opts).ok).toBe(true);
    expect(rateLimit(victim, opts).ok).toBe(false);

    for (let i = 0; i < 2100; i++) rateLimit(`eviction:flood:${i}`, opts);

    expect(rateLimit(victim, opts).ok).toBe(true);
  });
});

/**
 * Sign-in counts failures only. Many people signing in correctly from
 * the same campus address must never lock anybody out.
 */
import { blockedFor, recordFailure, clientIp } from "@/lib/ratelimit";

describe("recordFailure and blockedFor", () => {
  const opts = { max: 3, windowMs: 60_000, blockMs: 120_000 };

  it("is not blocked before any failure", () => {
    expect(blockedFor("fail:fresh")).toBe(0);
  });

  it("blocks at the limit and not before", () => {
    recordFailure("fail:a", opts);
    recordFailure("fail:a", opts);
    expect(blockedFor("fail:a")).toBe(0);
    recordFailure("fail:a", opts);
    expect(blockedFor("fail:a")).toBeGreaterThan(100);
  });

  it("keeps separate keys separate", () => {
    for (let i = 0; i < 3; i++) recordFailure("fail:b", opts);
    expect(blockedFor("fail:b")).toBeGreaterThan(0);
    expect(blockedFor("fail:c")).toBe(0);
  });

  it("looking does not count", () => {
    for (let i = 0; i < 50; i++) blockedFor("fail:d");
    recordFailure("fail:d", opts);
    expect(blockedFor("fail:d")).toBe(0);
  });
});

describe("clientIp", () => {
  it("takes the first forwarded address", () => {
    const req = new Request("https://x.test", {
      headers: { "x-forwarded-for": "203.0.113.9, 10.0.0.1" },
    });
    expect(clientIp(req)).toBe("203.0.113.9");
  });
});
