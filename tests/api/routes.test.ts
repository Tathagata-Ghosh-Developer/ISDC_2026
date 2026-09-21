/**
 * The API as HTTP.
 *
 * Every request below goes over the wire to a real `next start`. See
 * tests/api/servers.ts for the two instances and why there are two.
 *
 * Nothing here creates data. The database-backed instance points at a
 * closed local port, so a submission that passes validation fails at
 * the insert, which is itself worth asserting: a donor must get a
 * sentence, not a stack trace, on the day the database is down.
 */
import { describe, expect, it } from "vitest";
import { BASE_DB_DOWN, BASE_NO_DB } from "./servers";

/* ---------------------------------------------------------------- */

let counter = 0;

/**
 * A fresh forwarded address per request. The limiter buckets by it, so
 * without this the fifth donation test of the file would be a 429.
 */
function freshIp(): string {
  const n = ++counter;
  return `10.${(n >> 16) & 255}.${(n >> 8) & 255}.${n & 255}`;
}

function headers(extra: Record<string, string> = {}, ip = freshIp()) {
  return { "x-forwarded-for": ip, ...extra };
}

/** Nothing a visitor sees may contain a stack frame or a file path. */
function expectNoStackTrace(body: string, where: string) {
  for (const smell of [
    "\n    at ",
    "node_modules",
    ".next/server",
    "webpack-internal",
    "src/app/api",
    "src\\app\\api",
    "TypeError",
    "ReferenceError",
  ]) {
    expect(body.includes(smell), `${where} leaked ${JSON.stringify(smell)}: ${body.slice(0, 400)}`).toBe(false);
  }
}

/** Errors are for people: a sentence, not a code, and not a novel. */
function expectHumanError(body: string, where: string) {
  expectNoStackTrace(body, where);
  let message = body;
  try {
    const json = JSON.parse(body) as { error?: unknown };
    expect(typeof json.error, `${where} has no error field: ${body.slice(0, 200)}`).toBe("string");
    message = String(json.error);
  } catch {
    // Plain-text errors (the CSV export) are allowed.
  }
  expect(message.trim().length, where).toBeGreaterThan(3);
  expect(message.length, where).toBeLessThan(400);
}

function donationForm(fields: Record<string, string>): FormData {
  const form = new FormData();
  for (const [k, v] of Object.entries(fields)) form.append(k, v);
  return form;
}

const VALID_DONATION = {
  name: "Test Donor",
  email: "test.donor@example.com",
  phone: "9876543210",
  amount: "501",
  category: "guest",
  method: "upi",
};

/* ================================================================
   /api/donations
   ================================================================ */

describe("POST /api/donations, with no database configured", () => {
  it("refuses politely instead of falling over", async () => {
    const res = await fetch(`${BASE_NO_DB}/api/donations`, {
      method: "POST",
      headers: headers(),
      body: donationForm(VALID_DONATION),
    });
    const body = await res.text();
    expect(res.status).toBe(503);
    expectHumanError(body, "donations/no-db");
    expect(body).toContain("not open yet");
  });
});

describe("POST /api/donations validation", () => {
  const post = (body: BodyInit, extra: Record<string, string> = {}) =>
    fetch(`${BASE_DB_DOWN}/api/donations`, { method: "POST", headers: headers(extra), body });

  const postForm = (fields: Record<string, string>) => post(donationForm(fields));

  async function expect400(fields: Record<string, string>, fragment: string) {
    const res = await postForm(fields);
    const body = await res.text();
    expect(res.status, `${fragment}: ${body.slice(0, 200)}`).toBe(400);
    expectHumanError(body, fragment);
    expect(body.toLowerCase()).toContain(fragment.toLowerCase());
    return body;
  }

  it("rejects a body that is not a form at all", async () => {
    const res = await post("this is not a form", { "content-type": "text/plain" });
    const body = await res.text();
    expect(res.status).toBe(400);
    expectHumanError(body, "not-a-form");
    expect(body).toContain("Could not read the form");
  });

  it("rejects JSON, which is what a mistaken integration would send", async () => {
    const res = await post(JSON.stringify(VALID_DONATION), {
      "content-type": "application/json",
    });
    const body = await res.text();
    expect(res.status).toBe(400);
    expectHumanError(body, "json-body");
  });

  it("rejects an empty form", () => expect400({}, "give the name"));

  it("rejects a one-character name", () =>
    expect400({ ...VALID_DONATION, name: "A" }, "give the name"));

  it("rejects a name that is only whitespace", () =>
    expect400({ ...VALID_DONATION, name: "     " }, "give the name"));

  it("makes a student give an institute email", () =>
    expect400({ ...VALID_DONATION, category: "student", email: "" }, "SR number"));

  it("rejects a malformed email from anybody", () =>
    expect400({ ...VALID_DONATION, email: "not-an-email" }, "does not look right"));

  it("rejects an email with no domain dot", () =>
    expect400({ ...VALID_DONATION, email: "someone@localhost" }, "does not look right"));

  it("rejects an email with a space in it", () =>
    expect400({ ...VALID_DONATION, email: "some one@example.com" }, "does not look right"));

  it("rejects a phone number that is not ten digits", async () => {
    await expect400({ ...VALID_DONATION, phone: "12345" }, "ten digits");
    await expect400({ ...VALID_DONATION, phone: "" }, "ten digits");
    await expect400({ ...VALID_DONATION, phone: "abcdefghij" }, "ten digits");
  });

  it("rejects a non-numeric amount", async () => {
    await expect400({ ...VALID_DONATION, amount: "five hundred" }, "Enter the amount");
    await expect400({ ...VALID_DONATION, amount: "" }, "Enter the amount");
    await expect400({ ...VALID_DONATION, amount: "NaN" }, "Enter the amount");
    await expect400({ ...VALID_DONATION, amount: "1e" }, "Enter the amount");
  });

  it("rejects zero and negative amounts", async () => {
    await expect400({ ...VALID_DONATION, amount: "0" }, "Enter the amount");
    await expect400({ ...VALID_DONATION, amount: "-500" }, "Enter the amount");
  });

  it("rejects an amount large enough to be a typo", () =>
    expect400({ ...VALID_DONATION, amount: "99999999" }, "looks like a typo"));

  it("rejects Infinity dressed up as an amount", async () => {
    // Number("Infinity") is not finite, so this is caught by the
    // "enter an amount" check rather than the typo ceiling.
    await expect400({ ...VALID_DONATION, amount: "Infinity" }, "Enter the amount");
    await expect400({ ...VALID_DONATION, amount: "-Infinity" }, "Enter the amount");
  });

  it("rejects an unknown donor category", () =>
    expect400({ ...VALID_DONATION, category: "vice-chancellor" }, "Pick who you are"));

  it("rejects an unknown payment method", () =>
    expect400({ ...VALID_DONATION, method: "bitcoin" }, "Pick how you paid"));

  it("survives an oversized text field without a 500", async () => {
    // 100 kB in a field the form caps at 120 characters. It must be
    // truncated, not crash, so the request should still fall through
    // to the next validation message.
    const body = await expect400(
      { ...VALID_DONATION, name: "x".repeat(100_000), phone: "123" },
      "ten digits",
    );
    expect(body.length).toBeLessThan(400);
  });

  it("survives an oversized message and display name", () =>
    expect400(
      {
        ...VALID_DONATION,
        message: "y".repeat(50_000),
        display_name: "z".repeat(50_000),
        reference: "r".repeat(50_000),
        sr_number: "s".repeat(50_000),
        amount: "abc",
      },
      "Enter the amount",
    ));

  it("rejects a proof file over five megabytes", async () => {
    const form = donationForm(VALID_DONATION);
    form.append(
      "proof",
      new File([new Uint8Array(5 * 1024 * 1024 + 16)], "huge.jpg", { type: "image/jpeg" }),
      "huge.jpg",
    );
    const res = await post(form);
    const body = await res.text();
    expect(res.status).toBe(400);
    expectHumanError(body, "oversize-proof");
    expect(body).toContain("5 MB");
  });

  it("rejects a proof that is not an image or a PDF", async () => {
    const form = donationForm(VALID_DONATION);
    form.append("proof", new File(["MZ"], "payload.exe", { type: "application/x-msdownload" }));
    const res = await post(form);
    const body = await res.text();
    expect(res.status).toBe(400);
    expectHumanError(body, "bad-proof-type");
    expect(body).toContain("image or a PDF");
  });

  it("gives a donor a sentence, not a stack trace, when the database is down", async () => {
    const res = await post(donationForm(VALID_DONATION));
    const body = await res.text();
    expect(res.status).toBe(500);
    expectHumanError(body, "donations/db-down");
    expect(body).toContain("treasurer");
    expect(body).not.toContain("127.0.0.1");
    expect(body).not.toContain("supabase");
  });

  it("never echoes the donor's own details back in an error", async () => {
    const res = await postForm({ ...VALID_DONATION, phone: "1", email: "leak@example.com" });
    const body = await res.text();
    expect(body).not.toContain("leak@example.com");
    expect(body).not.toContain("Test Donor");
  });

  it("throttles after five submissions from one address", async () => {
    const ip = "198.51.100.42";
    const results: number[] = [];
    for (let i = 0; i < 7; i++) {
      const res = await fetch(`${BASE_DB_DOWN}/api/donations`, {
        method: "POST",
        headers: headers({}, ip),
        body: donationForm({ ...VALID_DONATION, amount: "abc" }),
      });
      results.push(res.status);
      if (res.status === 429) {
        const body = await res.text();
        expectHumanError(body, "donations/429");
        expect(res.headers.get("retry-after")).toMatch(/^\d+$/);
        expect(body).toContain("Wait a few minutes");
      } else {
        await res.text();
      }
    }
    expect(results.slice(0, 5).every((s) => s === 400), results.join(",")).toBe(true);
    expect(results[5]).toBe(429);
    expect(results[6]).toBe(429);
  });

  it("answers 405 to a GET", async () => {
    const res = await fetch(`${BASE_NO_DB}/api/donations`, { headers: headers() });
    expect(res.status).toBe(405);
    expectNoStackTrace(await res.text(), "donations/GET");
  });
});

/* ================================================================
   /api/enquiries
   ================================================================ */

describe("POST /api/enquiries", () => {
  const post = (body: unknown, extra: Record<string, string> = {}) =>
    fetch(`${BASE_NO_DB}/api/enquiries`, {
      method: "POST",
      headers: headers({ "content-type": "application/json", ...extra }),
      body: typeof body === "string" ? body : JSON.stringify(body),
    });

  const VALID = {
    kind: "sponsor",
    name: "A Company",
    message: "We would like to sponsor the pandal this year, please send the deck.",
    email: "contact@example.com",
  };

  async function expect400(body: unknown, fragment: string) {
    const res = await post(body);
    const text = await res.text();
    expect(res.status, `${fragment}: ${text.slice(0, 200)}`).toBe(400);
    expectHumanError(text, fragment);
    expect(text.toLowerCase()).toContain(fragment.toLowerCase());
  }

  it("answers the honeypot with success and stores nothing", async () => {
    // Proof that nothing was stored: this instance has no database, so
    // a message that reached the insert would come back 503. A 200
    // means the request was answered and dropped before that point.
    const res = await post({ ...VALID, website: "http://spam.example" });
    const text = await res.text();
    expect(res.status).toBe(200);
    expect(JSON.parse(text)).toEqual({ ok: true });
    expect(text).not.toContain("error");
  });

  it("treats the honeypot as filled even when nothing else is valid", async () => {
    const res = await post({ website: "x" });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
  });

  it("does not treat an empty honeypot as filled", async () => {
    const res = await post({ ...VALID, website: "" });
    expect(res.status).toBe(503); // reached the insert, which is absent
    expectHumanError(await res.text(), "enquiries/empty-honeypot");
  });

  it("rejects an unknown kind", () => expect400({ ...VALID, kind: "ransom" }, "Unknown kind"));

  it("rejects a missing or one-character name", async () => {
    await expect400({ ...VALID, name: "" }, "Tell us your name");
    await expect400({ ...VALID, name: "A" }, "Tell us your name");
    await expect400({ ...VALID, name: "   " }, "Tell us your name");
  });

  it("rejects a message too short to answer", async () => {
    await expect400({ ...VALID, message: "hi" }, "Write a line or two more");
    await expect400({ ...VALID, message: "" }, "Write a line or two more");
  });

  it("rejects a message with no way to reply to it", () =>
    expect400({ ...VALID, email: "", phone: "" }, "we cannot reply"));

  it("rejects a malformed email", async () => {
    await expect400({ ...VALID, email: "not-an-email" }, "does not look right");
    await expect400({ ...VALID, email: "a@b.c" }, "does not look right"); // one-letter TLD
  });

  it("accepts a phone number instead of an email", async () => {
    const res = await post({ ...VALID, email: "", phone: "+91 98765 43210" });
    expect(res.status).toBe(503); // valid, and then there is no inbox
    const text = await res.text();
    expectHumanError(text, "enquiries/phone-only");
    expect(text).toContain("write to us directly");
  });

  it("treats a malformed JSON body as an empty one", async () => {
    const res = await post("{not json");
    const text = await res.text();
    expect(res.status).toBe(400);
    expectHumanError(text, "enquiries/bad-json");
    expect(text).toContain("Tell us your name");
  });

  it("treats no body at all as an empty one", async () => {
    const res = await fetch(`${BASE_NO_DB}/api/enquiries`, {
      method: "POST",
      headers: headers({ "content-type": "application/json" }),
    });
    expect(res.status).toBe(400);
    expectHumanError(await res.text(), "enquiries/no-body");
  });

  it("survives a very long message without a 500", async () => {
    const res = await post({ ...VALID, message: "m".repeat(200_000) });
    expect([200, 503]).toContain(res.status);
    expectNoStackTrace(await res.text(), "enquiries/long-message");
  });

  it("throttles after four messages from one address", async () => {
    const ip = "198.51.100.77";
    const results: number[] = [];
    for (let i = 0; i < 6; i++) {
      const res = await fetch(`${BASE_NO_DB}/api/enquiries`, {
        method: "POST",
        headers: headers({ "content-type": "application/json" }, ip),
        body: JSON.stringify({ ...VALID, name: "" }),
      });
      results.push(res.status);
      if (res.status === 429) {
        expect(res.headers.get("retry-after")).toMatch(/^\d+$/);
        expectHumanError(await res.text(), "enquiries/429");
      } else {
        await res.text();
      }
    }
    expect(results.slice(0, 4).every((s) => s === 400), results.join(",")).toBe(true);
    expect(results[4]).toBe(429);
  });

  it("answers 405 to a GET", async () => {
    const res = await fetch(`${BASE_NO_DB}/api/enquiries`, { headers: headers() });
    expect(res.status).toBe(405);
  });
});

/* ================================================================
   /api/track
   ================================================================ */

describe("POST /api/track", () => {
  const post = (body: unknown) =>
    fetch(`${BASE_NO_DB}/api/track`, {
      method: "POST",
      headers: headers({ "content-type": "application/json" }),
      body: typeof body === "string" ? body : JSON.stringify(body),
    });

  it("accepts a page view", async () => {
    const res = await post({ path: "/daan", referrer: "", width: 1280, first: true });
    expect(res.status).toBe(204);
    expect(await res.text()).toBe("");
  });

  it("accepts a known event", async () => {
    const res = await post({ event: "donate-form-opened" });
    expect(res.status).toBe(204);
  });

  it("drops an unknown event without telling the page about it", async () => {
    // The route answers 204 whatever happens, on purpose: a counter
    // must never make a page show an error. The rejection itself is
    // isKnownEvent's, and is asserted in tests/analytics.test.ts.
    const res = await post({ event: "not-a-real-event" });
    expect(res.status).toBe(204);
    expect(await res.text()).toBe("");
  });

  it("never returns a body, an error or a cookie", async () => {
    for (const body of [
      { path: "/daan" },
      { event: "drop table events" },
      { event: "x".repeat(5000) },
      { path: 12345 },
      { width: "enormous" },
      {},
      "not json at all",
      "null",
    ]) {
      const res = await post(body);
      expect(res.status, JSON.stringify(body).slice(0, 60)).toBe(204);
      expect(await res.text()).toBe("");
      expect(res.headers.get("set-cookie")).toBeNull();
    }
  });

  it("swallows a path carrying a receipt token", async () => {
    const res = await post({ path: "/receipt/8f14e45f-ceea-467a-9a4f-9b2c1d3e4f50" });
    expect(res.status).toBe(204);
  });

  it("answers 405 to a GET", async () => {
    const res = await fetch(`${BASE_NO_DB}/api/track`, { headers: headers() });
    expect(res.status).toBe(405);
  });
});

/* ================================================================
   /api/keepalive
   ================================================================ */

describe("GET /api/keepalive", () => {
  it("says so plainly when there is no database", async () => {
    const res = await fetch(`${BASE_NO_DB}/api/keepalive`, { headers: headers() });
    expect(res.status).toBe(503);
    const body = await res.json();
    expect(body).toEqual({ ok: false, db: "not configured" });
  });

  it("reports a failed query without leaking the connection string", async () => {
    const res = await fetch(`${BASE_DB_DOWN}/api/keepalive`, { headers: headers() });
    const text = await res.text();
    expect(res.status).toBe(500);
    expectNoStackTrace(text, "keepalive/db-down");
    expect(JSON.parse(text)).toEqual({ ok: false, error: "query failed" });
    expect(text).not.toContain("127.0.0.1");
  });

  it("does not claim to be a scheduled call when it is not", async () => {
    const res = await fetch(`${BASE_NO_DB}/api/keepalive`, {
      headers: headers({ authorization: "Bearer guessed-secret" }),
    });
    const body = await res.json();
    expect(body.scheduled).not.toBe(true);
  });

  it("answers 405 to a POST", async () => {
    const res = await fetch(`${BASE_NO_DB}/api/keepalive`, {
      method: "POST",
      headers: headers(),
    });
    expect(res.status).toBe(405);
  });
});

/* ================================================================
   /api/admin/*  with no session
   ================================================================ */

/** Every admin route, and every method it exports. */
const ADMIN_ROUTES: { path: string; methods: string[] }[] = [
  { path: "/api/admin/config", methods: ["POST", "DELETE"] },
  { path: "/api/admin/donations", methods: ["GET", "POST", "PATCH", "DELETE"] },
  { path: "/api/admin/enquiries", methods: ["GET", "PATCH", "DELETE"] },
  { path: "/api/admin/expenses", methods: ["GET", "POST", "DELETE"] },
  { path: "/api/admin/export", methods: ["GET"] },
  { path: "/api/admin/proof", methods: ["POST"] },
  { path: "/api/admin/receipt", methods: ["POST"] },
];

describe("the console with no session", () => {
  for (const { path, methods } of ADMIN_ROUTES) {
    for (const method of methods) {
      it(`${method} ${path} is 401`, async () => {
        const res = await fetch(`${BASE_NO_DB}${path}`, {
          method,
          headers: headers(method === "GET" ? {} : { "content-type": "application/json" }),
          body: method === "GET" ? undefined : JSON.stringify({ id: "1", key: "x", value: 1 }),
        });
        const text = await res.text();
        expect(res.status, `${method} ${path}: ${text.slice(0, 200)}`).toBe(401);
        expectHumanError(text, `${method} ${path}`);
        expect(res.headers.get("set-cookie")).toBeNull();
      });
    }
  }

  it("is 401 even when the request carries a forged session cookie", async () => {
    for (const cookie of [
      "isdc_session=forged",
      "isdc_session=" +
        "eyJhbGciOiJub25lIn0.eyJ1IjoidGF0aGFnYXRhIiwiciI6ImFkbWluIn0.",
      "isdc_admin=1",
    ]) {
      const res = await fetch(`${BASE_NO_DB}/api/admin/donations`, {
        headers: headers({ cookie }),
      });
      expect(res.status, cookie.slice(0, 30)).toBe(401);
      await res.text();
    }
  });

  it("is 401 on the database-backed instance too, before any query runs", async () => {
    for (const { path, methods } of ADMIN_ROUTES) {
      const res = await fetch(`${BASE_DB_DOWN}${path}`, {
        method: methods[0],
        headers: headers(),
      });
      expect(res.status, `${methods[0]} ${path}`).toBe(401);
      await res.text();
    }
  });

  it("refuses a method no route exports", async () => {
    for (const path of ["/api/admin/export", "/api/admin/receipt", "/api/admin/proof"]) {
      const res = await fetch(`${BASE_NO_DB}${path}`, { method: "PUT", headers: headers() });
      expect([401, 405], `PUT ${path} gave ${res.status}`).toContain(res.status);
      await res.text();
    }
  });
});

describe("POST /api/admin/login with no accounts configured", () => {
  it("says sign-in is not configured rather than signing anybody in", async () => {
    const res = await fetch(`${BASE_NO_DB}/api/admin/login`, {
      method: "POST",
      headers: headers({ "content-type": "application/json" }),
      body: JSON.stringify({ user: "admin", password: "admin" }),
    });
    const text = await res.text();
    expect(res.status).toBe(503);
    expectHumanError(text, "login/not-configured");
    expect(res.headers.get("set-cookie")).toBeNull();
    expect(text).not.toContain("AUTH_SECRET=");
  });

  it("never returns a session for an empty body", async () => {
    const res = await fetch(`${BASE_NO_DB}/api/admin/login`, {
      method: "POST",
      headers: headers({ "content-type": "application/json" }),
      body: "{}",
    });
    expect([401, 503]).toContain(res.status);
    expect(res.headers.get("set-cookie")).toBeNull();
    await res.text();
  });

  it("lets anybody sign out without erroring", async () => {
    const res = await fetch(`${BASE_NO_DB}/api/admin/login`, {
      method: "DELETE",
      headers: headers(),
    });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
  });
});

/* ================================================================
   Headers that protect the receipts
   ================================================================ */

describe("security headers", () => {
  it("sets a content security policy on every page", async () => {
    const res = await fetch(`${BASE_NO_DB}/`, { headers: headers() });
    const csp = res.headers.get("content-security-policy");
    expect(csp).toBeTruthy();
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("object-src 'none'");
    expect(res.headers.get("x-frame-options")).toBe("DENY");
    expect(res.headers.get("x-content-type-options")).toBe("nosniff");
    expect(res.headers.get("referrer-policy")).toBe("strict-origin-when-cross-origin");
    expect(res.headers.get("x-powered-by")).toBeNull();
  });

  it("keeps receipts out of every index and cache", async () => {
    const res = await fetch(
      `${BASE_NO_DB}/receipt/8f14e45f-ceea-467a-9a4f-9b2c1d3e4f50`,
      { headers: headers() },
    );
    expect(res.headers.get("x-robots-tag")).toContain("noindex");
    expect(res.headers.get("cache-control")).toContain("no-store");
  });

  it("keeps the console out of every index", async () => {
    const res = await fetch(`${BASE_NO_DB}/admin`, { headers: headers() });
    expect(res.headers.get("x-robots-tag")).toContain("noindex");
    expect(res.headers.get("cache-control")).toContain("no-store");
  });

  it("disallows the console and the receipts in robots.txt", async () => {
    const res = await fetch(`${BASE_NO_DB}/robots.txt`, { headers: headers() });
    const text = await res.text();
    expect(text).toContain("/admin");
    expect(text).toContain("/receipt");
  });

  it("keeps receipts out of the sitemap", async () => {
    const res = await fetch(`${BASE_NO_DB}/sitemap.xml`, { headers: headers() });
    const text = await res.text();
    expect(text).not.toContain("/receipt");
    expect(text).not.toContain("/admin");
  });
});
