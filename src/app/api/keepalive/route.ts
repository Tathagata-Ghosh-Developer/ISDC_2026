import { NextResponse } from "next/server";
import { db, dbReady } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Keeps the database awake.
 *
 * Supabase pauses a free project after seven days without a query. The
 * committee sets this up in September and the festival is in October,
 * so on any ordinary year the project would be asleep on the morning
 * it is first needed, and the first person to find out would be a
 * donor whose payment went through at the bank and nowhere else.
 *
 * An uptime checker fetching the home page does not fix this. The
 * visit counter runs in the browser, so a checker that never executes
 * JavaScript never touches the database, and the committee would have
 * a green dashboard over a paused project.
 *
 * So this route makes a real query, and Vercel's own scheduler calls
 * it once a day. Nothing to sign up for and nothing to remember.
 */
export async function GET(req: Request) {
  if (!dbReady) {
    return NextResponse.json({ ok: false, db: "not configured" }, { status: 503 });
  }

  // Vercel signs its scheduled calls when CRON_SECRET is set. Anyone
  // else gets the same harmless answer, because the worst this route
  // can do is count rows.
  const auth = req.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  const scheduled = Boolean(secret) && auth === `Bearer ${secret}`;

  const started = Date.now();

  // An uptime checker gives up at five seconds. Without this the route
  // sat on a dead connection for seven and the checker read a slow
  // database as an outage.
  const { error, count } = await db()
    .from("donations")
    .select("id", { count: "exact", head: true })
    .abortSignal(AbortSignal.timeout(4000));

  if (error) {
    console.error("[keepalive]", error.message);
    return NextResponse.json({ ok: false, error: "query failed" }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    scheduled,
    rows: count ?? 0,
    ms: Date.now() - started,
    at: new Date().toISOString(),
  });
}
