"use client";

import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  BadgeCheck,
  ChevronDown,
  ChevronUp,
  Download,
  FileText,
  HandCoins,
  ImageIcon,
  Loader2,
  Paperclip,
  Pencil,
  Plus,
  Printer,
  RefreshCw,
  Search,
  Trash2,
  Undo2,
  X,
} from "lucide-react";
import ExpenseForm, { Lbl, uploadReceipts } from "./ExpenseForm";
import {
  HEADS,
  MIGRATION_MESSAGE,
  PAID_FROM,
  PAID_FROM_SHORT,
  PAYMENT_MODES,
  PAYMENT_MODE_LABEL,
  RECEIPT_ACCEPT,
  REIMBURSEMENT,
  REIMBURSEMENT_LABEL,
  checkReceiptFile,
  contactLooksRight,
  expensesCsv,
  filterLedger,
  ledgerTotals,
  owedByPerson,
  payerKey,
  readSettlement,
  receiptKind,
  repaidAmount,
  sortLedger,
  statusOf,
  type Expense,
  type LedgerFilter,
  type PaidFrom,
  type Reimbursement,
  type SortDir,
  type SortKey,
} from "@/lib/expenses";
import { formatDate, formatDateTime, formatINR, istParts } from "@/lib/format";

type Thumb = { key: string; url: string; kind: "image" | "pdf" | "heic" };
type Filter = Required<LedgerFilter>;

const NO_FILTER: Filter = { head: "", paidFrom: "", status: "", payer: "", from: "", to: "", q: "" };

/** Rupees, with paise only when there are any. */
const money = (n: number) => formatINR(n, !Number.isInteger(Math.round(n * 100) / 100));

export default function ExpensesPanel({ canDelete, user }: { canDelete: boolean; user: string }) {
  const [rows, setRows] = useState<Expense[]>([]);
  const [ledger, setLedger] = useState(true);
  const [ready, setReady] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const [settling, setSettling] = useState<string | null>(null);
  const [working, setWorking] = useState<string | null>(null);
  const [thumbs, setThumbs] = useState<Record<string, Thumb[]>>({});

  const [filter, setFilter] = useState<Filter>(NO_FILTER);
  const [sort, setSort] = useState<{ key: SortKey; dir: SortDir }>({ key: "spent_on", dir: "desc" });

  // Read after mount: the clock is not something to call while rendering.
  const [today, setToday] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setToday(istParts(Date.now()).date), 0);
    return () => clearTimeout(t);
  }, []);

  const formRef = useRef<HTMLDivElement>(null);
  const latest = useRef(0);

  const load = useCallback(async () => {
    const ticket = ++latest.current;
    setLoading(true);
    const res = await fetch("/api/admin/expenses").catch(() => null);
    const data = res
      ? ((await res.json().catch(() => ({}))) as {
          expenses?: Expense[];
          ledger?: boolean;
          ready?: boolean;
          error?: string;
        })
      : {};
    if (ticket !== latest.current) return;
    setLoading(false);
    if (!res || !res.ok) {
      setError(data.error ?? "Could not load the expenses.");
      return;
    }
    setRows(data.expenses ?? []);
    setLedger(data.ledger !== false);
    setReady(data.ready !== false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function replace(e: Expense) {
    setRows((rs) => (rs.some((r) => r.id === e.id) ? rs.map((r) => (r.id === e.id ? e : r)) : [e, ...rs]));
  }

  async function act(id: string, action: string, extra: Record<string, unknown> = {}): Promise<Expense | null> {
    setWorking(id);
    setError(null);
    setNotice(null);
    const res = await fetch("/api/admin/expenses", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id, action, ...extra }),
    }).catch(() => null);
    const data = res
      ? ((await res.json().catch(() => ({}))) as { expense?: Expense; error?: string })
      : {};
    setWorking(null);
    if (!res || !res.ok || !data.expense) {
      setError(data.error ?? "That did not go through. Check the connection and try again.");
      return null;
    }
    replace(data.expense);
    return data.expense;
  }

  /** Administrators only, and refused again on the server. */
  async function remove(e: Expense) {
    const bills = e.receipt_keys?.length ?? 0;
    if (
      !window.confirm(
        `Delete “${e.head}”, ${money(e.amount)}${bills ? `, and its ${bills} attached ${bills === 1 ? "bill" : "bills"}` : ""}? This cannot be undone.`,
      )
    ) {
      return;
    }
    setWorking(e.id);
    setError(null);
    const res = await fetch(`/api/admin/expenses?id=${encodeURIComponent(e.id)}`, { method: "DELETE" }).catch(() => null);
    const data = res ? ((await res.json().catch(() => ({}))) as { error?: string }) : {};
    setWorking(null);
    if (!res || !res.ok) {
      setError(data.error ?? "Could not delete that.");
      return;
    }
    setRows((rs) => rs.filter((r) => r.id !== e.id));
    setNotice(`Deleted “${e.head}”.`);
  }

  /* ---------------- bills ---------------- */

  async function signed(id: string, key?: string): Promise<Thumb[] | null> {
    const res = await fetch("/api/admin/expenses/receipts/view", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(key ? { id, key } : { id }),
    }).catch(() => null);
    const data = res
      ? ((await res.json().catch(() => ({}))) as { urls?: Thumb[]; error?: string })
      : {};
    if (!data.urls) {
      setError(data.error ?? "Could not open that bill.");
      return null;
    }
    return data.urls;
  }

  /** Opens one bill on a link that dies in two minutes. */
  async function openBill(id: string, key: string) {
    setError(null);
    const urls = await signed(id, key);
    if (urls?.[0]) window.open(urls[0].url, "_blank", "noopener,noreferrer");
  }

  async function loadThumbs(id: string) {
    const urls = await signed(id);
    if (urls) setThumbs((t) => ({ ...t, [id]: urls }));
  }

  function expand(e: Expense) {
    setOpen(e.id);
    if ((e.receipt_keys?.length ?? 0) > 0 && !thumbs[e.id]) void loadThumbs(e.id);
  }

  async function attach(e: Expense, list: FileList | null) {
    if (!list || list.length === 0) return;
    const files = Array.from(list);
    const refused = files.map((f) => checkReceiptFile(f)).filter(Boolean) as string[];
    const ok = files.filter((f) => !checkReceiptFile(f));
    setError(refused.length ? refused.join(" ") : null);
    setNotice(null);
    if (ok.length === 0) return;
    setWorking(e.id);
    const up = await uploadReceipts(e.id, ok);
    setWorking(null);
    if (up.expense) {
      replace(up.expense);
      setNotice(`Attached ${ok.length - up.problems.length} ${ok.length - up.problems.length === 1 ? "file" : "files"} to “${e.head}”.`);
      void loadThumbs(e.id);
    }
    if (up.problems.length) setError([...refused, ...up.problems].join(" "));
  }

  async function removeBill(e: Expense, key: string) {
    if (!window.confirm("Remove this bill from the line? The file itself is deleted.")) return;
    const saved = await act(e.id, "remove-receipt", { key });
    if (saved) setThumbs((t) => ({ ...t, [e.id]: (t[e.id] ?? []).filter((x) => x.key !== key) }));
  }

  /* ---------------- repaying ---------------- */

  function startSettle(e: Expense) {
    expand(e);
    setSettling(e.id);
  }

  async function settle(e: Expense, form: HTMLFormElement) {
    const fd = new FormData(form);
    const payload = {
      reimbursed_amount: String(fd.get("reimbursed_amount") ?? ""),
      reimbursed_on: String(fd.get("reimbursed_on") ?? ""),
      reimbursed_mode: String(fd.get("reimbursed_mode") ?? ""),
      reimbursed_ref: String(fd.get("reimbursed_ref") ?? ""),
    };
    const local = readSettlement(payload, e.amount, today || istParts(Date.now()).date);
    if (typeof local === "string") {
      setError(local);
      return;
    }
    const saved = await act(e.id, "reimburse", payload);
    if (saved) {
      setSettling(null);
      setNotice(`${saved.paid_by_name ?? "The payer"} marked repaid, ${money(repaidAmount(saved))}.`);
    }
  }

  async function unsettle(e: Expense) {
    if (
      !window.confirm(
        `Undo the reimbursement to ${e.paid_by_name ?? "the payer"}? The line goes back to “still owed”. Do this only if the repayment did not happen or was recorded by mistake.`,
      )
    ) {
      return;
    }
    await act(e.id, "unreimburse");
  }

  /* ---------------- editing ---------------- */

  function startEdit(e: Expense) {
    setEditing(e);
    setFormOpen(true);
    setNotice(null);
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
  }

  function saved(e: Expense, problems: string[]) {
    replace(e);
    const was = editing;
    setEditing(null);
    if (was) setFormOpen(false);
    setNotice(was ? `Saved the changes to “${e.head}”.` : `Added “${e.head}”, ${money(e.amount)}.`);
    setError(problems.length ? `Saved, but not every bill went up. ${problems.join(" ")}` : null);
    if (open === e.id) void loadThumbs(e.id);
  }

  /* ---------------- the view ---------------- */

  const heads = useMemo(() => {
    const seen = new Map<string, string>();
    for (const h of [...HEADS, ...rows.map((r) => r.head)]) {
      const k = h.trim().toLowerCase();
      if (k && !seen.has(k)) seen.set(k, h.trim());
    }
    return [...seen.values()].sort((a, b) => a.localeCompare(b));
  }, [rows]);

  const usedHeads = useMemo(() => {
    const seen = new Map<string, string>();
    for (const r of rows) {
      const k = r.head.trim().toLowerCase();
      if (!seen.has(k)) seen.set(k, r.head.trim());
    }
    return [...seen.values()].sort((a, b) => a.localeCompare(b));
  }, [rows]);

  const payers = useMemo(() => {
    const seen = new Map<string, { name: string; contact: string | null }>();
    for (const r of rows) {
      const k = payerKey(r.paid_by_name);
      if (!k) continue;
      const p = seen.get(k) ?? { name: r.paid_by_name!.trim(), contact: null };
      p.contact ??= r.paid_by_contact ?? null;
      seen.set(k, p);
    }
    return [...seen.values()].sort((a, b) => a.name.localeCompare(b.name));
  }, [rows]);

  const view = useMemo(() => sortLedger(filterLedger(rows, filter), sort.key, sort.dir), [rows, filter, sort]);
  const totals = useMemo(() => ledgerTotals(view), [view]);
  const owed = useMemo(() => owedByPerson(rows), [rows]);
  const owedTotal = owed.reduce((s, p) => s + p.owed, 0);
  const filtered = Object.values(filter).some(Boolean);

  const set = <K extends keyof Filter>(k: K, v: Filter[K]) => setFilter((f) => ({ ...f, [k]: v }));

  function describeFilter(): string {
    const parts: string[] = [];
    if (filter.q) parts.push(`matching “${filter.q}”`);
    if (filter.head) parts.push(`head ${filter.head}`);
    if (filter.paidFrom) parts.push(`paid from ${filter.paidFrom === "unrecorded" ? "not recorded" : PAID_FROM_SHORT[filter.paidFrom]}`);
    if (filter.status) parts.push(REIMBURSEMENT_LABEL[filter.status].toLowerCase());
    if (filter.payer) parts.push(`paid by ${filter.payer}`);
    if (filter.from) parts.push(`from ${formatDate(filter.from)}`);
    if (filter.to) parts.push(`to ${formatDate(filter.to)}`);
    return parts.join(", ");
  }

  /** The lines in view, as the auditors' spreadsheet. */
  function downloadCsv() {
    const blob = new Blob([expensesCsv(view)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `isdc-expenses-${today || "ledger"}${filtered ? "-filtered" : ""}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  /* ---------------- pieces of a row ---------------- */

  function paidBy(e: Expense) {
    if (!e.paid_from) return <span className="text-ink-faint">Not recorded</span>;
    return (
      <>
        <span className="text-ink-soft">{PAID_FROM_SHORT[e.paid_from]}</span>
        {e.paid_by_name && <span className="block text-[0.74rem] text-ink">{e.paid_by_name}</span>}
      </>
    );
  }

  function bills(e: Expense) {
    const n = e.receipt_keys?.length ?? 0;
    if (n === 0 && !e.bill_url) return <span className="text-[0.72rem] text-sindoor/80">none</span>;
    return (
      <button
        onClick={() => (open === e.id ? setOpen(null) : expand(e))}
        className="inline-flex items-center gap-1 text-[0.75rem] text-ink-soft hover:text-gold"
        aria-label={`${n} ${n === 1 ? "bill" : "bills"} attached to ${e.head}`}
      >
        <Paperclip size={12} /> {n || "link"}
      </button>
    );
  }

  function settleForm(e: Expense) {
    return (
      <form
        onSubmit={(ev) => {
          ev.preventDefault();
          void settle(e, ev.currentTarget);
        }}
        className="border border-gold/60 bg-paper p-4"
      >
        <p className="text-[0.88rem] text-ink">
          Repay {e.paid_by_name ?? "the payer"}
          {e.paid_by_contact ? <span className="text-ink-faint"> ({e.paid_by_contact})</span> : null}
        </p>
        <fieldset disabled={working === e.id} className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="block">
            <Lbl>Amount repaid</Lbl>
            <input
              name="reimbursed_amount"
              type="number"
              step="0.01"
              min="0"
              max={e.amount}
              defaultValue={String(e.amount)}
              inputMode="decimal"
              className="field mt-2"
            />
          </label>
          <label className="block">
            <Lbl>Repaid on</Lbl>
            <input
              name="reimbursed_on"
              type="date"
              defaultValue={today}
              max={today || undefined}
              required
              className="field mt-2"
            />
          </label>
          <label className="block">
            <Lbl>How</Lbl>
            <select name="reimbursed_mode" defaultValue="upi" className="field mt-2">
              {PAYMENT_MODES.map((m) => (
                <option key={m} value={m}>
                  {PAYMENT_MODE_LABEL[m]}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <Lbl>UTR or reference</Lbl>
            <input name="reimbursed_ref" maxLength={80} className="field mt-2" placeholder="Optional" />
          </label>
        </fieldset>
        <p className="mt-2 text-[0.7rem] leading-relaxed text-ink-faint">
          Recorded under your name, {user}. If less than the full amount is repaid, the rest is taken as given to the Puja.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button disabled={working === e.id} className="btn btn-primary !py-1.5 !text-[0.65rem]">
            {working === e.id ? <Loader2 size={12} className="animate-spin" /> : <HandCoins size={12} />}
            Mark reimbursed
          </button>
          <button type="button" onClick={() => setSettling(null)} className="btn btn-ghost !py-1.5 !text-[0.65rem]">
            Cancel
          </button>
        </div>
      </form>
    );
  }

  function details(e: Expense) {
    const keys = e.receipt_keys ?? [];
    const status = statusOf(e);
    const shown = thumbs[e.id] ?? [];
    return (
      <div className="space-y-4">
        <dl className="grid gap-x-6 gap-y-1.5 text-[0.78rem] sm:grid-cols-2 lg:grid-cols-3">
          <Item label="Paid from" value={e.paid_from ? PAID_FROM_SHORT[e.paid_from] : "Not recorded"} />
          {e.paid_by_name && <Item label="Paid by" value={e.paid_by_name} />}
          {e.paid_by_contact && <Item label="Contact" value={<Contact value={e.paid_by_contact} />} />}
          {e.payment_mode && <Item label="Mode" value={PAYMENT_MODE_LABEL[e.payment_mode]} />}
          {e.payment_ref && <Item label="Reference" value={e.payment_ref} />}
          {e.invoice_no && <Item label="Bill no." value={e.invoice_no} />}
          {status === "reimbursed" && (
            <Item
              label="Repaid"
              value={`${money(repaidAmount(e))}${e.reimbursed_on ? `, ${formatDate(e.reimbursed_on)}` : ""}${
                e.reimbursed_mode ? `, ${PAYMENT_MODE_LABEL[e.reimbursed_mode]}` : ""
              }${e.reimbursed_ref ? `, ${e.reimbursed_ref}` : ""}`}
            />
          )}
          {e.reimbursed_by && <Item label="Repayment recorded by" value={e.reimbursed_by} />}
          <Item label="Approved by" value={e.approved_by ?? "not yet"} />
          <Item label="Entered" value={`${e.created_by ?? "before the ledger"}, ${formatDateTime(e.created_at)}`} />
          {e.updated_by && <Item label="Last changed" value={`${e.updated_by}, ${formatDateTime(e.updated_at ?? null)}`} />}
          <Item label="Published" value={e.published ? "head, amount, date" : "no"} />
          {e.bill_url && (
            <Item
              label="Bill link"
              value={
                <a href={e.bill_url} target="_blank" rel="noopener noreferrer" className="underline hover:text-gold">
                  open
                </a>
              }
            />
          )}
        </dl>

        {e.description && <p className="text-[0.82rem] text-ink-soft">{e.description}</p>}
        {e.notes && (
          <p className="whitespace-pre-line border-l-2 border-gold/40 pl-3 text-[0.8rem] text-ink-soft">{e.notes}</p>
        )}

        {settling === e.id && status === "pending" && settleForm(e)}

        <div>
          <Lbl>Bills and receipts</Lbl>
          {keys.length === 0 ? (
            <p className="mt-2 text-[0.78rem] text-ink-faint">No bill attached yet.</p>
          ) : (
            <ul className="mt-2 flex flex-wrap gap-3">
              {keys.map((k, i) => {
                const t = shown.find((x) => x.key === k);
                const kind = receiptKind(k);
                return (
                  <li key={k} className="relative">
                    <button
                      onClick={() => void openBill(e.id, k)}
                      title="Opens on a link that lasts two minutes"
                      className="grid h-24 w-24 place-items-center overflow-hidden border border-line bg-paper text-ink-faint transition-colors hover:border-gold hover:text-gold"
                    >
                      {kind === "image" && t ? (
                        // A two-minute signed link from the private bucket;
                        // next/image would cache it past its life.
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={t.url} alt={`Bill ${i + 1} for ${e.head}`} className="h-full w-full object-cover" />
                      ) : kind === "pdf" ? (
                        <span className="grid place-items-center gap-1 text-[0.62rem] uppercase tracking-[0.14em]">
                          <FileText size={22} /> PDF
                        </span>
                      ) : (
                        <span className="grid place-items-center gap-1 text-[0.62rem] uppercase tracking-[0.14em]">
                          <ImageIcon size={22} /> {kind === "heic" ? "HEIC" : "Photo"}
                        </span>
                      )}
                    </button>
                    <span className="mt-1 block text-center text-[0.62rem] text-ink-faint">Bill {i + 1}</span>
                    <button
                      onClick={() => void removeBill(e, k)}
                      disabled={working === e.id}
                      aria-label={`Remove bill ${i + 1}`}
                      className="absolute -right-2 -top-2 grid h-6 w-6 place-items-center border border-line bg-paper text-ink-faint transition-colors hover:border-sindoor hover:text-sindoor"
                    >
                      <X size={11} />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
          <label className="mt-3 inline-flex cursor-pointer items-center gap-2 border border-dashed border-line px-3 py-2 text-[0.75rem] text-ink-soft transition-colors hover:border-gold hover:text-ink">
            {working === e.id ? <Loader2 size={13} className="animate-spin" /> : <Paperclip size={13} className="text-gold" />}
            Attach a bill (photo or PDF, up to 4 MB)
            <input
              type="file"
              multiple
              accept={RECEIPT_ACCEPT}
              className="sr-only"
              disabled={working === e.id || !ledger}
              onChange={(ev) => {
                void attach(e, ev.target.files);
                ev.target.value = "";
              }}
            />
          </label>
        </div>

        <div className="flex flex-wrap gap-2 border-t border-line pt-3">
          <button onClick={() => startEdit(e)} className="btn btn-ghost !py-1.5 !text-[0.65rem]">
            <Pencil size={12} /> Edit details
          </button>
          {status === "pending" && settling !== e.id && (
            <button onClick={() => setSettling(e.id)} className="btn btn-primary !py-1.5 !text-[0.65rem]">
              <HandCoins size={12} /> Mark reimbursed
            </button>
          )}
          {status === "reimbursed" && (
            <button
              onClick={() => void unsettle(e)}
              disabled={working === e.id}
              className="btn btn-ghost !py-1.5 !text-[0.65rem]"
            >
              <Undo2 size={12} /> Undo reimbursement
            </button>
          )}
          {e.approved_by ? (
            <button
              onClick={() => void act(e.id, "unapprove")}
              disabled={working === e.id}
              className="btn btn-ghost !py-1.5 !text-[0.65rem]"
            >
              <Undo2 size={12} /> Withdraw approval
            </button>
          ) : (
            <button
              onClick={() => void act(e.id, "approve")}
              disabled={working === e.id || !ledger}
              className="btn btn-ghost !border-leaf !py-1.5 !text-[0.65rem] !text-leaf"
            >
              <BadgeCheck size={12} /> Approve
            </button>
          )}
          {canDelete && (
            <button
              onClick={() => void remove(e)}
              disabled={working === e.id}
              className="btn btn-ghost !ml-auto !border-sindoor/40 !py-1.5 !text-[0.65rem] !text-sindoor"
            >
              <Trash2 size={12} /> Delete
            </button>
          )}
        </div>
      </div>
    );
  }

  function rowActions(e: Expense) {
    const isOpen = open === e.id;
    return (
      <>
        {statusOf(e) === "pending" && (
          <IconButton label={`Mark ${e.head} reimbursed`} onClick={() => startSettle(e)} tone="sindoor">
            <HandCoins size={13} />
          </IconButton>
        )}
        <IconButton label={`Edit ${e.head}`} onClick={() => startEdit(e)}>
          <Pencil size={12} />
        </IconButton>
        <IconButton label={isOpen ? "Close" : `Open ${e.head}`} onClick={() => (isOpen ? setOpen(null) : expand(e))}>
          {isOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </IconButton>
      </>
    );
  }

  const th = (key: SortKey | null, label: string, right = false) => (
    <th className={`px-3 py-2.5 font-normal ${right ? "text-right" : ""}`} scope="col">
      {key ? (
        <button
          onClick={() =>
            setSort((s) => ({
              key,
              dir: s.key === key ? (s.dir === "asc" ? "desc" : "asc") : key === "amount" || key === "spent_on" ? "desc" : "asc",
            }))
          }
          className={`inline-flex items-center gap-1 uppercase tracking-[0.16em] hover:text-ink ${sort.key === key ? "text-ink" : ""}`}
        >
          {label}
          {sort.key === key ? (
            sort.dir === "asc" ? <ArrowUp size={11} /> : <ArrowDown size={11} />
          ) : (
            <ArrowUpDown size={11} className="opacity-50 print:hidden" />
          )}
        </button>
      ) : (
        label
      )}
    </th>
  );

  /* ---------------- the page ---------------- */

  return (
    <div className="ledger-print">
      {/* On paper: what this is, when, and what was left out. */}
      <div className="mb-5 hidden print:block">
        <p className="font-display text-[1.272rem] text-ink">IISc Sharodiya Durgotsab: expense ledger</p>
        <p className="mt-1 text-[0.75rem] text-ink-soft">
          Printed {today ? formatDate(today) : ""} by {user}. {filtered ? `Lines ${describeFilter()}.` : "Every line."}
        </p>
      </div>

      {ready && !ledger && (
        <p className="mb-6 border border-gold/70 bg-gold/10 p-4 text-[0.82rem] leading-relaxed text-ink print:hidden" role="status">
          {MIGRATION_MESSAGE} Until then the lines below show only their older columns, and nothing can be added or changed.
        </p>
      )}

      {/* ---- totals ---- */}
      <div className="grid grid-cols-2 gap-px overflow-hidden border border-line bg-line lg:grid-cols-5">
        <Cell
          className="col-span-2 lg:col-span-1"
          label={filtered ? "Spent, lines in view" : "Total spent"}
          value={money(totals.spent)}
          tone="sindoor"
        />
        <Cell label="From the committee account" value={money(totals.committee)} />
        <Cell label="Paid by members" value={money(totals.members)} />
        <Cell label="Reimbursed" value={money(totals.reimbursed)} />
        <Cell
          label={`Still owed${totals.owedCount ? `, ${totals.owedCount} ${totals.owedCount === 1 ? "line" : "lines"}` : ""}`}
          value={money(totals.owed)}
          tone={totals.owed > 0 ? "sindoor" : "ink"}
        />
      </div>
      <p className="mt-2 text-[0.7rem] leading-relaxed text-ink-faint">
        {totals.count} {totals.count === 1 ? "line" : "lines"}
        {totals.sponsors ? ` · sponsors paid ${money(totals.sponsors)} directly` : ""}
        {totals.others ? ` · others paid ${money(totals.others)}` : ""}
        {totals.unrecorded ? ` · ${money(totals.unrecorded)} with no payer recorded` : ""}
        {totals.withoutBill ? ` · ${totals.withoutBill} without a bill` : " · every line has a bill"}
      </p>

      {/* ---- record or correct ---- */}
      <div ref={formRef} className="mt-6 scroll-mt-24 print:hidden">
        {formOpen ? (
          <ExpenseForm
            key={editing?.id ?? "new"}
            editing={editing}
            heads={heads}
            payers={payers}
            ledger={ledger && ready}
            onSaved={saved}
            onCancel={() => {
              setEditing(null);
              setFormOpen(false);
            }}
          />
        ) : (
          <button
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
            className="btn btn-primary"
          >
            <Plus size={14} /> Record an expense
          </button>
        )}
      </div>

      {/* ---- who is owed ---- */}
      {owed.length > 0 && (
        <section className="surface mt-6 p-5 print:break-inside-avoid">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="font-display text-[1.15rem] text-ink">Owed to members</h2>
            <span className="font-display text-[1.272rem] tabular-nums text-sindoor">{money(owedTotal)}</span>
          </div>
          <p className="mt-1 text-[0.72rem] text-ink-faint">
            Everyone who paid from their own pocket and has not been repaid yet, most owed first. Across the whole ledger, whatever the filters.
          </p>
          <ul className="mt-3 divide-y divide-line border-y border-line">
            {owed.map((p) => (
              <li key={p.key} className="flex flex-wrap items-center justify-between gap-3 py-2.5">
                <div className="min-w-0">
                  <p className="text-[0.9rem] text-ink">{p.name}</p>
                  <p className="text-[0.72rem] text-ink-faint">
                    {p.count} {p.count === 1 ? "line" : "lines"}
                    {p.repaid ? ` · ${money(p.repaid)} already repaid` : ""}
                    {p.contact ? (
                      <>
                        {" · "}
                        <Contact value={p.contact} />
                      </>
                    ) : null}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-display text-[1.05rem] tabular-nums text-sindoor">{money(p.owed)}</span>
                  <button
                    onClick={() => setFilter({ ...NO_FILTER, payer: p.name, status: "pending" })}
                    className="btn btn-ghost !py-1.5 !text-[0.62rem] print:hidden"
                  >
                    Show their lines
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ---- filters ---- */}
      <div className="mt-8 flex flex-wrap items-end gap-2 print:hidden">
        <label className="relative min-w-[12rem] basis-full sm:basis-auto sm:flex-[2]">
          <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
          <input
            value={filter.q}
            onChange={(e) => set("q", e.target.value)}
            placeholder="Head, vendor, bill no., payer, UTR, notes"
            className="field !py-2 !pl-9 !text-[0.8rem]"
            aria-label="Search the ledger"
          />
        </label>
        <Choice label="Head" value={filter.head} onChange={(v) => set("head", v)}>
          <option value="">Every head</option>
          {usedHeads.map((h) => (
            <option key={h} value={h}>
              {h}
            </option>
          ))}
        </Choice>
        <Choice label="Paid from" value={filter.paidFrom} onChange={(v) => set("paidFrom", v as Filter["paidFrom"])}>
          <option value="">Anyone</option>
          {PAID_FROM.map((p: PaidFrom) => (
            <option key={p} value={p}>
              {PAID_FROM_SHORT[p]}
            </option>
          ))}
          <option value="unrecorded">Not recorded</option>
        </Choice>
        <Choice label="Refund" value={filter.status} onChange={(v) => set("status", v as Filter["status"])}>
          <option value="">Any</option>
          {REIMBURSEMENT.map((r: Reimbursement) => (
            <option key={r} value={r}>
              {REIMBURSEMENT_LABEL[r]}
            </option>
          ))}
        </Choice>
        <Choice label="Payer" value={filter.payer} onChange={(v) => set("payer", v)}>
          <option value="">Anyone</option>
          {payers.map((p) => (
            <option key={p.name} value={p.name}>
              {p.name}
            </option>
          ))}
        </Choice>
        <label className="block">
          <span className="block text-[0.58rem] uppercase tracking-[0.18em] text-ink-faint">Paid from date</span>
          <input
            type="date"
            value={filter.from}
            max={filter.to || undefined}
            onChange={(e) => set("from", e.target.value)}
            className="field mt-1 !w-auto !py-1.5 !text-[0.75rem]"
          />
        </label>
        <label className="block">
          <span className="block text-[0.58rem] uppercase tracking-[0.18em] text-ink-faint">to</span>
          <input
            type="date"
            value={filter.to}
            min={filter.from || undefined}
            onChange={(e) => set("to", e.target.value)}
            className="field mt-1 !w-auto !py-1.5 !text-[0.75rem]"
          />
        </label>
        {filtered && (
          <button onClick={() => setFilter(NO_FILTER)} className="btn btn-ghost !py-2 !text-[0.65rem]">
            <X size={12} /> Clear
          </button>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 print:hidden">
        <span className="text-[0.75rem] text-ink-faint">
          {filtered ? `${view.length} of ${rows.length} lines` : `${rows.length} ${rows.length === 1 ? "line" : "lines"}`}
        </span>
        <label className="md:hidden">
          <span className="sr-only">Sort by</span>
          <select
            value={`${sort.key}:${sort.dir}`}
            onChange={(e) => {
              const [key, dir] = e.target.value.split(":") as [SortKey, SortDir];
              setSort({ key, dir });
            }}
            className="field !w-auto !py-1.5 !text-[0.75rem]"
          >
            <option value="spent_on:desc">Newest first</option>
            <option value="spent_on:asc">Oldest first</option>
            <option value="amount:desc">Largest first</option>
            <option value="amount:asc">Smallest first</option>
            <option value="head:asc">By head</option>
            <option value="payer:asc">By payer</option>
            <option value="status:asc">Still owed first</option>
          </select>
        </label>
        <div className="ml-auto flex flex-wrap gap-2">
          <button onClick={() => void load()} className="btn btn-ghost !py-2 !text-[0.68rem]">
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} /> Refresh
          </button>
          <button onClick={downloadCsv} disabled={view.length === 0} className="btn btn-ghost !py-2 !text-[0.68rem]">
            <Download size={13} /> CSV{filtered ? " of these" : ""}
          </button>
          <button onClick={() => window.print()} className="btn btn-ghost !py-2 !text-[0.68rem]">
            <Printer size={13} /> Print
          </button>
        </div>
      </div>

      {notice && (
        <p className="mt-4 border border-leaf/50 p-3 text-[0.8rem] text-leaf print:hidden" role="status">
          {notice}
        </p>
      )}
      {error && (
        <p className="mt-4 border border-sindoor/40 p-3 text-[0.8rem] text-sindoor print:hidden" role="alert">
          {error}
        </p>
      )}

      {/* ---- the ledger ---- */}
      {loading && rows.length === 0 ? (
        <p className="py-12 text-center">
          <Loader2 size={16} className="mx-auto animate-spin text-ink-faint" />
        </p>
      ) : view.length === 0 ? (
        <p className="surface mt-4 p-8 text-center text-[0.85rem] text-ink-soft">
          {rows.length === 0 ? "No expenses recorded yet." : "No line matches these filters."}
        </p>
      ) : (
        <>
          {/* Wide screens and paper: a table. */}
          <div className="mt-4 hidden overflow-x-auto border border-line md:block print:block print:overflow-visible">
            <table className="w-full border-collapse text-left text-[0.8rem]">
              <thead className="bg-paper-2/60 text-[0.6rem] uppercase tracking-[0.16em] text-ink-faint">
                <tr>
                  {th("spent_on", "Date")}
                  {th("head", "Head")}
                  {th("vendor", "Vendor")}
                  {th("payer", "Paid by")}
                  {th(null, "Mode")}
                  {th("amount", "Amount", true)}
                  {th("status", "Refund")}
                  {th(null, "Bills")}
                  <th className="px-3 py-2.5 print:hidden" scope="col">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {view.map((e) => (
                  <Fragment key={e.id}>
                    <tr className={`border-t border-line align-top ${open === e.id ? "bg-gold/5" : "hover:bg-gold/5"}`}>
                      <td className="whitespace-nowrap px-3 py-2.5 tabular-nums text-ink-soft">
                        {e.spent_on ? formatDate(e.spent_on) : <span className="text-ink-faint">undated</span>}
                      </td>
                      <td className="px-3 py-2.5">
                        <span className="text-ink">{e.head}</span>
                        {e.approved_by && (
                          <BadgeCheck size={12} className="ml-1 inline text-leaf" aria-label={`Approved by ${e.approved_by}`} />
                        )}
                        {!e.published && (
                          <span className="ml-2 border border-gold px-1 py-px text-[0.52rem] uppercase tracking-[0.14em] text-gold">
                            Unpublished
                          </span>
                        )}
                        {e.description && (
                          <span className="block max-w-[28ch] truncate text-[0.72rem] text-ink-faint print:max-w-none print:whitespace-normal">
                            {e.description}
                          </span>
                        )}
                      </td>
                      <td className="min-w-[8rem] px-3 py-2.5 text-ink-soft">
                        {e.vendor ?? <span className="text-ink-faint">none</span>}
                        {e.invoice_no && <span className="block text-[0.7rem] text-ink-faint">Bill {e.invoice_no}</span>}
                      </td>
                      <td className="min-w-[8.5rem] px-3 py-2.5">{paidBy(e)}</td>
                      <td className="px-3 py-2.5 text-ink-soft">
                        {e.payment_mode ? PAYMENT_MODE_LABEL[e.payment_mode] : <span className="text-ink-faint">-</span>}
                        {e.payment_ref && (
                          <span className="block max-w-[14ch] truncate text-[0.7rem] text-ink-faint print:max-w-none">
                            {e.payment_ref}
                          </span>
                        )}
                      </td>
                      <td className="font-display whitespace-nowrap px-3 py-2.5 text-right text-[0.95rem] tabular-nums text-ink">
                        {money(e.amount)}
                      </td>
                      <td className="px-3 py-2.5">
                        <RefundPill e={e} />
                      </td>
                      <td className="px-3 py-2.5">{bills(e)}</td>
                      <td className="px-3 py-2 print:hidden">
                        <div className="flex justify-end gap-1">{rowActions(e)}</div>
                      </td>
                    </tr>
                    {open === e.id && (
                      <tr className="print:hidden">
                        <td colSpan={9} className="border-t border-line bg-paper-2/40 px-4 py-4">
                          {details(e)}
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-line">
                  <td colSpan={5} className="px-3 py-2.5 text-right text-[0.6rem] uppercase tracking-[0.16em] text-ink-faint">
                    {filtered ? "Total of these lines" : "Total"}
                  </td>
                  <td className="font-display whitespace-nowrap px-3 py-2.5 text-right text-[1.05rem] tabular-nums text-sindoor">
                    {money(totals.spent)}
                  </td>
                  <td colSpan={3} className="px-3 py-2.5 text-[0.7rem] text-ink-faint">
                    {totals.owed ? `${money(totals.owed)} still owed` : ""}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Phones: one card a line. */}
          <ul className="mt-4 space-y-3 md:hidden print:hidden">
            {view.map((e) => (
              <li key={e.id} className="surface p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[0.95rem] text-ink">
                      {e.head}
                      {e.approved_by && <BadgeCheck size={12} className="ml-1 inline text-leaf" />}
                    </p>
                    <p className="mt-0.5 text-[0.68rem] uppercase tracking-[0.14em] text-ink-faint">
                      {e.spent_on ? formatDate(e.spent_on) : "undated"}
                      {e.vendor ? ` · ${e.vendor}` : ""}
                    </p>
                  </div>
                  <span className="font-display shrink-0 text-[1.15rem] tabular-nums text-ink">{money(e.amount)}</span>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[0.75rem]">
                  <RefundPill e={e} />
                  <span>{paidBy(e)}</span>
                  {bills(e)}
                </div>
                <div className="mt-3 flex flex-wrap justify-end gap-1">{rowActions(e)}</div>
                {open === e.id && <div className="mt-3 border-t border-line pt-3">{details(e)}</div>}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */

function RefundPill({ e }: { e: Expense }) {
  const s = statusOf(e);
  if (s === "not_needed") return <span className="text-[0.7rem] text-ink-faint">none due</span>;
  const tone = s === "pending" ? "border-sindoor text-sindoor" : "border-leaf text-leaf";
  return (
    <span className={`inline-block whitespace-nowrap border px-1.5 py-0.5 text-[0.55rem] uppercase tracking-[0.16em] ${tone}`}>
      {REIMBURSEMENT_LABEL[s]}
      {s === "reimbursed" && e.reimbursed_on ? ` ${formatDate(e.reimbursed_on)}` : ""}
    </span>
  );
}

/** A phone number or an email, as a link that dials or writes. */
function Contact({ value }: { value: string }) {
  if (!contactLooksRight(value)) return <span>{value}</span>;
  const href = value.includes("@") ? `mailto:${value}` : `tel:${value.replace(/[^\d+]/g, "")}`;
  return (
    <a href={href} className="underline decoration-line underline-offset-2 hover:text-gold">
      {value}
    </a>
  );
}

function IconButton({
  label,
  onClick,
  children,
  tone = "ink",
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
  tone?: "ink" | "sindoor";
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`grid h-8 w-8 place-items-center border transition-colors ${
        tone === "sindoor"
          ? "border-sindoor/50 text-sindoor hover:bg-sindoor hover:text-paper-3"
          : "border-line text-ink-faint hover:border-gold hover:text-gold"
      }`}
    >
      {children}
    </button>
  );
}

function Choice({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
}) {
  return (
    <label className="block min-w-[8rem] flex-1">
      <span className="block text-[0.58rem] uppercase tracking-[0.18em] text-ink-faint">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="field mt-1 !py-1.5 !text-[0.75rem]">
        {children}
      </select>
    </label>
  );
}

function Item({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex gap-2">
      <dt className="shrink-0 text-ink-faint">{label}</dt>
      <dd className="min-w-0 break-words text-ink-soft">{value}</dd>
    </div>
  );
}

function Cell({
  label,
  value,
  tone = "ink",
  className = "",
}: {
  label: string;
  value: string;
  tone?: "ink" | "sindoor";
  className?: string;
}) {
  return (
    <div className={`bg-paper p-4 sm:p-5 ${className}`}>
      <span
        className={`font-display block text-[1.382rem] font-normal leading-none tabular-nums sm:text-[1.618rem] ${
          tone === "sindoor" ? "text-sindoor" : "text-ink"
        }`}
      >
        {value}
      </span>
      <span className="mt-1.5 block text-[0.58rem] uppercase tracking-[0.2em] text-ink-faint">{label}</span>
    </div>
  );
}
