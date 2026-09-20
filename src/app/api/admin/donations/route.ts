import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { db, dbReady, type Donation } from "@/lib/db";
import { mirrorToSheet } from "@/lib/sheets";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ACTIONS = new Set(["verify", "reject", "pending", "receipt-sent", "note"]);
const CATEGORIES = new Set(["student", "faculty", "alumni", "guest"]);
const METHODS = new Set(["upi", "neft", "imps", "cash", "cheque", "other"]);

async function guard(): Promise<string | null> {
  try {
    return await requireAdmin();
  } catch {
    return null;
  }
}

export async function GET(req: Request) {
  const admin = await guard();
  if (!admin) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  if (!dbReady) return NextResponse.json({ donations: [], ready: false });

  const url = new URL(req.url);
  const status = url.searchParams.get("status");
  const q = url.searchParams.get("q")?.trim();

  let query = db()
    .from("donations")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1000);

  if (status && status !== "all") query = query.eq("status", status);

  if (q) {
    const safe = q.replace(/[%,()]/g, " ");
    query = query.or(
      [
        "name.ilike.%" + safe + "%",
        "email.ilike.%" + safe + "%",
        "phone.ilike.%" + safe + "%",
        "reference.ilike.%" + safe + "%",
        "receipt_no.ilike.%" + safe + "%",
        "sr_number.ilike.%" + safe + "%",
      ].join(","),
    );
  }

  const { data, error } = await query;
  if (error) {
    console.error("[admin/donations]", error.message);
    return NextResponse.json({ error: "Could not load donations." }, { status: 500 });
  }

  const donations = (data as Donation[]).map((d) => ({
    ...d,
    amount: Number(d.amount),
  }));
  return NextResponse.json({ donations, ready: true });
}

export async function PATCH(req: Request) {
  const admin = await guard();
  if (!admin) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  if (!dbReady) return NextResponse.json({ error: "No database." }, { status: 503 });

  const { id, action, note } = (await req.json().catch(() => ({}))) as {
    id?: string;
    action?: string;
    note?: string;
  };

  if (!id || !action || !ACTIONS.has(action)) {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }

  if (action === "verify") {
    // A database function mints the receipt number, so two admins
    // clicking at the same moment cannot produce a duplicate.
    const { data, error } = await db().rpc("verify_donation", {
      p_id: id,
      p_by: admin,
    });
    if (error) {
      console.error("[admin/verify]", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    const row = (Array.isArray(data) ? data[0] : data) as Donation;
    void mirrorToSheet({ ...row, amount: Number(row.amount) });
    return NextResponse.json({ ok: true, donation: row });
  }

  const patch: Partial<Donation> =
    action === "reject"
      ? { status: "rejected", verified_by: admin }
      : action === "pending"
        ? { status: "pending", verified_at: null, verified_by: null }
        : action === "receipt-sent"
          ? { receipt_sent_at: new Date().toISOString() }
          : { admin_note: (note ?? "").slice(0, 500) };

  const { data, error } = await db()
    .from("donations")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    console.error("[admin/donations] patch", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true, donation: data });
}

/**
 * A committee member entering a donation on someone's behalf, which
 * is how most cash collected at the mess counters arrives. The row is
 * created and verified in one step, so a receipt number is issued
 * immediately and the name reaches the board.
 */
export async function POST(req: Request) {
  const admin = await guard();
  if (!admin) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  if (!dbReady) return NextResponse.json({ error: "No database." }, { status: 503 });

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;

  const text = (k: string) => String(body[k] ?? "").trim();
  const name = text("name").slice(0, 120);
  const amount = Number(body.amount);
  const phone = text("phone").replace(/\D/g, "").slice(-10);
  const category = text("category") || "guest";
  const method = text("method") || "cash";

  if (name.length < 2) {
    return NextResponse.json({ error: "Give the donor's name." }, { status: 400 });
  }
  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ error: "Enter an amount." }, { status: 400 });
  }
  if (!CATEGORIES.has(category)) {
    return NextResponse.json({ error: "Unknown category." }, { status: 400 });
  }
  if (!METHODS.has(method)) {
    return NextResponse.json({ error: "Unknown payment method." }, { status: 400 });
  }

  const paidOn = text("paid_on");
  const { data, error } = await db()
    .from("donations")
    .insert({
      name,
      email: text("email").toLowerCase().slice(0, 160) || "not given",
      phone: phone || "0000000000",
      category,
      amount,
      method,
      sr_number: text("sr_number").slice(0, 60) || null,
      reference: text("reference").slice(0, 80) || null,
      paid_on: /^\d{4}-\d{2}-\d{2}$/.test(paidOn) ? paidOn : null,
      message: text("message").slice(0, 140) || null,
      display_name: text("display_name").slice(0, 80) || null,
      anonymous: body.anonymous === true,
      admin_note: `Entered by ${admin}`,
      status: "pending",
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error("[admin/donations] insert", error?.message);
    return NextResponse.json(
      { error: error?.message ?? "Could not save that." },
      { status: 500 },
    );
  }

  // Verify straight away when asked, which mints the receipt number.
  if (body.verify !== false) {
    const { data: row, error: vErr } = await db().rpc("verify_donation", {
      p_id: data.id,
      p_by: admin,
    });
    if (vErr) {
      return NextResponse.json({ ok: true, id: data.id, warning: vErr.message });
    }
    const verified = (Array.isArray(row) ? row[0] : row) as Donation;
    void mirrorToSheet({ ...verified, amount: Number(verified.amount) });
    return NextResponse.json({ ok: true, id: data.id, donation: verified });
  }

  return NextResponse.json({ ok: true, id: data.id });
}
