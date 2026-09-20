import { NextResponse } from "next/server";
import {
  checkCredentials,
  createSession,
  destroySession,
  authConfigured,
} from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** A fixed cost on every attempt, so timing reveals nothing. */
function delay() {
  return new Promise((r) => setTimeout(r, 350));
}

export async function POST(req: Request) {
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

  await createSession(user);
  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  await destroySession();
  return NextResponse.json({ ok: true });
}
