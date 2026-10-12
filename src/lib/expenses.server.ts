import "server-only";
import { NextResponse } from "next/server";
import { requireRole, type Session } from "@/lib/auth";
import { db } from "@/lib/db";
import { CAN, type Role } from "@/lib/roles";
import { LEDGER_COLUMNS, MIGRATION_MESSAGE, missingColumn, normaliseExpense, type Expense } from "@/lib/expenses";

/**
 * What the expense routes share on the server: who may come in, where
 * the bills are kept, and reading one row.
 */

/** The donation screenshots' private bucket; bills go under expenses/<id>/. */
export const RECEIPT_BUCKET = "proofs";

/** A signed link to a bill dies after two minutes, as a proof's does. */
export const RECEIPT_TTL_SECONDS = 120;

export const LEDGER_SELECT = LEDGER_COLUMNS.join(",");

/**
 * The session, or the response that refuses it: 401 for nobody signed
 * in, 403 for an account below the executive committee. Every expense
 * handler calls this first, before it reads the body or the database.
 */
export async function authorise(min: Role = CAN.manageExpenses): Promise<Session | NextResponse> {
  try {
    return await requireRole(min);
  } catch (e) {
    const forbidden = e instanceof Error && e.message === "FORBIDDEN";
    return NextResponse.json(
      {
        error: forbidden
          ? "Only the executive committee can see or change the expense ledger."
          : "Unauthorised",
      },
      { status: forbidden ? 403 : 401 },
    );
  }
}

export function migrationNeeded(): NextResponse {
  return NextResponse.json({ error: MIGRATION_MESSAGE, migration: true }, { status: 503 });
}

export function noDatabase(): NextResponse {
  return NextResponse.json({ error: "No database connected." }, { status: 503 });
}

export type Loaded =
  | { expense: Expense }
  | { response: NextResponse };

/** One row with every ledger column, or the response that explains why not. */
export async function loadExpense(id: string): Promise<Loaded> {
  const { data, error } = await db().from("expenses").select(LEDGER_SELECT).eq("id", id).maybeSingle();
  if (missingColumn(error)) return { response: migrationNeeded() };
  if (error) {
    console.error("[admin/expenses] read", error.message);
    return { response: NextResponse.json({ error: "Could not read that expense." }, { status: 500 }) };
  }
  if (!data) return { response: NextResponse.json({ error: "No such expense." }, { status: 404 }) };
  return { expense: normaliseExpense(data as unknown as Record<string, unknown>) };
}

/**
 * Changes the list of bills on a row without losing a file somebody else
 * attached at the same moment: the write only lands if the row has not
 * changed since it was read, and is retried from a fresh read if it has.
 */
export async function updateReceiptKeys(
  id: string,
  change: (keys: string[]) => string[],
  who: string,
): Promise<{ expense: Expense } | { response: NextResponse }> {
  for (let attempt = 0; attempt < 4; attempt++) {
    const loaded = await loadExpense(id);
    if ("response" in loaded) return loaded;
    const current = loaded.expense;
    const keys = change([...(current.receipt_keys ?? [])]);

    let q = db()
      .from("expenses")
      .update({ receipt_keys: keys, updated_by: who, updated_at: new Date().toISOString() })
      .eq("id", id);
    q = current.updated_at ? q.eq("updated_at", current.updated_at) : q.is("updated_at", null);
    const { data, error } = await q.select(LEDGER_SELECT).maybeSingle();

    if (missingColumn(error)) return { response: migrationNeeded() };
    if (error) {
      console.error("[admin/expenses] receipts", error.message);
      return { response: NextResponse.json({ error: "Could not save the list of bills." }, { status: 500 }) };
    }
    if (data) return { expense: normaliseExpense(data as unknown as Record<string, unknown>) };
    // Somebody changed the row in between; read it again and retry.
  }
  return {
    response: NextResponse.json(
      { error: "Somebody else is changing this expense right now. Try again in a moment." },
      { status: 409 },
    ),
  };
}
