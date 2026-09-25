import { NextResponse } from "next/server";
import { requireRole, type Session } from "@/lib/auth";
import { can, type Role } from "@/lib/roles";
import { db, dbReady, ledgerV2, tolerant, type Donation } from "@/lib/db";
import { istToIso } from "@/lib/format";
import { mirrorToSheet } from "@/lib/sheets";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ACTIONS = new Set([
  "verify",
  "reject",
  "pending",
  "receipt-sent",
  "receipt-unsent",
  "note",
  "edit",
]);
const CATEGORIES = new Set(["student", "faculty", "alumni", "guest"]);
const METHODS = new Set(["upi", "neft", "imps", "cash", "cheque", "other"]);

/** Actions that decide whether an online declaration counts. Administrators only. */
const ADMIN_ACTIONS = new Set(["verify", "reject", "pending"]);

/** What a fund raiser gets back about their own entries. */
const FUNDRAISER_COLUMNS =
  "id,receipt_token,receipt_no,sr_number,name,display_name,email,phone,category,amount,method,reference,paid_on,message,status,verified_at,receipt_sent_at,created_at";

/** A second identical entry inside this window is taken to be the same donation. */
const DUPLICATE_WINDOW_MS = 2 * 60_000;

/**
 * The session, or the response that refuses it. A fund raiser who asks
 * for something above their station hears why, not just "unauthorised".
 */
async function authorise(min: Role): Promise<Session | NextResponse> {
  try {
    return await requireRole(min);
  } catch (e) {
    const forbidden = e instanceof Error && e.message === "FORBIDDEN";
    return NextResponse.json(
      { error: forbidden ? "Your account cannot do that." : "Unauthorised" },
      { status: forbidden ? 403 : 401 },
    );
  }
}

/** For ilike, where % and _ are wildcards. */
function literal(s: string): string {
  return s.replace(/[\\%_]/g, (c) => "\\" + c);
}

/** Postgres unique violation, which here can only be a reused UTR. */
function duplicateReference(error: { code?: string } | null): boolean {
  return error?.code === "23505";
}

const REFERENCE_TAKEN =
  "That transaction reference is already on another entry. Search for it before entering it again.";

/* ------------------------------------------------------------------
   Validating a donor's details, shared by entering and editing
   ------------------------------------------------------------------ */

type Fields = {
  name: string;
  display_name: string | null;
  email: string;
  phone: string;
  sr_number: string | null;
  category: string;
  amount: number;
  method: string;
  reference: string | null;
  paid_on: string | null;
  paid_at: string | null;
  message: string | null;
};

const EDITABLE: (keyof Fields)[] = [
  "name",
  "display_name",
  "email",
  "phone",
  "sr_number",
  "category",
  "amount",
  "method",
  "reference",
  "paid_on",
  "paid_at",
  "message",
];

function readFields(
  body: Record<string, unknown>,
  defaults: { category: string; method: string },
): Fields | string {
  const text = (k: string) => String(body[k] ?? "").trim();
  const name = text("name").slice(0, 120);
  const amount = Number(body.amount);
  const phone = text("phone").replace(/\D/g, "").slice(-10);
  const email = text("email").toLowerCase().slice(0, 160);
  const category = text("category") || defaults.category;
  const method = text("method") || defaults.method;
  const paidOn = text("paid_on");

  if (name.length < 2) return "Give the donor's name.";
  if (!Number.isFinite(amount) || amount <= 0) return "Enter an amount.";
  if (amount > 10_000_000) return "That amount looks like a typo.";
  if (phone && phone.length !== 10) return "The phone number needs ten digits.";
  if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) && email !== "not given") {
    return "That email does not look right. Leave it blank if there is none.";
  }
  if (!CATEGORIES.has(category)) return "Unknown category.";
  if (!METHODS.has(method)) return "Unknown payment method.";
  const paidAt = istToIso(paidOn, text("paid_time"));
  if (paidAt && Date.parse(paidAt) > Date.now() + 60 * 60_000) {
    return "That date and time are in the future.";
  }

  return {
    name,
    display_name: text("display_name").slice(0, 80) || null,
    email: email || "not given",
    phone: phone || "0000000000",
    sr_number: text("sr_number").slice(0, 60) || null,
    category,
    amount: Math.round(amount * 100) / 100,
    method,
    reference: text("reference").slice(0, 80) || null,
    paid_on: /^\d{4}-\d{2}-\d{2}$/.test(paidOn) ? paidOn : null,
    paid_at: paidAt,
    message: text("message").slice(0, 140) || null,
  };
}

/* ------------------------------------------------------------------
   GET: the list
   ------------------------------------------------------------------ */

export async function GET(req: Request) {
  const session = await authorise("fundraiser");
  if (session instanceof NextResponse) return session;
  if (!dbReady) {
    return NextResponse.json({ donations: [], ready: false, role: session.role });
  }

  const url = new URL(req.url);
  const status = url.searchParams.get("status");
  const q = url.searchParams.get("q")?.trim();
  const everyone = can(session.role, "seeAllDonations");
  const v2 = await ledgerV2();

  let query = db()
    .from("donations")
    .select(everyone ? "*" : FUNDRAISER_COLUMNS)
    .order("created_at", { ascending: false })
    .limit(1000);

  // A fund raiser sees what they entered and nothing else: the list is
  // other people's names, phones and emails.
  if (!everyone) {
    query = v2
      ? query.eq("entered_by", session.user)
      : query.ilike("admin_note", `Entered by ${literal(session.user)}%`);
  }

  if (status === "to-send") {
    query = query.eq("status", "verified").is("receipt_sent_at", null);
  } else if (status === "sent") {
    query = query.eq("status", "verified").not("receipt_sent_at", "is", null);
  } else if (status && status !== "all") {
    query = query.eq("status", status);
  }

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

  const donations = (data as unknown as Donation[]).map((d) => ({
    ...d,
    amount: Number(d.amount),
  }));
  return NextResponse.json({
    donations,
    ready: true,
    role: session.role,
    user: session.user,
    history: v2,
  });
}

/* ------------------------------------------------------------------
   PATCH: verify, reject, tick a receipt, edit details
   ------------------------------------------------------------------ */

export async function PATCH(req: Request) {
  const session = await authorise("committee");
  if (session instanceof NextResponse) return session;
  if (!dbReady) return NextResponse.json({ error: "No database." }, { status: 503 });
  const who = session.user;

  const body = (await req.json().catch(() => ({}))) as {
    id?: string;
    action?: string;
    note?: string;
    fields?: Record<string, unknown>;
  };
  const { id, action } = body;

  if (!id || !action || !ACTIONS.has(action)) {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }

  if (ADMIN_ACTIONS.has(action) && !can(session.role, "verifyDeclared")) {
    return NextResponse.json(
      { error: "Only the administrator can approve or reject an online declaration." },
      { status: 403 },
    );
  }

  const v2 = await ledgerV2();

  if (action === "verify") {
    // A database function mints the receipt number, so two people
    // pressing at the same moment cannot produce a duplicate.
    const { data, error } = await db().rpc("verify_donation", { p_id: id, p_by: who });
    if (error) {
      console.error("[admin/verify]", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    const row = (Array.isArray(data) ? data[0] : data) as Donation;
    void mirrorToSheet({ ...row, amount: Number(row.amount) });
    return NextResponse.json({ ok: true, donation: row });
  }

  if (action === "edit") return edit(id, body.fields ?? {}, who, v2);

  if (action === "receipt-sent" || action === "receipt-unsent") {
    const sent = action === "receipt-sent";
    const patch: Record<string, unknown> = {
      receipt_sent_at: sent ? new Date().toISOString() : null,
    };
    if (v2) patch.receipt_sent_by = sent ? who : null;

    // Only a verified row has a receipt to send.
    const { data, error } = await db()
      .from("donations")
      .update(patch)
      .eq("id", id)
      .eq("status", "verified")
      .select("*")
      .maybeSingle();
    if (error) {
      console.error("[admin/donations] receipt tick", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (!data) {
      return NextResponse.json(
        { error: "Only a verified entry has a receipt to send." },
        { status: 409 },
      );
    }
    return NextResponse.json({ ok: true, donation: data });
  }

  const patch: Partial<Donation> =
    action === "reject"
      ? { status: "rejected", verified_by: who }
      : action === "pending"
        ? { status: "pending", verified_at: null, verified_by: null }
        : { admin_note: (body.note ?? "").slice(0, 500) };

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
 * Changing a donor's details. The receipt number and the status never
 * change here: an edit corrects what was written down, it does not
 * decide whether the money arrived. Every change is kept, before and
 * after, once the history table exists.
 */
async function edit(
  id: string,
  raw: Record<string, unknown>,
  who: string,
  v2: boolean,
) {
  const { data: current, error: readErr } = await db()
    .from("donations")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (readErr) return NextResponse.json({ error: readErr.message }, { status: 500 });
  if (!current) return NextResponse.json({ error: "No such entry." }, { status: 404 });

  const row = current as Donation;
  const fields = readFields(raw, { category: row.category, method: row.method });
  if (typeof fields === "string") {
    return NextResponse.json({ error: fields }, { status: 400 });
  }

  const before: Record<string, unknown> = {};
  const after: Record<string, unknown> = {};
  for (const k of EDITABLE) {
    const was = k === "amount" ? Number(row.amount) : (row[k as keyof Donation] ?? null);
    const now = fields[k] ?? null;
    // Postgres hands a timestamp back in its own spelling; compare instants.
    const same =
      k === "paid_at" && typeof was === "string" && typeof now === "string"
        ? Date.parse(was) === Date.parse(now)
        : was === now;
    if (!same) {
      before[k] = was;
      after[k] = now;
    }
  }

  if (Object.keys(after).length === 0) {
    return NextResponse.json({ ok: true, donation: { ...row, amount: Number(row.amount) } });
  }

  const patch: Record<string, unknown> = { ...after };
  if (v2) {
    patch.updated_at = new Date().toISOString();
    patch.updated_by = who;
  }

  const { data, error } = await tolerant(patch, (r) =>
    db().from("donations").update(r).eq("id", id).select("*").single(),
  );

  if (duplicateReference(error)) {
    return NextResponse.json({ error: REFERENCE_TAKEN }, { status: 409 });
  }
  if (error) {
    console.error("[admin/donations] edit", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // tolerant() may have dropped a column the database does not have yet;
  // the history records only what was actually stored.
  for (const k of Object.keys(after)) {
    if (!(k in (data as Record<string, unknown>))) {
      delete before[k];
      delete after[k];
    }
  }
  if (v2 && Object.keys(after).length > 0) {
    const { error: logErr } = await db()
      .from("donation_edits")
      .insert({ donation_id: id, edited_by: who, before, after });
    if (logErr) console.error("[admin/donations] edit log", logErr.message);
  }

  return NextResponse.json({ ok: true, donation: data, changed: Object.keys(after) });
}

/* ------------------------------------------------------------------
   POST: entering a donation on someone's behalf
   ------------------------------------------------------------------ */

/**
 * Cash at a desk, a cheque handed over, a transfer made without the
 * form. Anyone from fund raiser upwards may enter one, and it is
 * verified in the same step, so the receipt number exists before the
 * donor walks away and the name reaches the board.
 */
export async function POST(req: Request) {
  const session = await authorise("fundraiser");
  if (session instanceof NextResponse) return session;
  if (!dbReady) return NextResponse.json({ error: "No database." }, { status: 503 });
  const who = session.user;

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const fields = readFields(body, { category: "guest", method: "cash" });
  if (typeof fields === "string") {
    return NextResponse.json({ error: fields }, { status: 400 });
  }

  // Eleven people on eleven phones, a slow network and a submit button
  // pressed twice. The same donor, amount and phone inside two minutes
  // is the same donation, whoever typed it, unless they say otherwise.
  if (body.confirm_duplicate !== true) {
    const { data: twin } = await db()
      .from("donations")
      .select("id,receipt_no,receipt_token,name,amount,created_at,admin_note,status")
      .ilike("name", literal(fields.name))
      .eq("amount", fields.amount)
      .eq("phone", fields.phone)
      .neq("status", "rejected")
      .gte("created_at", new Date(Date.now() - DUPLICATE_WINDOW_MS).toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (twin) {
      return NextResponse.json(
        {
          duplicate: true,
          donation: { ...twin, amount: Number(twin.amount) },
          error: `This looks like the entry ${twin.admin_note ? twin.admin_note.toLowerCase() : "made"} a moment ago${twin.receipt_no ? `, receipt ${twin.receipt_no}` : ""}. If it is a different donation, save it anyway.`,
        },
        { status: 409 },
      );
    }
  }

  const v2 = await ledgerV2();

  const insert: Record<string, unknown> = {
    ...fields,
    // Everyone who gives appears on the board. The column stays so old
    // rows still read, but nothing sets it any more.
    anonymous: false,
    admin_note: `Entered by ${who}`,
    status: "pending",
  };
  if (v2) insert.entered_by = who;

  const { data, error } = await tolerant(insert, (r) =>
    db().from("donations").insert(r).select("id").single(),
  );

  if (duplicateReference(error)) {
    return NextResponse.json({ error: REFERENCE_TAKEN }, { status: 409 });
  }
  if (error || !data) {
    console.error("[admin/donations] insert", error?.message);
    return NextResponse.json(
      { error: error?.message ?? "Could not save that." },
      { status: 500 },
    );
  }

  // The administrator may hold an entry back to check it first. Anyone
  // else's entry is money they have in hand, so it is verified at once.
  const hold = session.role === "admin" && body.verify === false;
  if (hold) return NextResponse.json({ ok: true, id: data.id, pending: true });

  const { data: row, error: vErr } = await db().rpc("verify_donation", {
    p_id: data.id,
    p_by: who,
  });
  if (vErr) {
    console.error("[admin/donations] verify on entry", vErr.message);
    return NextResponse.json({
      ok: true,
      id: data.id,
      pending: true,
      warning: "Saved, but the receipt number could not be issued. Tell the administrator.",
    });
  }

  const verified = (Array.isArray(row) ? row[0] : row) as Donation;
  void mirrorToSheet({ ...verified, amount: Number(verified.amount) });
  return NextResponse.json({ ok: true, id: data.id, donation: verified });
}

/* ------------------------------------------------------------------
   DELETE
   ------------------------------------------------------------------ */

/**
 * Administrators only, and only while an entry has no receipt number.
 * Once it has one it belongs to a numbered series the committee must
 * account for end to end, so it gets rejected rather than removed.
 */
export async function DELETE(req: Request) {
  const session = await authorise("admin");
  if (session instanceof NextResponse) return session;
  if (!dbReady) return NextResponse.json({ error: "No database." }, { status: 503 });

  const { id } = (await req.json().catch(() => ({}))) as { id?: string };
  if (!id) return NextResponse.json({ error: "Missing id." }, { status: 400 });

  const { data: row, error: readErr } = await db()
    .from("donations")
    .select("receipt_no")
    .eq("id", id)
    .maybeSingle();

  if (readErr) {
    return NextResponse.json({ error: readErr.message }, { status: 500 });
  }
  if (!row) return NextResponse.json({ error: "No such entry." }, { status: 404 });

  if ((row as { receipt_no: string | null }).receipt_no) {
    return NextResponse.json(
      {
        error:
          "This one already has a receipt number. Reject it instead, so the numbered series stays unbroken.",
      },
      { status: 409 },
    );
  }

  const { error } = await db().from("donations").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
