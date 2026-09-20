import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { requireAdmin } from "@/lib/auth";
import { db, dbReady, getDonation } from "@/lib/db";
import { sendReceipt, waLink, whatsappReady } from "@/lib/whatsapp";
import { formatINR } from "@/lib/format";
import { SITE } from "@/lib/site";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Sends a verified donor their receipt. Uses the Cloud API when the
 * committee has set it up, and otherwise hands back a wa.me link for
 * the admin to press, which is the path that costs nothing.
 */
export async function POST(req: Request) {
  let admin: string;
  try {
    admin = await requireAdmin();
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
    url: `${origin}/receipt/${donation.id}`,
  };

  if (!whatsappReady()) {
    return NextResponse.json({
      ok: false,
      configured: false,
      link: waLink(message),
      error: "Open WhatsApp and press send.",
    });
  }

  const result = await sendReceipt(message);

  if (!result.ok) {
    return NextResponse.json({
      ok: false,
      configured: true,
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

  return NextResponse.json({ ok: true, configured: true, id: result.id });
}
