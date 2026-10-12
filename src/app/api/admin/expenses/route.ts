import { NextResponse } from "next/server";
import { db, dbReady } from "@/lib/db";
import { istParts } from "@/lib/format";
import { CAN } from "@/lib/roles";
import {
  LEGACY_COLUMNS,
  isUuid,
  missingColumn,
  normaliseExpense,
  readExpense,
  readSettlement,
  statusOf,
  type Expense,
} from "@/lib/expenses";
import {
  LEDGER_SELECT,
  RECEIPT_BUCKET,
  authorise,
  loadExpense,
  migrationNeeded,
  noDatabase,
  updateReceiptKeys,
} from "@/lib/expenses.server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * The expense ledger, for the executive committee (committee and admin
 * accounts) only. Every handler checks the role before it reads the body
 * or touches the database; deleting a line is the administrator's.
 *
 * Nothing here is mirrored to the Google Sheet, emailed or counted in
 * the analytics, and none of it reaches a public page: the board reads
 * head, amount and date through getBoard in src/lib/db.ts, nothing more.
 */

const PRIVATE = { "cache-control": "private, no-store" };

/* ------------------------------------------------------------------
   GET: the whole ledger
   ------------------------------------------------------------------ */

type Page = { data: Record<string, unknown>[] | null; error: { code?: string; message: string } | null };

/**
 * Every row, a thousand at a time. A ledger runs to a few hundred lines,
 * but an audit file that silently stops at the first page is worse than
 * none, so it pages until the rows run out.
 */
async function readAll(columns: string): Promise<Page> {
  const byId = new Map<string, Record<string, unknown>>();
  for (let n = 0; n < 50; n++) {
    const from = n * 1000;
    const { data, error } = await db()
      .from("expenses")
      .select(columns)
      .order("created_at", { ascending: false })
      .order("id", { ascending: true })
      .range(from, from + 999);
    if (error) return { data: null, error };
    const rows = (data ?? []) as unknown as Record<string, unknown>[];
    // A row entered while paging shifts the next page by one; the map
    // keeps it from being counted twice.
    for (const r of rows) byId.set(String(r.id), r);
    if (rows.length < 1000) break;
  }
  return { data: [...byId.values()], error: null };
}

export async function GET() {
  const session = await authorise();
  if (session instanceof NextResponse) return session;
  const base = {
    role: session.role,
    user: session.user,
    canDelete: session.role === "admin",
  };
  if (!dbReady) {
    return NextResponse.json({ ...base, expenses: [], ready: false, ledger: false }, { headers: PRIVATE });
  }

  // Before the migration has run the ledger columns do not exist, and
  // naming them is an error (42703). Fall back to the columns the table
  // has always had, and say so, rather than show the committee nothing.
  let ledger = true;
  let res = await readAll(LEDGER_SELECT);
  if (res.error && missingColumn(res.error)) {
    ledger = false;
    res = await readAll(LEGACY_COLUMNS.join(","));
  }
  if (res.error) {
    console.error("[admin/expenses] list", res.error.message);
    return NextResponse.json({ error: "Could not load the expenses." }, { status: 500 });
  }

  return NextResponse.json(
    { ...base, expenses: (res.data ?? []).map(normaliseExpense), ready: true, ledger },
    { headers: PRIVATE },
  );
}

/* ------------------------------------------------------------------
   POST: a new line
   ------------------------------------------------------------------ */

export async function POST(req: Request) {
  const session = await authorise();
  if (session instanceof NextResponse) return session;
  if (!dbReady) return noDatabase();

  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  const fields = readExpense(body);
  if (typeof fields === "string") return NextResponse.json({ error: fields }, { status: 400 });

  const { data, error } = await db()
    .from("expenses")
    .insert({ ...fields, created_by: session.user })
    .select(LEDGER_SELECT)
    .single();

  if (missingColumn(error)) return migrationNeeded();
  if (error || !data) {
    console.error("[admin/expenses] insert", error?.message);
    return NextResponse.json({ error: "Could not save that expense." }, { status: 500 });
  }
  return NextResponse.json({ ok: true, expense: normaliseExpense(data as unknown as Record<string, unknown>) });
}

/* ------------------------------------------------------------------
   PATCH: edit, repay, approve, detach a bill
   ------------------------------------------------------------------ */

const ACTIONS = new Set(["edit", "reimburse", "unreimburse", "approve", "unapprove", "remove-receipt"]);

export async function PATCH(req: Request) {
  const session = await authorise();
  if (session instanceof NextResponse) return session;
  if (!dbReady) return noDatabase();
  const who = session.user;

  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  const id = body?.id;
  const action = body?.action;
  if (!body || !isUuid(id) || typeof action !== "string" || !ACTIONS.has(action)) {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }

  if (action === "remove-receipt") return removeReceipt(id, body.key, who);

  const loaded = await loadExpense(id);
  if ("response" in loaded) return loaded.response;
  const current = loaded.expense;
  const now = new Date().toISOString();
  const stamp = { updated_by: who, updated_at: now };

  let patch: Record<string, unknown>;
  let guard: "unsettled" | "settled" | null = null;

  if (action === "edit") {
    const settled = statusOf(current) === "reimbursed";
    const fields = readExpense(body.fields as Record<string, unknown> | undefined, { settled });
    if (typeof fields === "string") return NextResponse.json({ error: fields }, { status: 400 });
    if (settled && current.reimbursed_amount != null && fields.amount < current.reimbursed_amount) {
      return NextResponse.json(
        { error: "More than that has already been repaid. Undo the reimbursement first, then change the amount." },
        { status: 409 },
      );
    }
    patch = { ...fields, ...stamp };
    // An approval was for the amount as it stood. A new amount needs a
    // new approval, so it is cleared rather than carried over silently.
    if (current.approved_by && fields.amount !== current.amount) patch.approved_by = null;
    if (settled) guard = "settled";
  } else if (action === "reimburse") {
    if (current.paid_from === "committee_account") {
      return NextResponse.json(
        { error: "The committee account paid this one, so nobody is owed a refund." },
        { status: 409 },
      );
    }
    if (statusOf(current) === "reimbursed") {
      return NextResponse.json(
        { error: `Already marked reimbursed${current.reimbursed_by ? ` by ${current.reimbursed_by}` : ""}.` },
        { status: 409 },
      );
    }
    const settlement = readSettlement(body, current.amount, istParts(Date.now()).date);
    if (typeof settlement === "string") return NextResponse.json({ error: settlement }, { status: 400 });
    patch = { ...settlement, reimbursement_status: "reimbursed", reimbursed_by: who, ...stamp };
    guard = "unsettled";
  } else if (action === "unreimburse") {
    if (statusOf(current) !== "reimbursed") {
      return NextResponse.json({ error: "This one is not marked reimbursed." }, { status: 409 });
    }
    patch = {
      reimbursement_status: "pending",
      reimbursed_amount: null,
      reimbursed_on: null,
      reimbursed_mode: null,
      reimbursed_ref: null,
      reimbursed_by: null,
      ...stamp,
    };
    guard = "settled";
    // The row forgets the repayment; the log keeps that it happened.
    console.info(
      "[admin/expenses] %s undid the reimbursement on %s (recorded by %s, %s)",
      who,
      id,
      current.reimbursed_by ?? "unknown",
      current.reimbursed_on ?? "undated",
    );
  } else if (action === "approve") {
    patch = { approved_by: who, ...stamp };
  } else {
    patch = { approved_by: null, ...stamp };
  }

  let q = db().from("expenses").update(patch).eq("id", id);
  // Two people pressing "Mark reimbursed" at once must not both record
  // a repayment: the second write finds the row already settled.
  if (guard === "unsettled") q = q.neq("reimbursement_status", "reimbursed");
  if (guard === "settled") q = q.eq("reimbursement_status", "reimbursed");
  const { data, error } = await q.select(LEDGER_SELECT).maybeSingle();

  if (missingColumn(error)) return migrationNeeded();
  if (error) {
    console.error("[admin/expenses] %s", action, error.message);
    return NextResponse.json({ error: "Could not save that change." }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json(
      { error: "Somebody else has just changed this expense. Refresh to see it." },
      { status: 409 },
    );
  }
  if (action === "reimburse") {
    console.info("[admin/expenses] %s marked %s reimbursed", who, id);
  }
  return NextResponse.json({ ok: true, expense: normaliseExpense(data as unknown as Record<string, unknown>) });
}

/** Takes one bill off a line and out of the bucket. */
async function removeReceipt(id: string, key: unknown, who: string) {
  if (typeof key !== "string" || !key.startsWith(`expenses/${id}/`)) {
    return NextResponse.json({ error: "That file is not on this expense." }, { status: 400 });
  }
  const loaded = await loadExpense(id);
  if ("response" in loaded) return loaded.response;
  if (!(loaded.expense.receipt_keys ?? []).includes(key)) {
    return NextResponse.json({ error: "That file is not on this expense." }, { status: 404 });
  }

  const res = await updateReceiptKeys(id, (keys) => keys.filter((k) => k !== key), who);
  if ("response" in res) return res.response;

  const { error } = await db().storage.from(RECEIPT_BUCKET).remove([key]);
  if (error) console.error("[admin/expenses] remove file", error.message);
  console.info("[admin/expenses] %s removed a bill from %s", who, id);
  return NextResponse.json({ ok: true, expense: res.expense });
}

/* ------------------------------------------------------------------
   DELETE: the administrator only
   ------------------------------------------------------------------ */

export async function DELETE(req: Request) {
  const session = await authorise(CAN.deleteExpense);
  if (session instanceof NextResponse) return session;
  if (!dbReady) return noDatabase();

  const url = new URL(req.url);
  const body = ((await req.json().catch(() => null)) ?? {}) as { id?: unknown };
  const id = url.searchParams.get("id") ?? body.id;
  if (!isUuid(id)) return NextResponse.json({ error: "Missing id." }, { status: 400 });

  // The bills go with the line. Before the migration there are none.
  let keys: string[] = [];
  const loaded = await loadExpense(id);
  if ("expense" in loaded) {
    keys = loaded.expense.receipt_keys ?? [];
  } else if (loaded.response.status === 404) {
    return loaded.response;
  }

  const { data, error } = await db()
    .from("expenses")
    .delete()
    .eq("id", id)
    .select("id,head,amount")
    .maybeSingle();
  if (error) {
    console.error("[admin/expenses] delete", error.message);
    return NextResponse.json({ error: "Could not delete that expense." }, { status: 500 });
  }
  if (!data) return NextResponse.json({ error: "No such expense." }, { status: 404 });

  // Anything left under the expense's folder, listed or not.
  const { data: listed } = await db().storage.from(RECEIPT_BUCKET).list(`expenses/${id}`, { limit: 1000 });
  const all = new Set([...keys, ...(listed ?? []).map((f) => `expenses/${id}/${f.name}`)]);
  if (all.size > 0) {
    const { error: rmErr } = await db().storage.from(RECEIPT_BUCKET).remove([...all]);
    if (rmErr) console.error("[admin/expenses] delete files", rmErr.message);
  }

  const gone = data as unknown as Pick<Expense, "head" | "amount">;
  console.info("[admin/expenses] %s deleted %s (%s, %s)", session.user, id, gone.head, String(gone.amount));
  return NextResponse.json({ ok: true });
}
