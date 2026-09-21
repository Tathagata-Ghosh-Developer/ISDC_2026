import { NextResponse } from "next/server";
import { db, dbReady } from "@/lib/db";
import { clientKey, rateLimit } from "@/lib/ratelimit";
import { recordEvent } from "@/lib/analytics";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Every message the public can send the committee.
 *
 * One route, one table, four kinds: a company asking about
 * sponsorship, another institute asking about the Puja, someone
 * telling us the site is broken, and everything else.
 *
 * The honeypot field below is named the way a password manager would
 * never fill it and a person never sees it. Most form spam fills
 * every input it finds, so a filled honeypot is answered with a
 * cheerful success and written nowhere.
 */

const KINDS = new Set(["sponsor", "institute", "feedback", "general"]);

const EVENT_FOR: Record<string, string> = {
  sponsor: "sponsor-enquiry",
  institute: "institute-enquiry",
  feedback: "feedback-sent",
};

export async function POST(req: Request) {
  const key = clientKey(req, "enquiry");
  const limit = rateLimit(key, { max: 4, windowMs: 10 * 60_000 });
  if (!limit.ok) {
    return NextResponse.json(
      { error: "That is several messages in a row. Try again shortly." },
      { status: 429, headers: { "retry-after": String(limit.retryAfter) } },
    );
  }

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const text = (k: string) => String(body[k] ?? "").trim();

  if (text("website")) {
    // Honeypot. Answer as though it worked and store nothing.
    return NextResponse.json({ ok: true });
  }

  const kind = text("kind") || "general";
  const name = text("name").slice(0, 120);
  const message = text("message").slice(0, 4000);
  const email = text("email").toLowerCase().slice(0, 160);
  const phone = text("phone").replace(/[^\d+]/g, "").slice(0, 16);

  if (!KINDS.has(kind)) {
    return NextResponse.json({ error: "Unknown kind." }, { status: 400 });
  }
  if (name.length < 2) {
    return NextResponse.json({ error: "Tell us your name." }, { status: 400 });
  }
  if (message.length < 10) {
    return NextResponse.json(
      { error: "Write a line or two more, so we can answer properly." },
      { status: 400 },
    );
  }
  if (!email && !phone) {
    return NextResponse.json(
      { error: "Leave an email address or a phone number, or we cannot reply." },
      { status: 400 },
    );
  }
  if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(email)) {
    return NextResponse.json(
      { error: "That email address does not look right." },
      { status: 400 },
    );
  }

  if (!dbReady) {
    return NextResponse.json(
      { error: "The committee's inbox is not connected yet. Please write to us directly." },
      { status: 503 },
    );
  }

  const { error } = await db().from("enquiries").insert({
    kind,
    name,
    organisation: text("organisation").slice(0, 160) || null,
    email: email || null,
    phone: phone || null,
    subject: text("subject").slice(0, 160) || null,
    message,
    page: text("page").split("?")[0].slice(0, 120) || null,
  });

  if (error) {
    console.error("[enquiries]", error.message);
    return NextResponse.json(
      { error: "That did not save. Please try once more." },
      { status: 500 },
    );
  }

  if (EVENT_FOR[kind]) void recordEvent(EVENT_FOR[kind]);

  return NextResponse.json({ ok: true });
}
