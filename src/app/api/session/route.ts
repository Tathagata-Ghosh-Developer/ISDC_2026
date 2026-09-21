import { NextResponse } from "next/server";
import { db, dbReady } from "@/lib/db";
import { cleanPath, cleanReferrer } from "@/lib/analytics";
import { clientKey, rateLimit } from "@/lib/ratelimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * The detailed tier, which only ever runs after somebody agrees.
 *
 * The counter at /api/track is about nobody and needs no permission.
 * This is different: it follows one visitor through a visit, records
 * what they arrived on, what they read, in what order, how far they
 * scrolled and what they pressed. That is genuinely useful to a
 * committee deciding where to put its effort, and it is personal data
 * under the DPDP Act 2023, so it happens only with consent and it
 * stops the moment consent is withdrawn.
 *
 * Even then: no address is stored, no fingerprint is computed, and the
 * session id is a random uuid that the browser holds and the server
 * cannot tie to a person. Every row carries the date it must be
 * deleted on.
 */

/** Keeps a stray field from becoming a stored essay. */
function text(v: unknown, max = 120): string | null {
  if (typeof v !== "string") return null;
  const s = v.trim().slice(0, max);
  return s || null;
}

function int(v: unknown, max = 100_000): number | null {
  const n = Number(v);
  if (!Number.isFinite(n)) return null;
  return Math.max(0, Math.min(max, Math.round(n)));
}

const ACTIONS = new Set([
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
  "gate-picked",
  "artform-opened",
  "song-played",
  "share-clicked",
  "outbound-clicked",
]);

export async function POST(req: Request) {
  // Generous, because one visitor legitimately sends one of these per
  // page, but not unlimited.
  if (!rateLimit(clientKey(req, "session"), { max: 200, windowMs: 60_000 }).ok) {
    return new NextResponse(null, { status: 204 });
  }
  if (!dbReady) return new NextResponse(null, { status: 204 });

  try {
    const body = (await req.json()) as Record<string, unknown>;
    const op = body.op;

    /* ---------- a visit begins ---------- */
    if (op === "start") {
      const self = new URL(req.url).hostname;
      const { data, error } = await db()
        .from("visitor_sessions")
        .insert({
          landing_path: cleanPath(String(body.path ?? "/")),
          referrer: cleanReferrer(text(body.referrer, 300), self),
          utm_source: text(body.utm_source, 60),
          utm_medium: text(body.utm_medium, 60),
          utm_campaign: text(body.utm_campaign, 60),
          utm_content: text(body.utm_content, 60),
          utm_term: text(body.utm_term, 60),
          device: text(body.device, 20),
          screen_w: int(body.screen_w, 20000),
          screen_h: int(body.screen_h, 20000),
          viewport_w: int(body.viewport_w, 20000),
          viewport_h: int(body.viewport_h, 20000),
          pixel_ratio: Math.min(8, Math.max(0, Number(body.pixel_ratio) || 1)),
          language: text(body.language, 20),
          languages: text(body.languages, 120),
          timezone: text(body.timezone, 60),
          platform: text(body.platform, 40),
          browser: text(body.browser, 40),
          connection: text(body.connection, 20),
          touch: body.touch === true,
          prefers_dark: body.prefers_dark === true,
          reduced_motion: body.reduced_motion === true,
          is_returning: body.is_returning === true,
        })
        .select("id")
        .single();

      if (error || !data) {
        console.error("[session] start", error?.message);
        return new NextResponse(null, { status: 204 });
      }
      return NextResponse.json({ id: data.id });
    }

    const id = text(body.id, 40);
    if (!id || !/^[0-9a-f-]{32,36}$/i.test(id)) {
      return new NextResponse(null, { status: 204 });
    }

    /* ---------- a page, or something pressed ---------- */
    if (op === "event") {
      const kind = body.kind === "action" ? "action" : body.kind === "exit" ? "exit" : "view";
      const name = text(body.name, 40);
      if (kind === "action" && (!name || !ACTIONS.has(name))) {
        return new NextResponse(null, { status: 204 });
      }

      await db().from("session_events").insert({
        session_id: id,
        seq: int(body.seq, 10_000) ?? 0,
        kind,
        path: body.path ? cleanPath(String(body.path)) : null,
        name,
        dwell_ms: int(body.dwell_ms, 86_400_000),
        scroll_pct: int(body.scroll_pct, 100),
      });

      await db()
        .from("visitor_sessions")
        .update({
          last_seen_at: new Date().toISOString(),
          page_count: int(body.page_count, 5000) ?? 1,
          duration_ms: int(body.duration_ms, 86_400_000) ?? 0,
          max_scroll: int(body.max_scroll, 100) ?? 0,
          ...(name === "donate-form-submitted" ? { donated: true } : {}),
        })
        .eq("id", id);

      return new NextResponse(null, { status: 204 });
    }

    /* ---------- consent withdrawn: erase the whole visit ---------- */
    if (op === "forget") {
      await db().from("visitor_sessions").delete().eq("id", id);
      return new NextResponse(null, { status: 204 });
    }
  } catch {
    // Analytics never breaks a page.
  }

  return new NextResponse(null, { status: 204 });
}
