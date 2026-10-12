import { requireAdmin } from "@/lib/auth";
import { toCsv } from "@/lib/csv";
import { db, dbReady, type Donation } from "@/lib/db";
import { expensesCsv, normaliseExpense } from "@/lib/expenses";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DONATION_COLUMNS = [
  "receipt_no",
  "created_at",
  "status",
  "name",
  "display_name",
  "anonymous",
  "sr_number",
  "category",
  "email",
  "phone",
  "amount",
  "method",
  "reference",
  "paid_on",
  "message",
  "verified_at",
  "verified_by",
  "receipt_sent_at",
  "admin_note",
  "id",
];

export async function GET(req: Request) {
  try {
    await requireAdmin();
  } catch {
    return new Response("Unauthorised", { status: 401 });
  }
  if (!dbReady) return new Response("No database configured.", { status: 503 });

  const what = new URL(req.url).searchParams.get("what") ?? "donations";
  const stamp = new Date().toISOString().slice(0, 10);

  if (what === "expenses") {
    const { data, error } = await db()
      .from("expenses")
      .select("*")
      .order("spent_on", { ascending: false });
    if (error) return new Response(error.message, { status: 500 });

    // The same columns as the console's own download of the ledger.
    return new Response(
      expensesCsv((data as unknown as Record<string, unknown>[]).map(normaliseExpense)),
      {
        headers: {
          "content-type": "text/csv; charset=utf-8",
          "content-disposition": `attachment; filename="isdc-expenses-${stamp}.csv"`,
          "cache-control": "no-store",
        },
      },
    );
  }

  const status = new URL(req.url).searchParams.get("status");

  // An audit file that silently stops at the first page is worse than
  // no audit file, so page until the rows run out.
  const all: Donation[] = [];
  for (let from = 0; ; from += 1000) {
    let query = db()
      .from("donations")
      .select("*")
      .order("created_at", { ascending: false })
      .range(from, from + 999);
    if (status && status !== "all") query = query.eq("status", status);

    const { data, error } = await query;
    if (error) return new Response(error.message, { status: 500 });
    all.push(...((data ?? []) as Donation[]));
    if (!data || data.length < 1000) break;
  }

  const rows = all.map((d) => ({
    ...d,
    amount: Number(d.amount).toFixed(2),
  }));

  return new Response(
    toCsv(rows as unknown as Record<string, unknown>[], DONATION_COLUMNS),
    {
      headers: {
        "content-type": "text/csv; charset=utf-8",
        "content-disposition": `attachment; filename="isdc-donations-${status ?? "all"}-${stamp}.csv"`,
        "cache-control": "no-store",
      },
    },
  );
}
