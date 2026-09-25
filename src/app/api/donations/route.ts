import { NextResponse } from "next/server";
import { db, dbReady } from "@/lib/db";
import { normalisePhone } from "@/lib/format";
import { mirrorToSheet } from "@/lib/sheets";
import { clientIp, clientKey, rateLimit } from "@/lib/ratelimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CATEGORIES = new Set(["student", "faculty", "alumni", "guest"]);
const METHODS = new Set(["upi", "neft", "imps", "cash", "cheque", "other"]);
const MAX_PROOF_BYTES = 5 * 1024 * 1024;
const PROOF_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
  "application/pdf",
]);

function bad(message: string, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

/**
 * Records a donor's declaration that they have transferred money.
 * It does not move money, the transfer happens in the donor's own
 * banking app, and the treasurer verifies it against the statement.
 */
export async function POST(req: Request) {
  // Unauthenticated, it writes a row and accepts a file, so it is
  // throttled. But not by address alone: every phone on Jio, and the
  // whole campus Wi-Fi, reaches us through a handful of addresses, and
  // at the pandal a per-address limit of five turned away the sixth
  // donor in ten minutes. So the address gets a generous ceiling that
  // only a script reaches, and each donor's own number gets the tight one.
  const limit = rateLimit(clientKey(req, "donate"), {
    max: 120,
    windowMs: 10 * 60_000,
  });
  if (!limit.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: "That is several submissions in a row. Wait a few minutes.",
      },
      { status: 429, headers: { "retry-after": String(limit.retryAfter) } },
    );
  }

  if (!dbReady) {
    return bad(
      "Donations are not open yet. The committee is still connecting the ledger.",
      503,
    );
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return bad("Could not read the form.");
  }

  const text = (k: string) => String(form.get(k) ?? "").trim();

  const name = text("name").slice(0, 120);
  const email = text("email").toLowerCase().slice(0, 160);
  const phone = normalisePhone(text("phone"));
  const amount = Number(text("amount"));
  const category = text("category") || "guest";
  const method = text("method") || "upi";

  if (name.length < 2) return bad("Please give the name for the receipt.");

  // Students are asked for an institute address so the committee can
  // match them against the roll. Everyone else may leave it blank, and
  // gets the receipt on WhatsApp alone.
  const emailLooksRight = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
  if (category === "student" && !emailLooksRight) {
    return bad("Students, please give your email so we can match the SR number.");
  }
  if (email.length > 0 && !emailLooksRight) {
    return bad("That email does not look right. Leave it blank if you prefer.");
  }
  if (phone.length !== 10) return bad("The WhatsApp number needs ten digits.");

  const perDonor = rateLimit(`donate-phone:${phone}:${clientIp(req)}`, {
    max: 5,
    windowMs: 10 * 60_000,
  });
  if (!perDonor.ok) {
    return NextResponse.json(
      { ok: false, error: "That is several submissions in a row. Wait a few minutes." },
      { status: 429, headers: { "retry-after": String(perDonor.retryAfter) } },
    );
  }
  if (!Number.isFinite(amount) || amount <= 0) return bad("Enter the amount you transferred.");
  if (amount > 10_000_000) return bad("That amount looks like a typo. Please contact the treasurer.");
  if (!CATEGORIES.has(category)) return bad("Pick who you are.");
  if (!METHODS.has(method)) return bad("Pick how you paid.");

  const paidOnRaw = text("paid_on");
  const paidOn = /^\d{4}-\d{2}-\d{2}$/.test(paidOnRaw) ? paidOnRaw : null;

  /* --- optional proof of payment, into a private bucket --- */
  let proofUrl: string | null = null;
  const proof = form.get("proof");
  if (proof instanceof File && proof.size > 0) {
    if (proof.size > MAX_PROOF_BYTES) {
      return bad("That screenshot is over 5 MB. Please compress it.");
    }
    if (!PROOF_TYPES.has(proof.type)) {
      return bad("Upload an image or a PDF.");
    }
    const ext = (proof.name.split(".").pop() ?? "jpg")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "")
      .slice(0, 5);
    const key = `${Date.now()}-${crypto.randomUUID()}.${ext || "jpg"}`;
    const { error } = await db()
      .storage.from("proofs")
      .upload(key, proof, {
        contentType: proof.type || "application/octet-stream",
        upsert: false,
      });
    if (error) {
      console.error("[donations] proof upload", error.message);
    } else {
      proofUrl = key;
    }
  }

  const row = {
    name,
    email: email || "not given",
    phone,
    category,
    amount,
    method,
    sr_number: text("sr_number").slice(0, 60) || null,
    reference: text("reference").slice(0, 80) || null,
    paid_on: paidOn,
    message: text("message").slice(0, 140) || null,
    display_name: text("display_name").slice(0, 80) || null,
    // Being on the board is not optional: an account with names missing
    // from it is not an account. The board itself needs a login.
    anonymous: false,
    proof_url: proofUrl,
    status: "pending" as const,
  };

  const { data, error } = await db()
    .from("donations")
    .insert(row)
    .select("id,receipt_token")
    .single();

  if (error || !data) {
    // 23505 is a unique violation, and on this table it means the
    // transaction reference has already been declared by somebody.
    // One bank credit, one receipt: two claims on the same reference
    // would put two receipt numbers against one payment.
    if (error?.code === "23505") {
      return bad(
        "That transaction reference has already been recorded. If you think this is a mistake, or you are paying a second time, leave the reference blank and tell the treasurer.",
        409,
      );
    }
    console.error("[donations] insert", error?.message);
    return bad("We could not save that. Please try again, or message the treasurer.", 500);
  }

  // Best effort; a spreadsheet hiccup must never fail the donation.
  void mirrorToSheet({ ...row, id: data.id, created_at: new Date().toISOString() });

  // The token goes back now, not after verification. Between declaring
  // and being matched against the statement the donor otherwise holds
  // nothing at all, and the page that shows them where they stand has
  // existed the whole time with no way to reach it.
  return NextResponse.json({
    ok: true,
    id: data.id,
    receiptToken: (data as { receipt_token?: string }).receipt_token ?? null,
  });
}
