import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { db, dbReady, type Expense } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function guard(): Promise<string | null> {
  try {
    return await requireAdmin();
  } catch {
    return null;
  }
}

export async function GET() {
  const admin = await guard();
  if (!admin) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  if (!dbReady) return NextResponse.json({ expenses: [] });

  const { data, error } = await db()
    .from("expenses")
    .select("*")
    .order("spent_on", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({
    expenses: (data as Expense[]).map((e) => ({ ...e, amount: Number(e.amount) })),
  });
}

export async function POST(req: Request) {
  const admin = await guard();
  if (!admin) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  if (!dbReady) return NextResponse.json({ error: "No database." }, { status: 503 });

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const head = String(body.head ?? "").trim();
  const amount = Number(body.amount);

  if (!head) {
    return NextResponse.json({ error: "Give the expense a head." }, { status: 400 });
  }
  if (!Number.isFinite(amount) || amount < 0) {
    return NextResponse.json({ error: "Amount must be a number." }, { status: 400 });
  }

  const spentOn = String(body.spent_on ?? "");
  const { data, error } = await db()
    .from("expenses")
    .insert({
      head: head.slice(0, 80),
      description: String(body.description ?? "").slice(0, 300) || null,
      amount,
      spent_on: /^\d{4}-\d{2}-\d{2}$/.test(spentOn) ? spentOn : null,
      vendor: String(body.vendor ?? "").slice(0, 120) || null,
      bill_url: String(body.bill_url ?? "").slice(0, 400) || null,
      published: body.published !== false,
    })
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, expense: data });
}

export async function DELETE(req: Request) {
  const admin = await guard();
  if (!admin) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id." }, { status: 400 });

  const { error } = await db().from("expenses").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
