import { requireAdmin } from "@/lib/auth";
import { db, dbReady, type Donation } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** RFC 4180 quoting, plus a guard against spreadsheet formula injection. */
function csvCell(value: unknown): string {
  if (value === null || value === undefined) return "";
  let s = String(value);
  if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
  return '"' + s.replace(/"/g, '""') + '"';
}

function toCsv(rows: Record<string, unknown>[], columns: string[]): string {
  const head = columns.map(csvCell).join(",");
  const body = rows
    .map((r) => columns.map((c) => csvCell(r[c])).join(","))
    .join("\r\n");
  // BOM so Excel opens Bengali names and the rupee sign correctly.
  return "﻿" + head + "\r\n" + body + "\r\n";
}

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

const EXPENSE_COLUMNS = [
  "spent_on",
  "head",
  "description",
  "vendor",
  "amount",
  "published",
  "bill_url",
  "id",
  "created_at",
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

    return new Response(
      toCsv(data as unknown as Record<string, unknown>[], EXPENSE_COLUMNS),
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
