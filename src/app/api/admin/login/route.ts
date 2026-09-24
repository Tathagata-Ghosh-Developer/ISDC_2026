import { NextResponse } from "next/server";
import {
  checkCredentials,
  createSession,
  destroySession,
  authConfigured,
} from "@/lib/auth";
import { blockedFor, clientIp, recordFailure, rateLimitReset } from "@/lib/ratelimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** A fixed cost on every attempt, so timing reveals nothing. */
function delay() {
  return new Promise((r) => setTimeout(r, 350));
}

/**
 * Two locks, and both count failures only.
 *
 * The whole campus reaches this server from a handful of addresses, and
 * so does every phone on Jio. The old lock counted every attempt per
 * address, successful or not, so the sixth person to sign in from the
 * hostel Wi-Fi inside ten minutes was shut out for a quarter of an hour
 * along with everybody else there.
 *
 * Now a name is locked after five wrong passphrases, which stops anyone
 * guessing at one account, and an address after forty wrong ones across
 * any names, which stops anyone working down a list. Signing in
 * correctly never counts against anybody.
 */
const PER_NAME = { max: 5, windowMs: 10 * 60_000, blockMs: 15 * 60_000 };
const PER_ADDRESS = { max: 40, windowMs: 10 * 60_000, blockMs: 15 * 60_000 };

function tooMany(retryAfter: number) {
  return NextResponse.json(
    { ok: false, error: "Too many wrong attempts. Try again in a quarter of an hour." },
    { status: 429, headers: { "retry-after": String(retryAfter) } },
  );
}

export async function POST(req: Request) {
  if (!authConfigured()) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Sign in is not configured. Set AUTH_SECRET and at least one of ADMIN_USERS, COMMITTEE_USERS, FUNDRAISER_USERS or VIEWER_USERS.",
      },
      { status: 503 },
    );
  }

  const { user, password } = (await req.json().catch(() => ({}))) as {
    user?: string;
    password?: string;
  };

  const ip = clientIp(req);
  const name = (user ?? "").trim().toLowerCase().slice(0, 64);
  const addressKey = `login-ip:${ip}`;
  const nameKey = `login-name:${name}:${ip}`;

  const wait = Math.max(blockedFor(addressKey), blockedFor(nameKey));
  if (wait > 0) return tooMany(wait);

  await delay();

  const role = name && password ? checkCredentials(name, password) : null;

  if (!role) {
    recordFailure(nameKey, PER_NAME);
    recordFailure(addressKey, PER_ADDRESS);
    return NextResponse.json(
      { ok: false, error: "Those credentials were not recognised." },
      { status: 401 },
    );
  }

  rateLimitReset(nameKey);
  await createSession(name, role);
  return NextResponse.json({ ok: true, role });
}

export async function DELETE() {
  await destroySession();
  return NextResponse.json({ ok: true });
}
