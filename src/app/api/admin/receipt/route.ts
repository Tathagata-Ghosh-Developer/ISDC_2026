import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { requireRole } from "@/lib/auth";
import { db, dbReady, getDonation } from "@/lib/db";
import { sendReceipt, waLink, whatsappReady } from "@/lib/whatsapp";
import { sendReceiptEmail, emailReady } from "@/lib/email";
import { formatINR } from "@/lib/format";
import { SITE } from "@/lib/site";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Sends a verified donor their receipt.
 *
 * Email goes first and silently, whenever the donor gave an address
 * and a provider is configured. WhatsApp follows: through the Cloud
 * API if the committee set it up, otherwise by handing back a wa.me
 * link for the admin to press, which is the path that costs nothing.
 */
export async function POST(req: Request) {
  let admin: string;
  try {
    // Sending a receipt records something that already happened, so a
    // committee member may do it. Deciding that it happened is still
    // an administrator's call, and that check lives on verification.
    admin = (await requireRole("committee")).user;
  } catch {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }
  if (!dbReady) {
    return NextResponse.json({ error: "No database." }, { status: 503 });
  }

  const { id } = (await req.json().catch(() => ({}))) as { id?: string };
  if (!id) return NextResponse.json({ error: "Missing id." }, { status: 400 });

  const donation = await getDonation(id);
  if (!donation) {
    return NextResponse.json({ error: "No such donation." }, { status: 404 });
  }
  if (donation.status !== "verified" || !donation.receipt_no) {
    return NextResponse.json(
      { error: "Verify it first, so there is a receipt number to send." },
      { status: 400 },
    );
  }

  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "https";
  const origin = host ? `${proto}://${host}` : SITE.url;

  const message = {
    phone: donation.phone,
    name: donation.name,
    amount: formatINR(donation.amount),
    receiptNo: donation.receipt_no,
    url: `${origin}/receipt/${donation.receipt_token}`,
  };

  /* ---- the inbox ---- */
  let emailed: string | null = null;
  const hasEmail =
    donation.email && donation.email !== "not given" && donation.email.includes("@");

  if (hasEmail && emailReady()) {
    const sent = await sendReceiptEmail({
      to: donation.email,
      name: donation.name,
      amount: message.amount,
      receiptNo: message.receiptNo,
      url: message.url,
    });
    emailed = sent.ok ? donation.email : `failed, ${sent.error}`;
  } else if (hasEmail) {
    emailed = "skipped, no mail provider configured";
  }

  /* ---- and WhatsApp ---- */
  if (!whatsappReady()) {
    return NextResponse.json({
      ok: false,
      configured: false,
      emailed,
      link: waLink(message),
      error: "Open WhatsApp and press send.",
    });
  }

  const result = await sendReceipt(message);

  if (!result.ok) {
    return NextResponse.json({
      ok: false,
      configured: true,
      emailed,
      link: result.fallback,
      error: result.error,
    });
  }

  await db()
    .from("donations")
    .update({
      receipt_sent_at: new Date().toISOString(),
      admin_note: `Receipt sent by ${admin}`,
    })
    .eq("id", id);

  return NextResponse.json({ ok: true, configured: true, emailed, id: result.id });
}
