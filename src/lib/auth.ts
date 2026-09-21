import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

/**
 * Three ways into the console.
 *
 * There is no user table, no email provider and no OAuth. The
 * committee is a handful of people and the accounts rotate once a
 * year, so credentials live in environment variables and the session
 * is a signed cookie.
 *
 *   ADMIN_USERS="tathagata:one-long-passphrase,arnab:another-one"
 *   COMMITTEE_USERS="devraj:passphrase,sirshendu:passphrase"
 *   VIEWER_USERS="probash:passphrase"
 *
 * admin      everything, including approving and deleting entries,
 *            editing the site's copy and exporting the ledger.
 * committee  enters donations on a donor's behalf, sees the running
 *            total, and sees the core committee's contact sheet.
 *            Cannot approve, delete, or change anything on the site.
 * viewer     the board, by name and amount, with no total. The same
 *            thing the public sees, behind a login, for anyone the
 *            committee wants to give a named account to.
 *
 * A name may appear in only one table. If it appears in two the
 * stronger role wins, which is checked at load so a typo cannot
 * quietly demote an administrator.
 */

const COOKIE = "isdc_session";
const MAX_AGE = 60 * 60 * 12; // 12 hours

export type Role = "admin" | "committee" | "viewer";

/** Higher number, more power. Used for at-least comparisons. */
const RANK: Record<Role, number> = { viewer: 1, committee: 2, admin: 3 };

export type Session = { user: string; role: Role };

function secret(): Uint8Array {
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 32) {
    throw new Error("AUTH_SECRET must be set to at least 32 characters.");
  }
  return new TextEncoder().encode(s);
}

/** Parses one "name:passphrase,name:passphrase" variable. */
function parsePairs(raw: string | undefined): [string, string][] {
  const out: [string, string][] = [];
  for (const pair of (raw ?? "").trim().split(",")) {
    const idx = pair.indexOf(":");
    if (idx < 1) continue;
    const name = pair.slice(0, idx).trim().toLowerCase();
    const password = pair.slice(idx + 1);
    if (!name || !password) continue;
    out.push([name, password]);
  }
  return out;
}

type Account = { password: string; role: Role };

/**
 * Built fresh on each call rather than cached, so rotating a
 * passphrase on the host takes effect on the next sign in instead of
 * on the next deploy.
 */
function accounts(): Map<string, Account> {
  const table = new Map<string, Account>();

  const add = (name: string, password: string, role: Role) => {
    const existing = table.get(name);
    if (existing && RANK[existing.role] >= RANK[role]) return;
    table.set(name, { password, role });
  };

  for (const [n, p] of parsePairs(process.env.VIEWER_USERS)) add(n, p, "viewer");
  for (const [n, p] of parsePairs(process.env.COMMITTEE_USERS))
    add(n, p, "committee");
  for (const [n, p] of parsePairs(process.env.ADMIN_USERS)) add(n, p, "admin");

  const single = process.env.ADMIN_PASSWORD;
  if (single) add("admin", single, "admin");

  return table;
}

/** Constant-time-ish comparison so a wrong password leaks no length. */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** The role this name and passphrase earn, or null. */
export function checkCredentials(user: string, password: string): Role | null {
  const account = accounts().get(user.trim().toLowerCase());
  if (!account) return null;
  return safeEqual(account.password, password) ? account.role : null;
}

export async function createSession(user: string, role: Role): Promise<void> {
  const token = await new SignJWT({ u: user.trim().toLowerCase(), r: role })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(secret());

  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function destroySession(): Promise<void> {
  const jar = await cookies();
  jar.delete(COOKIE);
  jar.delete("isdc_admin"); // the single-role cookie this replaced
}

function isRole(v: unknown): v is Role {
  return v === "admin" || v === "committee" || v === "viewer";
}

/** Whoever is signed in, or null. */
export async function currentSession(): Promise<Session | null> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    if (typeof payload.u !== "string" || !isRole(payload.r)) return null;
    return { user: payload.u, role: payload.r };
  } catch {
    return null;
  }
}

/**
 * Throws unless the caller holds at least this role. Every write in
 * the console goes through here, so a route that forgets to name a
 * role gets the strongest one by default rather than the weakest.
 */
export async function requireRole(min: Role = "admin"): Promise<Session> {
  const session = await currentSession();
  if (!session) throw new Error("UNAUTHORISED");
  if (RANK[session.role] < RANK[min]) throw new Error("FORBIDDEN");
  return session;
}

export async function requireAdmin(): Promise<string> {
  return (await requireRole("admin")).user;
}

export async function requireCommittee(): Promise<Session> {
  return requireRole("committee");
}

export function atLeast(role: Role | null | undefined, min: Role): boolean {
  return Boolean(role) && RANK[role as Role] >= RANK[min];
}

/**
 * A secret shorter than 32 characters makes secret() throw, which used
 * to surface as an unexplained 500 on the login form. Check the length
 * here so the page can show the setup instructions instead.
 */
export function authConfigured(): boolean {
  return (process.env.AUTH_SECRET?.length ?? 0) >= 32 && accounts().size > 0;
}

/** For the setup notice: how many of each kind exist, never who. */
export function accountCounts(): Record<Role, number> {
  const counts: Record<Role, number> = { admin: 0, committee: 0, viewer: 0 };
  for (const a of accounts().values()) counts[a.role] += 1;
  return counts;
}
