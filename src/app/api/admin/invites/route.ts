import { NextResponse } from "next/server";
import { requireRole, type Session } from "@/lib/auth";
import { can, type Role } from "@/lib/roles";
import { db, dbReady } from "@/lib/db";
import { fundraisers } from "@/lib/people.server";
import {
  COMMITTEE_FIELDS,
  VOLUNTEER_FIELDS,
  cleanEmail,
  nameKey,
  ownsInvite,
  parseSheet,
  type Invite,
} from "@/lib/invites";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * The faculty invitation tracker.
 *
 * The committee sees every row and may change anything. A volunteer,
 * signed in with a fund raiser account, sees only the rows whose
 * volunteer is them, and may only record the invitation, the payment,
 * the amount and a remark. Neither the list nor the route ever reaches a
 * stranger.
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

/** Until the setup SQL is run the table does not exist. Say so plainly. */
function missingTable(error: { code?: string; message?: string } | null): boolean {
  return (
    error?.code === "42P01" ||
    error?.code === "PGRST205" ||
    /could not find the table|relation .* does not exist/i.test(error?.message ?? "")
  );
}

const notSetUp = () => NextResponse.json({ ready: false, rows: [] });

/** The name a volunteer is known by on the contact sheet, if any. */
function displayName(login: string): string | null {
  return fundraisers().find((f) => f.login === login)?.name ?? null;
}

/** Validated values for whichever of the allowed fields were sent. */
function readPatch(
  raw: Record<string, unknown>,
  allowed: readonly string[],
): Record<string, unknown> | string {
  const out: Record<string, unknown> = {};
  const text = (v: unknown, max: number) => {
    const s = String(v ?? "").trim().slice(0, max);
    return s || null;
  };
  for (const k of allowed) {
    if (!(k in raw)) continue;
    const v = raw[k];
    if (k === "invited" || k === "paid") out[k] = v === true;
    else if (k === "amount") {
      if (v === null || v === "") out.amount = null;
      else {
        const n = Number(v);
        if (!Number.isFinite(n) || n < 0 || n > 10_000_000) return "That amount does not look right.";
        out.amount = Math.round(n * 100) / 100;
      }
    } else if (k === "email") {
      if (v && !cleanEmail(String(v))) return "That email does not look right.";
      out.email = cleanEmail(String(v ?? ""));
    } else if (k === "name") {
      const n = text(v, 120);
      if (!n || n.length < 2) return "Give the faculty member's name.";
      out.name = n;
    } else if (k === "remarks") out.remarks = text(v, 500);
    else out[k] = text(v, 120);
  }
  if ("invited" in out) out.invited_at = out.invited ? new Date().toISOString() : null;
  // Writing an amount means they have given.
  if (typeof out.amount === "number" && out.amount > 0 && !("paid" in out)) out.paid = true;
  return out;
}

/* ------------------------------------------------------------------ */

export async function GET(req: Request) {
  const session = await authorise("fundraiser");
  if (session instanceof NextResponse) return session;
  const everyone = can(session.role, "manageInvites");
  const csvWanted = new URL(req.url).searchParams.get("format") === "csv";
  // Permission first, before anything else can answer.
  if (csvWanted && !everyone) {
    return NextResponse.json({ error: "Your account cannot do that." }, { status: 403 });
  }
  if (!dbReady) return notSetUp();

  let query = db()
    .from("faculty_invites")
    .select("*")
    .order("division", { ascending: true, nullsFirst: false })
    .order("department", { ascending: true, nullsFirst: false })
    .order("name", { ascending: true })
    .limit(5000);

  // A volunteer's rows are picked out below with the same ownsInvite()
  // that guards their edits, so what they see and what they may change
  // can never disagree.
  if (!everyone) query = query.not("volunteer", "is", null);

  const { data, error } = await query;
  if (missingTable(error)) return notSetUp();
  if (error) {
    console.error("[invites]", error.message);
    return NextResponse.json({ error: "Could not load the list." }, { status: 500 });
  }

  const mine = displayName(session.user);
  const rows = (data as Invite[])
    .filter((r) => everyone || ownsInvite(r.volunteer, session.user, mine))
    .map((r) => ({ ...r, amount: r.amount === null ? null : Number(r.amount) }));

  if (csvWanted) {
    const cols = ["name", "post", "department", "division", "email", "volunteer", "invited", "paid", "amount", "remarks", "updated_by", "updated_at"] as const;
    const cell = (v: unknown) => {
      let s = v === null || v === undefined ? "" : String(v);
      if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
      return '"' + s.replace(/"/g, '""') + '"';
    };
    const csv =
      "﻿" +
      [cols.join(","), ...rows.map((r) => cols.map((c) => cell(r[c])).join(","))].join("\r\n") +
      "\r\n";
    return new NextResponse(csv, {
      headers: {
        "content-type": "text/csv; charset=utf-8",
        "content-disposition": 'attachment; filename="faculty-invitations.csv"',
        "cache-control": "no-store",
      },
    });
  }

  // Names the committee can pick when assigning: the fund raisers, and
  // anyone already written in.
  const suggestions = everyone
    ? Array.from(
        new Set([
          ...fundraisers().map((f) => f.name),
          ...rows.map((r) => r.volunteer).filter((v): v is string => !!v),
        ]),
      ).sort((a, b) => a.localeCompare(b))
    : [];

  return NextResponse.json({ ready: true, rows, role: session.role, user: session.user, suggestions });
}

/* ------------------------------------------------------------------ */

export async function PATCH(req: Request) {
  const session = await authorise("fundraiser");
  if (session instanceof NextResponse) return session;
  if (!dbReady) return notSetUp();

  const body = (await req.json().catch(() => ({}))) as {
    id?: string;
    ids?: string[];
    fields?: Record<string, unknown>;
  };
  const everyone = can(session.role, "manageInvites");
  const fields = readPatch(body.fields ?? {}, everyone ? COMMITTEE_FIELDS : VOLUNTEER_FIELDS);
  if (typeof fields === "string") return NextResponse.json({ error: fields }, { status: 400 });
  if (Object.keys(fields).length === 0) {
    return NextResponse.json({ error: "Nothing to change, or nothing your account may change." }, { status: 400 });
  }
  fields.updated_by = session.user;
  fields.updated_at = new Date().toISOString();

  // Assigning a volunteer to many faculty at once: committee only.
  if (Array.isArray(body.ids)) {
    if (!everyone) return NextResponse.json({ error: "Your account cannot do that." }, { status: 403 });
    const ids = body.ids.filter((x) => typeof x === "string").slice(0, 1000);
    if (ids.length === 0) return NextResponse.json({ error: "Pick someone first." }, { status: 400 });
    const { data, error } = await db().from("faculty_invites").update(fields).in("id", ids).select("*");
    if (missingTable(error)) return notSetUp();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, rows: data });
  }

  if (!body.id) return NextResponse.json({ error: "Bad request." }, { status: 400 });

  // A volunteer may only touch a row that is theirs, checked here, on
  // the server, against the row as it is now.
  if (!everyone) {
    const { data: row, error } = await db()
      .from("faculty_invites")
      .select("volunteer")
      .eq("id", body.id)
      .maybeSingle();
    if (missingTable(error)) return notSetUp();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (!row || !ownsInvite(row.volunteer, session.user, displayName(session.user))) {
      return NextResponse.json({ error: "That faculty member is not assigned to you." }, { status: 403 });
    }
  }

  const { data, error } = await db()
    .from("faculty_invites")
    .update(fields)
    .eq("id", body.id)
    .select("*")
    .maybeSingle();
  if (missingTable(error)) return notSetUp();
  if (error?.code === "23505") {
    return NextResponse.json({ error: "Someone with that email is already on the list." }, { status: 409 });
  }
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "No such entry." }, { status: 404 });
  return NextResponse.json({ ok: true, row: data });
}

/* ------------------------------------------------------------------ */

/**
 * Adding faculty: one person from the form, or many rows pasted from a
 * spreadsheet. People already on the list (same email) are skipped.
 */
export async function POST(req: Request) {
  const session = await authorise("committee");
  if (session instanceof NextResponse) return session;
  if (!dbReady) return notSetUp();

  const body = (await req.json().catch(() => ({}))) as {
    paste?: string;
    row?: Record<string, unknown>;
  };

  let rows;
  if (typeof body.paste === "string") {
    rows = parseSheet(body.paste.slice(0, 500_000));
    if (rows.length === 0) {
      return NextResponse.json({ error: "No names found in what was pasted." }, { status: 400 });
    }
  } else {
    const one = readPatch(body.row ?? {}, ["name", "post", "department", "division", "email"]);
    if (typeof one === "string") return NextResponse.json({ error: one }, { status: 400 });
    if (!one.name) return NextResponse.json({ error: "Give the faculty member's name." }, { status: 400 });
    rows = [one];
  }

  const { data: existing, error: readErr } = await db().from("faculty_invites").select("email, name").limit(10000);
  if (missingTable(readErr)) return notSetUp();
  if (readErr) return NextResponse.json({ error: readErr.message }, { status: 500 });
  const known = new Set((existing ?? []).map((r) => (r.email ?? "").toLowerCase()).filter(Boolean));
  const knownNames = new Set((existing ?? []).map((r) => nameKey(String(r.name ?? ""))));
  // Without an email, the name is all there is to go on.
  const fresh = rows.filter((r) =>
    r.email ? !known.has(String(r.email).toLowerCase()) : !knownNames.has(nameKey(String(r.name))),
  );

  if (fresh.length === 0) {
    return NextResponse.json({ ok: true, added: 0, skipped: rows.length });
  }
  const stamp = { updated_by: session.user, updated_at: new Date().toISOString() };
  const { error } = await db().from("faculty_invites").insert(fresh.map((r) => ({ ...r, ...stamp })));
  if (error?.code === "23505") {
    return NextResponse.json({ error: "Someone with that email is already on the list." }, { status: 409 });
  }
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, added: fresh.length, skipped: rows.length - fresh.length });
}

/* ------------------------------------------------------------------ */

export async function DELETE(req: Request) {
  const session = await authorise("committee");
  if (session instanceof NextResponse) return session;
  if (!dbReady) return notSetUp();

  const { id } = (await req.json().catch(() => ({}))) as { id?: string };
  if (!id) return NextResponse.json({ error: "Missing id." }, { status: 400 });
  const { error } = await db().from("faculty_invites").delete().eq("id", id);
  if (missingTable(error)) return notSetUp();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
