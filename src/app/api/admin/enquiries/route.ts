import { NextResponse } from "next/server";
import { requireRole, type Session } from "@/lib/auth";
import { db, dbReady } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const STATUSES = new Set(["new", "seen", "done", "spam"]);

async function guard(
  min: "admin" | "committee" = "committee",
): Promise<Session | null> {
  try {
    return await requireRole(min);
  } catch {
    return null;
  }
}

const unauthorised = () =>
  NextResponse.json({ error: "Unauthorised" }, { status: 401 });

export async function GET(req: Request) {
  const session = await guard("committee");
  if (!session) return unauthorised();
  if (!dbReady) return NextResponse.json({ enquiries: [], ready: false });

  const url = new URL(req.url);
  const kind = url.searchParams.get("kind");
  const status = url.searchParams.get("status");

  let query = db()
    .from("enquiries")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(500);

  if (kind && kind !== "all") query = query.eq("kind", kind);
  if (status && status !== "all") query = query.eq("status", status);

  const { data, error } = await query;
  if (error) {
    console.error("[admin/enquiries]", error.message);
    return NextResponse.json({ error: "Could not load messages." }, { status: 500 });
  }
  return NextResponse.json({ enquiries: data ?? [], ready: true, role: session.role });
}

export async function PATCH(req: Request) {
  const session = await guard("committee");
  if (!session) return unauthorised();
  if (!dbReady) return NextResponse.json({ error: "No database." }, { status: 503 });

  const { id, status, note } = (await req.json().catch(() => ({}))) as {
    id?: string;
    status?: string;
    note?: string;
  };
  if (!id) return NextResponse.json({ error: "Missing id." }, { status: 400 });

  const patch: Record<string, unknown> = { handled_by: session.user };
  if (status) {
    if (!STATUSES.has(status)) {
      return NextResponse.json({ error: "Unknown status." }, { status: 400 });
    }
    patch.status = status;
  }
  if (typeof note === "string") patch.admin_note = note.slice(0, 1000);

  const { data, error } = await db()
    .from("enquiries")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, enquiry: data });
}

/** Administrators only, and only for the ones marked spam. */
export async function DELETE(req: Request) {
  const session = await guard("admin");
  if (!session) return unauthorised();
  if (!dbReady) return NextResponse.json({ error: "No database." }, { status: 503 });

  const { id } = (await req.json().catch(() => ({}))) as { id?: string };
  if (!id) return NextResponse.json({ error: "Missing id." }, { status: 400 });

  const { error } = await db()
    .from("enquiries")
    .delete()
    .eq("id", id)
    .eq("status", "spam");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
