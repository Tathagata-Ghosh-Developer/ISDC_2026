import { NextResponse } from "next/server";
import {
  cleanPath,
  cleanReferrer,
  deviceFromWidth,
  recordEvent,
  recordVisit,
} from "@/lib/analytics";
import { clientKey, rateLimit } from "@/lib/ratelimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * The counter.
 *
 * Everything that arrives here is thrown away except a path, a
 * referring host, a screen size bucket and a flag saying whether this
 * is the first page of the visit. The address the request came from is
 * used for one thing, rate limiting, and is never written down.
 *
 * It answers 204 whatever happens, because a counter that makes the
 * page show an error is worse than a counter that misses a view.
 */
export async function POST(req: Request) {
  const key = clientKey(req, "track");
  // Sized for a shared campus or carrier address, not one browser.
  if (!rateLimit(key, { max: 1200, windowMs: 60_000 }).ok) {
    return new NextResponse(null, { status: 204 });
  }

  try {
    const body = (await req.json()) as {
      path?: string;
      referrer?: string;
      width?: number;
      first?: boolean;
      event?: string;
    };

    if (body.event) {
      await recordEvent(String(body.event).slice(0, 40));
      return new NextResponse(null, { status: 204 });
    }

    if (!body.path) return new NextResponse(null, { status: 204 });

    const self = new URL(req.url).hostname;
    await recordVisit({
      path: cleanPath(String(body.path)),
      referrer: cleanReferrer(body.referrer, self),
      device: deviceFromWidth(body.width),
      first: body.first === true,
    });
  } catch {
    // A counter never breaks a page.
  }

  return new NextResponse(null, { status: 204 });
}
