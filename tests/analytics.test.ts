/**
 * The counter's sanitisers.
 *
 * These four functions are the whole privacy story of the analytics
 * table. Everything they let through is written to a row the committee
 * can read, so a test here is a test of what the committee is allowed
 * to know about a visitor.
 */
import { describe, expect, it } from "vitest";
import {
  cleanPath,
  cleanReferrer,
  deviceFromWidth,
  isKnownEvent,
  kolkataDay,
} from "@/lib/analytics";

const SELF = "iiscsharodiyadurgotsab.vercel.app";

describe("cleanPath", () => {
  it("keeps an ordinary path", () => {
    expect(cleanPath("/daan")).toBe("/daan");
    expect(cleanPath("/daan/board")).toBe("/daan/board");
    expect(cleanPath("/")).toBe("/");
  });

  it("strips the query string", () => {
    expect(cleanPath("/daan?amount=5000&name=Tathagata")).toBe("/daan");
    expect(cleanPath("/gaan?mix=dhk62add58")).toBe("/gaan");
    expect(cleanPath("/?utm_source=whatsapp")).toBe("/");
  });

  it("strips the fragment", () => {
    expect(cleanPath("/thikana#write-to-us")).toBe("/thikana");
  });

  it("strips a fragment that comes before a question mark", () => {
    expect(cleanPath("/thikana#write?x=1")).toBe("/thikana");
  });

  it("adds the leading slash a relative path is missing", () => {
    expect(cleanPath("daan")).toBe("/daan");
  });

  it("lowercases, so one page is one row", () => {
    expect(cleanPath("/Daan/Board")).toBe("/daan/board");
  });

  it("trims surrounding whitespace", () => {
    expect(cleanPath("  /daan  ")).toBe("/daan");
  });

  it("collapses a receipt link to /receipt, never storing the token", () => {
    const token = "8f14e45f-ceea-467a-9a4f-9b2c1d3e4f50";
    expect(cleanPath(`/receipt/${token}`)).toBe("/receipt");
    expect(cleanPath(`/receipt/${token}?print=1`)).toBe("/receipt");
    expect(cleanPath("/receipt/")).toBe("/receipt");
    expect(cleanPath("/receipt")).toBe("/receipt");
  });

  it("collapses a receipt link whatever case the visitor typed", () => {
    // Track.tsx sends window's pathname verbatim, and the root layout
    // mounts it on the 404 page too, so a mistyped capital reaches this
    // function with a live token attached. Nothing containing a token
    // may ever be returned.
    const token = "8f14e45f-ceea-467a-9a4f-9b2c1d3e4f50";
    expect(cleanPath(`/Receipt/${token}`)).toBe("/receipt");
    expect(cleanPath(`/RECEIPT/${token}`)).toBe("/receipt");
  });

  it("never returns anything that looks like a receipt token", () => {
    const token = "8f14e45f-ceea-467a-9a4f-9b2c1d3e4f50";
    for (const raw of [
      `/receipt/${token}`,
      `/Receipt/${token}`,
      `/receipt/${token}/print`,
      `/receipt/${token}?x=1`,
    ]) {
      expect(cleanPath(raw), raw).not.toContain(token);
    }
  });

  it("collapses every admin page to /admin", () => {
    expect(cleanPath("/admin")).toBe("/admin");
    expect(cleanPath("/admin/expenses")).toBe("/admin");
    expect(cleanPath("/admin/enquiries?status=new")).toBe("/admin");
    expect(cleanPath("/Admin/expenses")).toBe("/admin");
  });

  it("caps a very long path so a stray URL cannot fill the table", () => {
    const long = "/" + "a".repeat(500);
    expect(cleanPath(long).length).toBeLessThanOrEqual(120);
  });

  it("always returns a path starting with a slash", () => {
    for (const raw of ["", "   ", "daan", "/daan", "?x=1", "#top"]) {
      expect(cleanPath(raw).startsWith("/"), JSON.stringify(raw)).toBe(true);
    }
  });
});

describe("cleanReferrer", () => {
  it("reduces a full URL to its hostname", () => {
    expect(cleanReferrer("https://www.google.com/search?q=iisc+durga+puja", SELF)).toBe(
      "google.com",
    );
    expect(cleanReferrer("https://l.instagram.com/?u=something", SELF)).toBe("l.instagram.com");
  });

  it("drops a www prefix and lowercases", () => {
    expect(cleanReferrer("https://WWW.Google.COM/", SELF)).toBe("google.com");
  });

  it("never keeps the path or the query of the referring page", () => {
    const r = cleanReferrer("https://mail.google.com/mail/u/0/#inbox?q=secret", SELF);
    expect(r).toBe("mail.google.com");
    expect(r).not.toContain("/");
    expect(r).not.toContain("secret");
  });

  it("is direct for nothing at all", () => {
    expect(cleanReferrer("", SELF)).toBe("direct");
    expect(cleanReferrer(null, SELF)).toBe("direct");
    expect(cleanReferrer(undefined, SELF)).toBe("direct");
  });

  it("is direct for a string that is not a URL", () => {
    expect(cleanReferrer("not a url", SELF)).toBe("direct");
    expect(cleanReferrer("javascript:alert(1)", SELF)).toBe("direct");
    expect(cleanReferrer("/daan", SELF)).toBe("direct");
  });

  it("is internal for the site itself", () => {
    expect(cleanReferrer(`https://${SELF}/daan`, SELF)).toBe("internal");
    expect(cleanReferrer(`https://www.${SELF}/`, SELF)).toBe("internal");
    expect(cleanReferrer(`https://${SELF}/`, `www.${SELF}`)).toBe("internal");
    expect(cleanReferrer("http://localhost:3311/daan", "localhost")).toBe("internal");
  });

  it("caps a hostile hostname", () => {
    const host = "a".repeat(200) + ".example.com";
    expect(cleanReferrer(`https://${host}/`, SELF).length).toBeLessThanOrEqual(80);
  });
});

describe("deviceFromWidth", () => {
  const cases: [unknown, string][] = [
    [320, "phone"],
    [639, "phone"],
    [640, "tablet"],
    [1023, "tablet"],
    [1024, "desktop"],
    [1920, "desktop"],
    [1, "phone"],
    [0, "unknown"],
    [-1, "unknown"],
    [NaN, "unknown"],
    [Infinity, "unknown"],
    [undefined, "unknown"],
    [null, "unknown"],
    ["", "unknown"],
    ["not a number", "unknown"],
    ["800", "tablet"],
  ];

  for (const [input, expected] of cases) {
    it(`${JSON.stringify(input) ?? String(input)} is ${expected}`, () => {
      expect(deviceFromWidth(input)).toBe(expected);
    });
  }

  it("only ever returns one of four buckets", () => {
    const allowed = new Set(["phone", "tablet", "desktop", "unknown"]);
    for (let w = -5; w < 2200; w += 7) expect(allowed.has(deviceFromWidth(w))).toBe(true);
  });
});

describe("isKnownEvent", () => {
  const known = [
    "donate-form-opened",
    "donate-form-submitted",
    "upi-copied",
    "account-copied",
    "receipt-printed",
    "magazine-opened",
    "music-played",
    "radio-tuned",
    "desk-played",
    "sponsor-enquiry",
    "institute-enquiry",
    "feedback-sent",
    "route-to-pandal",
  ];

  for (const name of known) {
    it(`accepts ${name}`, () => expect(isKnownEvent(name)).toBe(true));
  }

  it("rejects anything not on the allowlist", () => {
    for (const name of [
      "",
      " ",
      "donate",
      "donate-form-open",
      "Donate-Form-Opened",
      "donate-form-opened ",
      " donate-form-opened",
      "__proto__",
      "constructor",
      "toString",
      "hasOwnProperty",
      "drop table events",
      "a".repeat(200),
    ]) {
      expect(isKnownEvent(name), JSON.stringify(name)).toBe(false);
    }
  });
});

describe("kolkataDay", () => {
  it("is an ISO date", () => {
    expect(kolkataDay()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
