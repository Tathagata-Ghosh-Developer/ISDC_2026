import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

/**
 * Admin sessions.
 *
 * No user table, no email provider, no OAuth. The committee is four
 * people and the account rotates once a year, so credentials live in
 * an environment variable and the session is a signed cookie.
 *
 *   ADMIN_USERS="deep:one-long-passphrase,pritam:another-one"
 *
 * Falls back to ADMIN_PASSWORD for a single shared login.
 */

const COOKIE = "isdc_admin";
const MAX_AGE = 60 * 60 * 12; // 12 hours

function secret(): Uint8Array {
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 32) {
    throw new Error("AUTH_SECRET must be set to at least 32 characters.");
  }
  return new TextEncoder().encode(s);
}

function adminTable(): Map<string, string> {
  const table = new Map<string, string>();
  const list = process.env.ADMIN_USERS?.trim();
  if (list) {
    for (const pair of list.split(",")) {
      const idx = pair.indexOf(":");
      if (idx < 1) continue;
      table.set(pair.slice(0, idx).trim().toLowerCase(), pair.slice(idx + 1));
    }
  }
  const single = process.env.ADMIN_PASSWORD;
  if (single) table.set("admin", single);
  return table;
}

/** Constant-time-ish comparison so a wrong password leaks no length. */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export function checkCredentials(user: string, password: string): boolean {
  const expected = adminTable().get(user.trim().toLowerCase());
  if (!expected) return false;
  return safeEqual(expected, password);
}

export async function createSession(user: string): Promise<void> {
  const token = await new SignJWT({ u: user.trim().toLowerCase() })
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
  (await cookies()).delete(COOKIE);
}

/** Returns the admin's username, or null when not signed in. */
export async function currentAdmin(): Promise<string | null> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    return typeof payload.u === "string" ? payload.u : null;
  } catch {
    return null;
  }
}

export async function requireAdmin(): Promise<string> {
  const admin = await currentAdmin();
  if (!admin) throw new Error("UNAUTHORISED");
  return admin;
}

/** True when the committee has configured at least one login. */
export function authConfigured(): boolean {
  return Boolean(process.env.AUTH_SECRET) && adminTable().size > 0;
}
