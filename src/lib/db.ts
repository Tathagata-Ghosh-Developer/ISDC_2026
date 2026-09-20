import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase access.
 *
 * The browser never holds a Supabase key. Every read and write goes
 * through a route handler on this server using the service role key,
 * which is why the tables carry RLS with no permissive policy.
 */

export type DonationStatus = "pending" | "verified" | "rejected";

export type Donation = {
  id: string;
  receipt_no: string | null;
  sr_number: string | null;
  name: string;
  email: string;
  phone: string;
  category: "student" | "faculty" | "alumni" | "guest";
  amount: number;
  method: "upi" | "neft" | "imps" | "cash" | "cheque" | "other";
  reference: string | null;
  paid_on: string | null;
  message: string | null;
  display_name: string | null;
  anonymous: boolean;
  proof_url: string | null;
  status: DonationStatus;
  admin_note: string | null;
  verified_at: string | null;
  verified_by: string | null;
  receipt_sent_at: string | null;
  created_at: string;
};

export type Expense = {
  id: string;
  head: string;
  description: string | null;
  amount: number;
  spent_on: string | null;
  vendor: string | null;
  bill_url: string | null;
  published: boolean;
  created_at: string;
};

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

/** True once the committee has pasted its Supabase keys into the env. */
export const dbReady = Boolean(url && key);

let cached: SupabaseClient | null = null;

export function db(): SupabaseClient {
  if (!dbReady) {
    throw new Error(
      "Supabase is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
    );
  }
  cached ??= createClient(url!, key!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}

/* ---------------------------------------------------------------
   Public reads — used by the donation board and the ledger
   --------------------------------------------------------------- */

export type BoardEntry = {
  id: string;
  name: string;
  category: Donation["category"];
  amount: number;
  message: string | null;
  verified_at: string | null;
};

export type BoardData = {
  entries: BoardEntry[];
  total: number;
  count: number;
  byCategory: Record<string, { total: number; count: number }>;
  spent: number;
  expenses: Expense[];
  ready: boolean;
};

const EMPTY_BOARD: BoardData = {
  entries: [],
  total: 0,
  count: 0,
  byCategory: {},
  spent: 0,
  expenses: [],
  ready: false,
};

export async function getBoard(): Promise<BoardData> {
  if (!dbReady) return EMPTY_BOARD;

  const [donationsRes, expensesRes] = await Promise.all([
    db()
      .from("donations")
      .select(
        "id,name,display_name,anonymous,category,amount,message,verified_at",
      )
      .eq("status", "verified")
      .order("verified_at", { ascending: false })
      .limit(2000),
    db()
      .from("expenses")
      .select("*")
      .eq("published", true)
      .order("spent_on", { ascending: false }),
  ]);

  if (donationsRes.error) {
    console.error("[board] donations", donationsRes.error.message);
    return EMPTY_BOARD;
  }

  type Row = {
    id: string;
    name: string;
    display_name: string | null;
    anonymous: boolean;
    category: Donation["category"];
    amount: number | string;
    message: string | null;
    verified_at: string | null;
  };

  const rows = (donationsRes.data ?? []) as Row[];

  const entries: BoardEntry[] = rows.map((r) => ({
    id: r.id,
    name: r.anonymous
      ? "Anonymous well-wisher"
      : (r.display_name?.trim() || r.name),
    category: r.category,
    amount: Number(r.amount),
    message: r.message,
    verified_at: r.verified_at,
  }));

  const byCategory: BoardData["byCategory"] = {};
  let total = 0;
  for (const e of entries) {
    total += e.amount;
    byCategory[e.category] ??= { total: 0, count: 0 };
    byCategory[e.category].total += e.amount;
    byCategory[e.category].count += 1;
  }

  const expenses = ((expensesRes.data ?? []) as Expense[]).map((e) => ({
    ...e,
    amount: Number(e.amount),
  }));
  const spent = expenses.reduce((s, e) => s + e.amount, 0);

  return {
    entries,
    total,
    count: entries.length,
    byCategory,
    spent,
    expenses,
    ready: true,
  };
}

export async function getDonation(id: string): Promise<Donation | null> {
  if (!dbReady) return null;
  const { data, error } = await db()
    .from("donations")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error || !data) return null;
  return { ...(data as Donation), amount: Number((data as Donation).amount) };
}
