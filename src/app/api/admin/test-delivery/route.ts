import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { SITE } from "@/lib/site";
import {
  activeProvider,
  cloudApiReady,
  openWaReady,
  openWaStatus,
  normalisePhone,
  sendReceipt,
  waLink,
} from "@/lib/whatsapp";
import { emailReady, sendReceiptEmail } from "@/lib/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Does the receipt actually arrive?
 *
 * The one thing nobody finds out until a real donor is waiting. This
 * sends a clearly marked test receipt to a number and an address the
 * committee chooses, and reports exactly which path carried it and
 * what came back.
 *
 * Administrators only, and rate limited by being administrators only.
 * GET reports what is configured without sending anything.
 */

const TEST = {
  name: "Test Receipt",
  amount: "₹1",
  receiptNo: "ISDC/2026/TEST",
};

export async function GET() {
  try {
    await requireRole("admin");
  } catch {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  return NextResponse.json({
    provider: activeProvider(),
    whatsapp: {
      cloudApi: cloudApiReady(),
      openWa: openWaReady(),
      openWaStatus: openWaReady() ? await openWaStatus() : null,
    },
    email: { configured: emailReady(), from: process.env.MAIL_FROM ?? null },
    note:
      activeProvider() === "link"
        ? "Nothing is configured to send by itself, so receipts open WhatsApp with the message written and somebody presses send. That works and costs nothing."
        : `Receipts will be sent automatically through the ${activeProvider()} path.`,
  });
}

export async function POST(req: Request) {
  let who: string;
  try {
    who = (await requireRole("admin")).user;
  } catch {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const { phone, email } = (await req.json().catch(() => ({}))) as {
    phone?: string;
    email?: string;
  };

  const results: Record<string, unknown> = { by: who, at: new Date().toISOString() };

  if (phone) {
    const ten = normalisePhone(phone);
    if (!ten) {
      results.whatsapp = { ok: false, error: `Not a mobile number: ${phone}` };
    } else {
      const message = {
        phone: ten,
        name: TEST.name,
        amount: TEST.amount,
        receiptNo: TEST.receiptNo,
        // A real receipt URL would need a real token. This points at
        // the board instead, so nothing here can be mistaken for one.
        url: `${SITE.url}/daan/board`,
      };
      const sent = await sendReceipt(message);
      results.whatsapp = sent.ok
        ? { ok: true, provider: sent.provider, id: sent.id, to: `+91 ${ten}` }
        : {
            ok: false,
            provider: sent.provider,
            error: sent.error,
            // The committee can still finish it by hand from here.
            pressSend: waLink(message),
            to: `+91 ${ten}`,
          };
    }
  }

  if (email) {
    if (!emailReady()) {
      results.email = {
        ok: false,
        error:
          "No email provider is configured. Set RESEND_API_KEY or BREVO_API_KEY and MAIL_FROM.",
      };
    } else {
      const out = await sendReceiptEmail({
        to: email,
        name: TEST.name,
        amount: TEST.amount,
        receiptNo: TEST.receiptNo,
        url: `${SITE.url}/daan/board`,
      });
      results.email = out;
    }
  }

  if (!phone && !email) {
    return NextResponse.json(
      { error: "Give a phone number, an email address, or both." },
      { status: 400 },
    );
  }

  console.info("[test-delivery] %s ran a delivery test", who);
  return NextResponse.json(results);
}
