/**
 * Who may do what, over HTTP, against the built site.
 *
 * The instance on BASE_ROLES has one account of each role and a
 * database address that nothing listens on. So a request refused by
 * the role check comes back 401 or 403, and a request that passes it
 * fails later, at the database, without changing anything anywhere.
 * "Allowed" below therefore means "not 401 and not 403".
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { BASE_ROLES, TEST_ACCOUNTS, TEST_FUNDRAISER_NUMBERS } from "./servers";

type RoleName = keyof typeof TEST_ACCOUNTS;

let ipCounter = 0;
/** A different address per sign-in, unless a test is about sharing one. */
function freshIp() {
  ipCounter += 1;
  return `198.51.100.${(ipCounter % 250) + 1}`;
}

async function login(role: RoleName, ip = freshIp(), password?: string) {
  const a = TEST_ACCOUNTS[role];
  return fetch(`${BASE_ROLES}/api/admin/login`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": ip },
    body: JSON.stringify({ user: a.user, password: password ?? a.password }),
  });
}

/** Signs in and returns a Cookie header for the session. */
async function session(role: RoleName): Promise<string> {
  const res = await login(role);
  expect(res.status, `${role} could not sign in`).toBe(200);
  const cookie = res.headers.get("set-cookie") ?? "";
  const pair = cookie.split(";")[0];
  expect(pair).toMatch(/^isdc_session=/);
  await res.text();
  return pair;
}

async function call(
  cookie: string | null,
  method: string,
  path: string,
  body?: unknown,
): Promise<number> {
  const res = await fetch(`${BASE_ROLES}${path}`, {
    method,
    redirect: "manual",
    headers: {
      "content-type": "application/json",
      "x-forwarded-for": freshIp(),
      ...(cookie ? { cookie } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  await res.text();
  return res.status;
}

const DENIED = [401, 403];
const ID = "00000000-0000-4000-8000-000000000000";

const VALID_ENTRY = {
  name: "Test Donor",
  amount: 501,
  phone: "9876543210",
  category: "student",
  method: "cash",
};

/* ================================================================
   Signing in
   ================================================================ */

describe("signing in from one shared address", () => {
  it("lets eleven people on the same campus Wi-Fi all sign in", async () => {
    // The old limiter counted every attempt per address, so the sixth
    // correct sign-in from one address inside ten minutes was refused.
    const shared = "203.0.113.50";
    for (let i = 0; i < 11; i++) {
      const res = await login("fundraiser", shared);
      expect(res.status, `sign-in ${i + 1} from the shared address`).toBe(200);
      await res.text();
    }
  });

  it("locks a name after five wrong passphrases, even for the right one next", async () => {
    const ip = "203.0.113.60";
    for (let i = 0; i < 5; i++) {
      const res = await login("viewer", ip, "wrong-" + i);
      expect(res.status).toBe(401);
      await res.text();
    }
    const locked = await login("viewer", ip);
    expect(locked.status).toBe(429);
    expect(locked.headers.get("set-cookie")).toBeNull();
    await locked.text();
  });

  it("does not lock anybody else at that address", async () => {
    const res = await login("committee", "203.0.113.60");
    expect(res.status).toBe(200);
    await res.text();
  });

  it("allows one account signed in on several devices at once", async () => {
    const [a, b, c] = await Promise.all([
      session("fundraiser"),
      session("fundraiser"),
      session("fundraiser"),
    ]);
    for (const cookie of [a, b, c]) {
      expect(await call(cookie, "GET", "/api/admin/donations")).not.toBe(401);
    }
  });
});

/* ================================================================
   The permission matrix
   ================================================================ */

describe("a fund raiser", () => {
  it("may enter a donation", async () => {
    const cookie = await session("fundraiser");
    expect(DENIED).not.toContain(await call(cookie, "POST", "/api/admin/donations", VALID_ENTRY));
  });

  it("gets a validation message, not a refusal, for a bad entry", async () => {
    const cookie = await session("fundraiser");
    expect(await call(cookie, "POST", "/api/admin/donations", { name: "x" })).toBe(400);
  });

  it("may list donations (their own)", async () => {
    const cookie = await session("fundraiser");
    expect(DENIED).not.toContain(await call(cookie, "GET", "/api/admin/donations"));
  });

  it("may not tick a receipt as sent", async () => {
    const cookie = await session("fundraiser");
    expect(await call(cookie, "PATCH", "/api/admin/donations", { id: ID, action: "receipt-sent" })).toBe(403);
    expect(await call(cookie, "PATCH", "/api/admin/donations", { id: ID, action: "receipt-unsent" })).toBe(403);
  });

  it("may not send a receipt", async () => {
    const cookie = await session("fundraiser");
    expect(DENIED).toContain(await call(cookie, "POST", "/api/admin/receipt", { id: ID }));
  });

  it("may not edit a donor's details", async () => {
    const cookie = await session("fundraiser");
    expect(
      await call(cookie, "PATCH", "/api/admin/donations", {
        id: ID,
        action: "edit",
        fields: VALID_ENTRY,
      }),
    ).toBe(403);
  });

  it("may not verify, reject, delete or export", async () => {
    const cookie = await session("fundraiser");
    for (const action of ["verify", "reject", "pending"]) {
      expect(await call(cookie, "PATCH", "/api/admin/donations", { id: ID, action })).toBe(403);
    }
    expect(await call(cookie, "DELETE", "/api/admin/donations", { id: ID })).toBe(403);
    expect(DENIED).toContain(await call(cookie, "GET", "/api/admin/export?what=donations"));
  });

  it("is sent away from the contact sheet and the enquiries", async () => {
    const cookie = await session("fundraiser");
    for (const page of ["/admin/team", "/admin/enquiries", "/admin/visits", "/admin/content"]) {
      const status = await call(cookie, "GET", page);
      expect([307, 308], `${page} gave ${status}`).toContain(status);
    }
  });
});

describe("a committee member", () => {
  it("may tick and untick a receipt", async () => {
    const cookie = await session("committee");
    expect(DENIED).not.toContain(await call(cookie, "PATCH", "/api/admin/donations", { id: ID, action: "receipt-sent" }));
    expect(DENIED).not.toContain(await call(cookie, "PATCH", "/api/admin/donations", { id: ID, action: "receipt-unsent" }));
  });

  it("may edit a donor's details", async () => {
    const cookie = await session("committee");
    expect(
      DENIED,
    ).not.toContain(
      await call(cookie, "PATCH", "/api/admin/donations", { id: ID, action: "edit", fields: VALID_ENTRY }),
    );
  });

  it("may send a receipt", async () => {
    const cookie = await session("committee");
    expect(DENIED).not.toContain(await call(cookie, "POST", "/api/admin/receipt", { id: ID }));
  });

  it("may enter a donation", async () => {
    const cookie = await session("committee");
    expect(DENIED).not.toContain(await call(cookie, "POST", "/api/admin/donations", VALID_ENTRY));
  });

  it("may not approve an online declaration or delete", async () => {
    const cookie = await session("committee");
    expect(await call(cookie, "PATCH", "/api/admin/donations", { id: ID, action: "verify" })).toBe(403);
    expect(await call(cookie, "DELETE", "/api/admin/donations", { id: ID })).toBe(403);
  });

  it("reaches the contact sheet", async () => {
    const cookie = await session("committee");
    expect(await call(cookie, "GET", "/admin/team")).toBe(200);
  });
});

describe("the administrator", () => {
  it("may verify, delete and export", async () => {
    const cookie = await session("admin");
    expect(DENIED).not.toContain(await call(cookie, "PATCH", "/api/admin/donations", { id: ID, action: "verify" }));
    expect(DENIED).not.toContain(await call(cookie, "DELETE", "/api/admin/donations", { id: ID }));
    expect(DENIED).not.toContain(await call(cookie, "GET", "/api/admin/export?what=donations"));
  });
});

describe("a viewer and a stranger", () => {
  it("a viewer may not list or enter donations", async () => {
    const cookie = await session("viewer");
    expect(await call(cookie, "GET", "/api/admin/donations")).toBe(403);
    expect(await call(cookie, "POST", "/api/admin/donations", VALID_ENTRY)).toBe(403);
  });

  it("nobody signed in gets anything", async () => {
    expect(await call(null, "GET", "/api/admin/donations")).toBe(401);
    expect(await call(null, "POST", "/api/admin/donations", VALID_ENTRY)).toBe(401);
    expect(await call(null, "PATCH", "/api/admin/donations", { id: ID, action: "receipt-sent" })).toBe(401);
  });
});

/* ================================================================
   The fund raisers' numbers stay on the server
   ================================================================ */

describe("fund raisers' phone numbers", () => {
  const NUMBERS = TEST_FUNDRAISER_NUMBERS;

  it("appear on the contact sheet for the committee", async () => {
    const cookie = await session("committee");
    const res = await fetch(`${BASE_ROLES}/admin/team`, {
      headers: { cookie, "x-forwarded-for": freshIp() },
    });
    const html = await res.text();
    for (const n of NUMBERS) expect(html).toContain(n);
  });

  it("are in no JavaScript file a browser can download", () => {
    const root = fileURLToPath(new URL("../../.next/static", import.meta.url));
    const files: string[] = [];
    const walk = (dir: string) => {
      for (const f of readdirSync(dir)) {
        const p = join(dir, f);
        if (statSync(p).isDirectory()) walk(p);
        else if (p.endsWith(".js")) files.push(p);
      }
    };
    walk(root);
    expect(files.length).toBeGreaterThan(0);
    for (const f of files) {
      const text = readFileSync(f, "utf8");
      for (const n of NUMBERS) expect(text.includes(n), `${n} found in ${f}`).toBe(false);
    }
  });
});

/* ================================================================
   The donation board needs a login
   ================================================================ */

describe("the donation board", () => {
  async function board(cookie: string | null) {
    const res = await fetch(`${BASE_ROLES}/daan/board`, {
      headers: { "x-forwarded-for": freshIp(), ...(cookie ? { cookie } : {}) },
    });
    return { status: res.status, cache: res.headers.get("cache-control") ?? "", html: await res.text() };
  }

  it("shows a stranger the sign-in form and no list", async () => {
    const { status, html, cache } = await board(null);
    expect(status).toBe(200);
    expect(html).toContain("The donation board");
    expect(html).toContain("Sign in");
    expect(html).not.toContain("Everyone who gave");
    expect(html).not.toContain("How a name gets here");
    // A cached copy would be served to the next person to ask.
    expect(cache).toMatch(/private|no-store/);
  });

  for (const role of ["viewer", "fundraiser", "committee", "admin"] as const) {
    it(`shows the list to a signed-in ${role}`, async () => {
      const { status, html, cache } = await board(await session(role));
      expect(status).toBe(200);
      expect(html).toContain("Everyone who gave");
      expect(cache).toMatch(/private|no-store/);
    });
  }

  it("is not linked from the public pages", async () => {
    for (const page of ["/", "/daan", "/thikana", "/sponsors/proposal", "/no-such-page"]) {
      const res = await fetch(`${BASE_ROLES}${page}`, { headers: { "x-forwarded-for": freshIp() } });
      const html = await res.text();
      expect(html.includes('href="/daan/board"'), `${page} links to the board`).toBe(false);
    }
  });
});
