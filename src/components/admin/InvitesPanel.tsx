"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Check, Download, Loader2, Plus, Search, Trash2, X } from "lucide-react";
import { formatINR } from "@/lib/format";
import { matchesStatus, type Invite, type InviteStatus } from "@/lib/invites";

type Props = { canManage: boolean; user: string };

const STATUSES: { value: InviteStatus; label: string }[] = [
  { value: "all", label: "Everyone" },
  { value: "not-invited", label: "Card not given yet" },
  { value: "invited-unpaid", label: "Invited, not paid" },
  { value: "paid", label: "Paid" },
];

const UNASSIGNED = "__none";

/** Volunteer names group without regard to case or stray spaces. */
const vkey = (v: string | null) => (v ?? "").trim().toLowerCase();

export default function InvitesPanel({ canManage, user }: Props) {
  const [rows, setRows] = useState<Invite[]>([]);
  const [ready, setReady] = useState(true);
  const [loading, setLoading] = useState(true);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [q, setQ] = useState("");
  const [volunteer, setVolunteer] = useState("");
  const [status, setStatus] = useState<InviteStatus>("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [assignTo, setAssignTo] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const typing = useRef(false);
  const latest = useRef(0);

  const load = useCallback(async (silent = false) => {
    const ticket = ++latest.current;
    if (!silent) setLoading(true);
    const res = await fetch("/api/admin/invites").catch(() => null);
    const data = res
      ? ((await res.json().catch(() => ({}))) as {
          ready?: boolean;
          rows?: Invite[];
          suggestions?: string[];
          error?: string;
        })
      : {};
    if (ticket !== latest.current) return;
    setLoading(false);
    if (!res || !res.ok) {
      if (!silent) setError(data.error ?? "Could not load the list.");
      return;
    }
    setReady(data.ready !== false);
    setRows(data.rows ?? []);
    setSuggestions(data.suggestions ?? []);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => void load(), 0);
    return () => clearTimeout(t);
  }, [load]);

  // Several committee members assigning at once: pick up each other's
  // changes every 20 seconds, but never while someone is typing.
  useEffect(() => {
    const id = setInterval(() => {
      if (document.visibilityState === "visible" && !typing.current && busy === null) void load(true);
    }, 20_000);
    return () => clearInterval(id);
  }, [load, busy]);

  function put(row: Invite) {
    setRows((rs) => rs.map((r) => (r.id === row.id ? { ...row, amount: row.amount === null ? null : Number(row.amount) } : r)));
  }

  async function save(id: string, fields: Record<string, unknown>) {
    setBusy(id);
    setError(null);
    const res = await fetch("/api/admin/invites", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id, fields }),
    }).catch(() => null);
    const data = res ? ((await res.json().catch(() => ({}))) as { row?: Invite; error?: string }) : {};
    setBusy(null);
    if (!res || !res.ok || !data.row) {
      setError(data.error ?? "That did not save. Check the connection and try again.");
      void load(true);
      return;
    }
    put(data.row);
    setSaved(id);
    setTimeout(() => setSaved((s) => (s === id ? null : s)), 1500);
  }

  async function assign() {
    const name = assignTo.trim();
    if (!name || selected.size === 0) return;
    setBusy("bulk");
    setError(null);
    const res = await fetch("/api/admin/invites", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ids: [...selected], fields: { volunteer: name } }),
    }).catch(() => null);
    const data = res ? ((await res.json().catch(() => ({}))) as { rows?: Invite[]; error?: string }) : {};
    setBusy(null);
    if (!res || !res.ok) {
      setError(data.error ?? "Could not assign those.");
      return;
    }
    (data.rows ?? []).forEach(put);
    setNotice(`${selected.size} assigned to ${name}.`);
    setSelected(new Set());
    setAssignTo("");
    if (!suggestions.includes(name)) setSuggestions((s) => [...s, name].sort());
  }

  async function remove(r: Invite) {
    if (!window.confirm(`Remove ${r.name} from the list?`)) return;
    setBusy(r.id);
    const res = await fetch("/api/admin/invites", {
      method: "DELETE",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id: r.id }),
    }).catch(() => null);
    setBusy(null);
    if (!res || !res.ok) {
      setError("Could not remove that.");
      return;
    }
    setRows((rs) => rs.filter((x) => x.id !== r.id));
  }

  async function add(body: { row?: Record<string, string>; paste?: string }) {
    setBusy("add");
    setError(null);
    const res = await fetch("/api/admin/invites", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    }).catch(() => null);
    const data = res ? ((await res.json().catch(() => ({}))) as { added?: number; skipped?: number; error?: string }) : {};
    setBusy(null);
    if (!res || !res.ok) {
      setError(data.error ?? "Could not add that.");
      return false;
    }
    setNotice(
      `Added ${data.added ?? 0}.` + (data.skipped ? ` ${data.skipped} already on the list, skipped.` : ""),
    );
    void load(true);
    return true;
  }

  /* ---------------- what is on screen ---------------- */

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return rows.filter((r) => {
      if (volunteer === UNASSIGNED ? vkey(r.volunteer) !== "" : volunteer && vkey(r.volunteer) !== volunteer) {
        return false;
      }
      if (!matchesStatus(r, status)) return false;
      if (!needle) return true;
      return [r.name, r.department, r.division, r.email, r.volunteer, r.remarks]
        .some((f) => (f ?? "").toLowerCase().includes(needle));
    });
  }, [rows, q, volunteer, status]);

  const totals = useMemo(() => {
    const sum = (list: Invite[]) => ({
      count: list.length,
      assigned: list.filter((r) => vkey(r.volunteer)).length,
      invited: list.filter((r) => r.invited).length,
      paid: list.filter((r) => r.paid).length,
      amount: list.reduce((s, r) => s + (r.amount ?? 0), 0),
    });
    const groups = new Map<string, { name: string; list: Invite[] }>();
    for (const r of rows) {
      const k = vkey(r.volunteer);
      if (!groups.has(k)) groups.set(k, { name: r.volunteer?.trim() || "Not assigned yet", list: [] });
      groups.get(k)!.list.push(r);
    }
    const byVolunteer = [...groups.entries()]
      .map(([k, g]) => ({ key: k, name: g.name, ...sum(g.list) }))
      .sort((a, b) => (a.key === "" ? 1 : b.key === "" ? -1 : a.name.localeCompare(b.name)));
    return { all: sum(rows), byVolunteer };
  }, [rows]);

  const allShownSelected = shown.length > 0 && shown.every((r) => selected.has(r.id));

  /* ---------------- render ---------------- */

  if (!ready) {
    return (
      <div className="surface p-6 text-[0.88rem] leading-relaxed text-ink-soft">
        {canManage ? (
          <>
            <p className="text-ink">One step before this works.</p>
            <p className="mt-2">
              Open <code>site/private/RUN-ONCE.sql</code>, paste all of it into the Supabase SQL
              editor and press Run. It creates this tracker, loads the Durga Puja faculty list, and
              changes nothing that is already in the database.
            </p>
          </>
        ) : (
          <p>The committee has not opened the invitation list yet.</p>
        )}
      </div>
    );
  }

  return (
    <div onFocus={() => (typing.current = true)} onBlur={() => (typing.current = false)}>
      <datalist id="volunteer-names">
        {suggestions.map((s) => (
          <option key={s} value={s} />
        ))}
      </datalist>

      {/* ---- the numbers ---- */}
      <div className="grid grid-cols-2 gap-px overflow-hidden border border-line bg-line sm:grid-cols-5">
        <Cell label={canManage ? "Faculty on the list" : `Faculty with ${user}`} value={String(totals.all.count)} />
        {canManage && <Cell label="Given to a volunteer" value={`${totals.all.assigned}`} />}
        <Cell label="Card given in person" value={String(totals.all.invited)} />
        <Cell label="Paid" value={String(totals.all.paid)} />
        <Cell label="Collected" value={formatINR(totals.all.amount)} tone="sindoor" />
      </div>

      {/* ---- who is covering whom ---- */}
      {canManage && totals.byVolunteer.length > 0 && (
        <section className="surface mt-6 overflow-hidden">
          <h2 className="border-b border-line px-5 py-3 text-[0.9rem] text-ink">
            Volunteers and the faculty they are covering
            <span className="ml-2 text-[0.7rem] text-ink-faint">press a name to see their list</span>
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-[0.8rem]">
              <thead className="text-left text-[0.62rem] uppercase tracking-[0.16em] text-ink-faint">
                <tr>
                  <th className="px-5 py-2 font-normal">Volunteer</th>
                  <th className="px-3 py-2 text-right font-normal">Faculty</th>
                  <th className="px-3 py-2 text-right font-normal">Card given</th>
                  <th className="px-3 py-2 text-right font-normal">Paid</th>
                  <th className="px-5 py-2 text-right font-normal">Collected</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {totals.byVolunteer.map((v) => {
                  const key = v.key === "" ? UNASSIGNED : v.key;
                  return (
                    <tr
                      key={key}
                      onClick={() => setVolunteer(volunteer === key ? "" : key)}
                      className={`cursor-pointer transition-colors hover:bg-gold/10 ${volunteer === key ? "bg-gold/15" : ""}`}
                    >
                      <td className={`px-5 py-2 ${v.key === "" ? "text-sindoor" : "text-ink"}`}>{v.name}</td>
                      <td className="px-3 py-2 text-right tabular-nums">{v.count}</td>
                      <td className="px-3 py-2 text-right tabular-nums">{v.invited}</td>
                      <td className="px-3 py-2 text-right tabular-nums">{v.paid}</td>
                      <td className="px-5 py-2 text-right tabular-nums">{formatINR(v.amount)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ---- finding people ---- */}
      <div className="mt-6 flex flex-wrap items-center gap-2">
        <label className="relative min-w-[12rem] flex-1">
          <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Name, department, email or remark"
            className="field !py-2 !pl-9 !text-[0.8rem]"
            aria-label="Search the list"
          />
        </label>
        {canManage && (
          <select
            value={volunteer}
            onChange={(e) => setVolunteer(e.target.value)}
            className="field !w-auto !py-2 !text-[0.8rem]"
            aria-label="Show one volunteer's faculty"
          >
            <option value="">All volunteers</option>
            <option value={UNASSIGNED}>Not assigned yet</option>
            {totals.byVolunteer
              .filter((v) => v.key)
              .map((v) => (
                <option key={v.key} value={v.key}>
                  {v.name}
                </option>
              ))}
          </select>
        )}
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as InviteStatus)}
          className="field !w-auto !py-2 !text-[0.8rem]"
          aria-label="Filter by progress"
        >
          {STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
        {canManage && (
          <a href="/api/admin/invites?format=csv" className="btn btn-ghost !py-2 !text-[0.68rem]">
            <Download size={13} /> CSV
          </a>
        )}
      </div>

      {canManage && <AddFaculty onAdd={add} busy={busy === "add"} />}

      {(error || notice) && (
        <p
          role={error ? "alert" : "status"}
          className={`mt-4 flex items-start justify-between gap-3 border p-3 text-[0.8rem] ${error ? "border-sindoor/40 text-sindoor" : "border-leaf/40 text-leaf"}`}
        >
          {error ?? notice}
          <button onClick={() => (setError(null), setNotice(null))} aria-label="Dismiss">
            <X size={14} />
          </button>
        </p>
      )}

      {/* ---- assigning several at once ---- */}
      {canManage && selected.size > 0 && (
        <div className="sticky top-16 z-30 mt-4 flex flex-wrap items-center gap-2 border border-gold bg-paper p-3 shadow-sm">
          <span className="text-[0.82rem] text-ink">{selected.size} selected. Give them to</span>
          <input
            value={assignTo}
            onChange={(e) => setAssignTo(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && void assign()}
            list="volunteer-names"
            placeholder="Volunteer's name"
            className="field !w-48 !py-1.5 !text-[0.8rem]"
            aria-label="Volunteer to assign"
          />
          <button onClick={() => void assign()} disabled={!assignTo.trim() || busy === "bulk"} className="btn btn-primary !py-1.5 !text-[0.65rem]">
            {busy === "bulk" ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />} Assign
          </button>
          <button onClick={() => setSelected(new Set())} className="btn btn-ghost !py-1.5 !text-[0.65rem]">
            Clear
          </button>
        </div>
      )}

      {/* ---- the list ---- */}
      <div className="mt-4 border border-line">
        <div className="hidden grid-cols-[1.75rem_minmax(0,1.6fr)_10rem_5.5rem_4.5rem_7rem_minmax(0,1.3fr)_2rem] items-center gap-3 border-b border-line bg-paper-2 px-3 py-2 text-[0.6rem] uppercase tracking-[0.16em] text-ink-faint lg:grid">
          <span>
            {canManage && (
              <input
                type="checkbox"
                checked={allShownSelected}
                onChange={() =>
                  setSelected(allShownSelected ? new Set() : new Set(shown.map((r) => r.id)))
                }
                aria-label="Select everyone shown"
              />
            )}
          </span>
          <span>Faculty</span>
          <span>{canManage ? "Volunteer" : ""}</span>
          <span>Card given</span>
          <span>Paid</span>
          <span>Amount</span>
          <span>Remarks, requests, sponsorship leads</span>
          <span />
        </div>

        {loading && rows.length === 0 && (
          <p className="py-12 text-center text-ink-faint">
            <Loader2 size={16} className="mx-auto animate-spin" />
          </p>
        )}
        {!loading && shown.length === 0 && (
          <p className="p-8 text-center text-[0.85rem] text-ink-soft">
            {rows.length === 0
              ? canManage
                ? "The list is empty."
                : "No faculty have been given to you yet. The committee will assign them."
              : "Nobody matches."}
          </p>
        )}

        <ul className="divide-y divide-line">
          {shown.map((r) => (
            <li
              key={r.id}
              className={`grid grid-cols-[1.75rem_1fr] items-center gap-x-3 gap-y-2 px-3 py-3 lg:grid-cols-[1.75rem_minmax(0,1.6fr)_10rem_5.5rem_4.5rem_7rem_minmax(0,1.3fr)_2rem] ${r.paid ? "bg-leaf/5" : ""}`}
            >
              <span className="row-span-2 self-start pt-1 lg:row-span-1 lg:self-center lg:pt-0">
                {canManage && (
                  <input
                    type="checkbox"
                    checked={selected.has(r.id)}
                    onChange={() =>
                      setSelected((s) => {
                        const n = new Set(s);
                        if (n.has(r.id)) n.delete(r.id);
                        else n.add(r.id);
                        return n;
                      })
                    }
                    aria-label={`Select ${r.name}`}
                  />
                )}
              </span>

              <div className="min-w-0">
                <p className="text-[0.9rem] text-ink">
                  {r.name}
                  {busy === r.id && <Loader2 size={11} className="ml-2 inline animate-spin text-ink-faint" />}
                  {saved === r.id && <Check size={12} className="ml-2 inline text-leaf" />}
                </p>
                <p className="truncate text-[0.7rem] text-ink-faint">
                  {[r.post, r.department, r.division].filter(Boolean).join(" · ")}
                  {r.email && (
                    <>
                      {" · "}
                      <a href={`mailto:${r.email}`} className="hover:text-gold">
                        {r.email}
                      </a>
                    </>
                  )}
                </p>
              </div>

              <div className="col-start-2 flex flex-wrap items-center gap-x-4 gap-y-2 lg:contents">
                {canManage ? (
                  <input
                    key={`v-${r.id}-${r.updated_at}`}
                    defaultValue={r.volunteer ?? ""}
                    list="volunteer-names"
                    placeholder="Assign a volunteer"
                    className="field !w-40 !py-1 !text-[0.78rem]"
                    aria-label={`Volunteer for ${r.name}`}
                    onBlur={(e) => {
                      const v = e.target.value.trim();
                      if (v !== (r.volunteer ?? "")) void save(r.id, { volunteer: v });
                    }}
                  />
                ) : (
                  <span className="hidden lg:block" />
                )}

                <label className="flex items-center gap-1.5 text-[0.78rem] text-ink-soft">
                  <input
                    type="checkbox"
                    checked={r.invited}
                    disabled={busy === r.id}
                    onChange={(e) => {
                      put({ ...r, invited: e.target.checked });
                      void save(r.id, { invited: e.target.checked });
                    }}
                  />
                  <span className="lg:sr-only">Card given</span>
                </label>

                <label className="flex items-center gap-1.5 text-[0.78rem] text-ink-soft">
                  <input
                    type="checkbox"
                    checked={r.paid}
                    disabled={busy === r.id}
                    onChange={(e) => {
                      put({ ...r, paid: e.target.checked });
                      void save(r.id, { paid: e.target.checked });
                    }}
                  />
                  <span className="lg:sr-only">Paid</span>
                </label>

                <input
                  key={`a-${r.id}-${r.updated_at}`}
                  type="number"
                  min="0"
                  step="1"
                  inputMode="numeric"
                  defaultValue={r.amount ?? ""}
                  placeholder="₹"
                  className="field !w-24 !py-1 !text-[0.78rem] lg:!w-full"
                  aria-label={`Amount paid by ${r.name}`}
                  onBlur={(e) => {
                    const raw = e.target.value.trim();
                    const next = raw === "" ? null : Number(raw);
                    if (next !== r.amount) void save(r.id, { amount: raw === "" ? null : next });
                  }}
                />

                <input
                  key={`r-${r.id}-${r.updated_at}`}
                  defaultValue={r.remarks ?? ""}
                  placeholder="Special request, sponsorship lead…"
                  className="field !py-1 !text-[0.78rem] min-w-[12rem] flex-1 lg:min-w-0"
                  aria-label={`Remarks for ${r.name}`}
                  onBlur={(e) => {
                    const v = e.target.value.trim();
                    if (v !== (r.remarks ?? "")) void save(r.id, { remarks: v });
                  }}
                />

                {canManage ? (
                  <button
                    onClick={() => void remove(r)}
                    aria-label={`Remove ${r.name}`}
                    className="grid h-7 w-7 place-items-center text-ink-faint hover:text-sindoor"
                  >
                    <Trash2 size={13} />
                  </button>
                ) : (
                  <span />
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>

      <p className="mt-3 text-[0.68rem] leading-relaxed text-ink-faint">
        Everything saves by itself: a tick saves at once, typed boxes save when you move on. A
        payment recorded here is for tracking. For a numbered receipt, enter the donation in the
        Donations tab as well.
      </p>
    </div>
  );
}

function AddFaculty({
  onAdd,
  busy,
}: {
  onAdd: (b: { row?: Record<string, string>; paste?: string }) => Promise<boolean>;
  busy: boolean;
}) {
  const [open, setOpen] = useState<"" | "one" | "paste">("");
  const [paste, setPaste] = useState("");

  return (
    <div className="mt-3">
      <div className="flex flex-wrap gap-2">
        <button onClick={() => setOpen(open === "one" ? "" : "one")} className="btn btn-ghost !py-1.5 !text-[0.65rem]">
          <Plus size={12} /> Add one person
        </button>
        <button onClick={() => setOpen(open === "paste" ? "" : "paste")} className="btn btn-ghost !py-1.5 !text-[0.65rem]">
          <Plus size={12} /> Paste rows from a spreadsheet
        </button>
      </div>

      {open === "one" && (
        <form
          className="surface mt-3 grid gap-3 p-4 sm:grid-cols-5"
          onSubmit={async (e) => {
            e.preventDefault();
            const f = new FormData(e.currentTarget);
            const row = Object.fromEntries(
              ["name", "post", "department", "division", "email"].map((k) => [k, String(f.get(k) ?? "")]),
            );
            const form = e.currentTarget;
            if (await onAdd({ row })) form.reset();
          }}
        >
          <input name="name" required placeholder="Name *" className="field !py-1.5 !text-[0.8rem]" aria-label="Name" />
          <input name="post" placeholder="Post" className="field !py-1.5 !text-[0.8rem]" aria-label="Post" />
          <input name="department" placeholder="Department" className="field !py-1.5 !text-[0.8rem]" aria-label="Department" />
          <input name="email" type="email" placeholder="Email" className="field !py-1.5 !text-[0.8rem]" aria-label="Email" />
          <button disabled={busy} className="btn btn-primary !py-1.5 !text-[0.65rem]">
            {busy ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />} Add
          </button>
          <input type="hidden" name="division" value="" />
        </form>
      )}

      {open === "paste" && (
        <div className="surface mt-3 p-4">
          <p className="text-[0.78rem] leading-relaxed text-ink-soft">
            Select rows in Google Sheets or Excel, including the header row, copy, and paste here.
            Both layouts work: <em>Name, Post, Department, Email</em> (the faculty directory) and{" "}
            <em>Division, Department, Name, Email</em> (the Puja list). Anyone already on the list
            is skipped.
          </p>
          <textarea
            value={paste}
            onChange={(e) => setPaste(e.target.value)}
            rows={6}
            className="field mt-3 font-mono !text-[0.72rem]"
            placeholder={"Name\tPost\tDepartment\tEmail\nA. Professor\tProfessor\tPhysics\taprof@iisc.ac.in"}
            aria-label="Rows to add"
          />
          <button
            disabled={busy || !paste.trim()}
            onClick={async () => {
              if (await onAdd({ paste })) setPaste("");
            }}
            className="btn btn-primary mt-3 !py-1.5 !text-[0.65rem]"
          >
            {busy ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />} Add these rows
          </button>
        </div>
      )}
    </div>
  );
}

function Cell({ label, value, tone = "ink" }: { label: string; value: string; tone?: "ink" | "sindoor" }) {
  return (
    <div className="bg-paper p-4">
      <span className={`font-display block text-[1.4rem] leading-none tabular-nums ${tone === "sindoor" ? "text-sindoor" : "text-ink"}`}>
        {value}
      </span>
      <span className="mt-1.5 block text-[0.56rem] uppercase tracking-[0.2em] text-ink-faint">{label}</span>
    </div>
  );
}
