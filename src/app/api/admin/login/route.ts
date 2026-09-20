import { NextResponse } from "next/server";
import {
  checkCredentials,
  createSession,
  destroySession,
  authConfigured,
} from "@/lib/auth";
import { clientKey, rateLimit, rateLimitReset } from "@/lib/ratelimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** A fixed cost on every attempt, so timing reveals nothing. */
function delay() {
  return new Promise((r) => setTimeout(r, 350));
}

export async function POST(req: Request) {
  // The fixed delay below slows a serial guesser and does nothing at
  // all to a parallel one, so the real protection is this lockout.
  const key = clientKey(req, "login");
  const limit = rateLimit(key, {
    max: 5,
    windowMs: 10 * 60_000,
    blockMs: 15 * 60_000,
  });
  if (!limit.ok) {
    return NextResponse.json(
      { ok: false, error: "Too many attempts. Try again in a quarter of an hour." },
      { status: 429, headers: { "retry-after": String(limit.retryAfter) } },
    );
  }

  if (!authConfigured()) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Admin access is not configured. Set AUTH_SECRET and ADMIN_USERS in the environment.",
      },
      { status: 503 },
    );
  }

  const { user, password } = (await req.json().catch(() => ({}))) as {
    user?: string;
    password?: string;
  };

  await delay();

  if (!user || !password || !checkCredentials(user, password)) {
    return NextResponse.json(
      { ok: false, error: "Those credentials were not recognised." },
      { status: 401 },
    );
  }

  rateLimitReset(key);
  await createSession(user);
  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  await destroySession();
  return NextResponse.json({ ok: true });
}
