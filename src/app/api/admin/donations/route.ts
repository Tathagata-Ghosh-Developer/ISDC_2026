import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { db, dbReady, type Donation } from "@/lib/db";
import { mirrorToSheet } from "@/lib/sheets";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ACTIONS = new Set(["verify", "reject", "pending", "receipt-sent", "note"]);

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
