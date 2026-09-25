"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  Download,
  ExternalLink,
  ImageIcon,
  Loader2,
  Pencil,
  RefreshCw,
  Search,
  Trash2,
  Undo2,
  X,
} from "lucide-react";
import { WhatsappIcon } from "@/components/BrandIcons";
import AddDonor from "./AddDonor";
import DonorFields, { readDonorForm, type DonorInput } from "./DonorFields";
import type { Donation } from "@/lib/db";
import { can, type Role } from "@/lib/roles";
import { formatINR, formatDate, formatDateTime, istParts } from "@/lib/format";

type Filter = "pending" | "to-send" | "sent" | "verified" | "rejected" | "all";

const FILTERS: { value: Filter; label: string }[] = [
  { value: "to-send", label: "Receipt to send" },
  { value: "sent", label: "Receipt sent" },
  { value: "pending", label: "Awaiting check" },
  { value: "verified", label: "All verified" },
  { value: "rejected", label: "Rejected" },
  { value: "all", label: "Everything" },
];

type DeskRole = Exclude<Role, "viewer">;

/** Who typed the entry in: the new column, or the note older rows carry. */
function enteredBy(d: Donation): string | null {
  if (d.entered_by) return d.entered_by;
  const m = /^Entered by (\S+)/.exec(d.admin_note ?? "");
  return m ? m[1] : null;
}

function toInput(d: Donation): DonorInput {
  return {
    name: d.name,
    display_name: d.display_name ?? "",
    amount: String(Number(d.amount)),
    category: d.category,
    phone: d.phone,
    email: d.email,
    sr_number: d.sr_number ?? "",
    method: d.method,
    reference: d.reference ?? "",
    paid_on: d.paid_at ? istParts(Date.parse(d.paid_at)).date : (d.paid_on ?? ""),
    paid_time: d.paid_at ? istParts(Date.parse(d.paid_at)).time : "",
    message: d.message ?? "",
  };
}

export default function DonationsPanel({ role, user }: { role: DeskRole; user: string }) {
  const isAdmin = role === "admin";
  const everyone = can(role, "seeAllDonations");
  const canSend = can(role, "markReceiptSent");
  const canEdit = can(role, "editDonation");

  const [rows, setRows] = useState<Donation[]>([]);
  const [filter, setFilter] = useState<Filter>(
    !everyone ? "all" : isAdmin ? "pending" : "to-send",
  );
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // A slow old response must not overwrite a newer one.
  const latest = useRef(0);

  /** silent: the background refresh, which must not flash or clear a message. */
  const load = useCallback(async (silent = false) => {
    const ticket = ++latest.current;
    if (!silent) {
      setLoading(true);
      setError(null);
    }
    const params = new URLSearchParams({ status: filter });
    if (q.trim()) params.set("q", q.trim());

    const res = await fetch(`/api/admin/donations?${params}`).catch(() => null);
    if (!res || !res.ok) {
      if (!silent) setError("Could not load donations.");
      setLoading(false);
      return;
    }
    const data = (await res.json()) as { donations?: Donation[] };
    if (ticket !== latest.current) return;
    setRows(data.donations ?? []);
    setLoading(false);
  }, [filter, q]);

  useEffect(() => {
    const t = setTimeout(() => void load(), q ? 350 : 0);
    return () => clearTimeout(t);
  }, [load, q]);

  // Eleven fund raisers and six committee members on their own phones:
  // pick up each other's entries every 15 seconds while this tab is in
  // view. Paused while a row is being edited, so nothing moves under a
  // cursor. ponytail: polling, not push; Supabase Realtime would need a
  // browser key and RLS policies this project deliberately does not have.
  const quiet = editing === null && working === null;
  useEffect(() => {
    if (!quiet) return;
    const id = setInterval(() => {
      if (document.visibilityState === "visible") void load(true);
    }, 15_000);
    return () => clearInterval(id);
  }, [load, quiet]);

  function replace(d: Donation) {
    setRows((rs) =>
      rs.map((r) => (r.id === d.id ? { ...r, ...d, amount: Number(d.amount) } : r)),
    );
  }

  /** Opens the donor's screenshot on a link that dies in two minutes. */
  async function openProof(id: string) {
    setWorking(id);
    setError(null);
    const res = await fetch("/api/admin/proof", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id }),
    }).catch(() => null);
    const data = res
      ? ((await res.json().catch(() => ({}))) as { url?: string; error?: string })
      : {};
    setWorking(null);
    if (data.url) {
      window.open(data.url, "_blank", "noopener,noreferrer");
      return;
    }
    setError(data.error ?? "Could not open that screenshot.");
  }

  /** Offered only to the administrator, and refused again server side. */
  async function remove(id: string) {
    setWorking(id);
    setError(null);
    const res = await fetch("/api/admin/donations", {
      method: "DELETE",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id }),
    }).catch(() => null);

    const data = res ? ((await res.json().catch(() => ({}))) as { error?: string }) : {};
    if (!res || !res.ok) {
      setError(data.error ?? "Could not delete that.");
      setWorking(null);
      return;
    }
    setRows((rs) => rs.filter((r) => r.id !== id));
    setWorking(null);
  }

  async function act(id: string, action: string, extra: Record<string, unknown> = {}) {
    setWorking(id);
    setError(null);
    const res = await fetch("/api/admin/donations", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id, action, ...extra }),
    }).catch(() => null);

    const data = res
      ? ((await res.json().catch(() => ({}))) as { donation?: Donation; error?: string })
      : {};
    setWorking(null);

    if (!res || !res.ok) {
      setError(data.error ?? "That did not go through.");
      return false;
    }
    if (data.donation) replace(data.donation);
    return true;
  }

  /** The tick box. The row leaves "Receipt to send" once the list reloads. */
  async function tick(d: Donation, sent: boolean) {
    const ok = await act(d.id, sent ? "receipt-sent" : "receipt-unsent");
    if (ok && (filter === "to-send" || filter === "sent")) {
      setRows((rs) => rs.filter((r) => r.id !== d.id));
    }
  }

  async function saveEdit(d: Donation, form: HTMLFormElement) {
    if (!form.reportValidity()) return;
    const ok = await act(d.id, "edit", { fields: readDonorForm(new FormData(form)) });
    if (ok) setEditing(null);
  }

  /**
   * Opens WhatsApp with the receipt already written. It does not tick
   * the box: opening WhatsApp is not the same as pressing send, and the
   * box is only worth anything if it means the message went.
   */
  async function sendReceipt(d: Donation) {
    setWorking(d.id);
    setError(null);

    const res = await fetch("/api/admin/receipt", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id: d.id }),
    }).catch(() => null);

    const data = res
      ? ((await res.json().catch(() => ({}))) as {
          ok?: boolean;
          link?: string;
          emailed?: string | null;
          error?: string;
        })
      : {};

    setWorking(null);
    if (data.emailed && data.emailed.startsWith("failed")) setError(`Email ${data.emailed}`);

    if (data.link) {
      window.open(data.link, "_blank", "noopener");
      return;
    }
    if (data.ok) {
      // Sent by the API itself, which has already marked it.
      void load();
      return;
    }
    setError(data.error ?? "Could not send that.");
  }

  const totals = useMemo(() => {
    const verified = rows.filter((r) => r.status === "verified");
    return {
      count: rows.length,
      shown: rows.reduce((s, r) => s + Number(r.amount), 0),
      verified: verified.reduce((s, r) => s + Number(r.amount), 0),
      awaiting: rows.filter((r) => r.status === "pending").length,
      toSend: verified.filter((r) => !r.receipt_sent_at).length,
    };
  }, [rows]);

  return (
    <div>
      <AddDonor onAdded={() => void load()} role={role} />

      {/* ---- summary ---- */}
      {everyone ? (
        <>
          <div className="grid gap-px overflow-hidden border border-line bg-line sm:grid-cols-4">
            <Cell label="Rows shown" value={String(totals.count)} />
            <Cell label="Receipts to send, in view" value={String(totals.toSend)} tone="sindoor" />
            <Cell label="Awaiting check, in view" value={String(totals.awaiting)} />
            <Cell label="Verified in view" value={formatINR(totals.verified)} />
          </div>
          <p className="mt-2 text-[0.68rem] leading-relaxed text-ink-faint">
            These figures are for the committee. The public board carries names
            and amounts and never a total.
          </p>
        </>
      ) : (
        <div className="grid gap-px overflow-hidden border border-line bg-line sm:grid-cols-2">
          <Cell label={`Entries by ${user}`} value={String(totals.count)} />
          <Cell label="Collected by you" value={formatINR(totals.verified)} tone="sindoor" />
        </div>
      )}

      {/* ---- controls ---- */}
      <div className="mt-6 flex flex-wrap items-center gap-2">
        {everyone && (
          <div className="flex flex-wrap gap-1">
            {FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`border px-3 py-1.5 text-[0.72rem] uppercase tracking-[0.14em] transition-colors ${
                  filter === f.value
                    ? "border-sindoor bg-sindoor text-paper-3"
                    : "border-line text-ink-faint hover:border-gold hover:text-gold"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        )}

        <label className="relative min-w-[12rem] flex-1">
          <Search
            size={14}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint"
          />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Name, phone, UTR, receipt or SR number"
            className="field !py-2 !pl-9 !text-[0.8rem]"
          />
        </label>

        <button onClick={() => void load()} className="btn btn-ghost !py-2 !text-[0.68rem]">
          <RefreshCw size={13} className={loading ? "animate-spin" : ""} /> Refresh
        </button>

        {isAdmin && (
          <a
            href={`/api/admin/export?what=donations&status=${
              filter === "to-send" || filter === "sent" ? "verified" : filter
            }`}
            className="btn btn-ghost !py-2 !text-[0.68rem]"
          >
            <Download size={13} /> CSV
          </a>
        )}
      </div>

      {error && (
        <p className="mt-4 border border-sindoor/40 p-3 text-[0.8rem] text-sindoor" role="alert">
          {error}
        </p>
      )}

      {/* ---- rows ---- */}
      <div className="mt-6 space-y-3">
        {loading && rows.length === 0 && (
          <p className="py-12 text-center text-[0.85rem] text-ink-faint">
            <Loader2 size={16} className="mx-auto animate-spin" />
          </p>
        )}

        {!loading && rows.length === 0 && (
          <p className="surface p-8 text-center text-[0.85rem] text-ink-soft">
            {!everyone
              ? "Nothing entered from this account yet."
              : filter === "to-send"
                ? "Every verified donor has been sent a receipt."
                : filter === "pending"
                  ? "Nothing here. Every declaration has been checked."
                  : "Nothing here."}
          </p>
        )}

        <AnimatePresence initial={false}>
          {rows.map((d) => (
            <motion.article
              key={d.id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.3 }}
              className="surface p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <h3 className="text-[1.05rem] text-ink">{d.name}</h3>
                    <StatusPill status={d.status} />
                    {d.receipt_no && (
                      <span className="font-display text-[0.85rem] text-gold">
                        {d.receipt_no}
                      </span>
                    )}
                  </div>

                  <dl className="mt-3 grid gap-x-6 gap-y-1.5 text-[0.78rem] sm:grid-cols-2 lg:grid-cols-3">
                    <Item label="Mode" value={d.method.toUpperCase()} />
                    <Item
                      label="WhatsApp"
                      value={d.phone === "0000000000" ? "not given" : `+91 ${d.phone}`}
                    />
                    {everyone && <Item label="Category" value={d.category} />}
                    {everyone && <Item label="SR" value={d.sr_number ?? "not given"} />}
                    {everyone && <Item label="Email" value={d.email} />}
                    {d.reference && <Item label="Reference" value={d.reference} />}
                    {(d.paid_at || d.paid_on) && (
                      <Item
                        label="Paid"
                        value={d.paid_at ? formatDateTime(d.paid_at) : formatDate(d.paid_on)}
                      />
                    )}
                    <Item
                      label={everyone ? "Declared" : "Entered"}
                      value={formatDateTime(d.created_at)}
                    />
                    {everyone && enteredBy(d) && (
                      <Item label="Entered by" value={enteredBy(d)!} />
                    )}
                    {everyone && d.verified_by && (
                      <Item label="Verified by" value={d.verified_by} />
                    )}
                    {everyone && d.updated_by && (
                      <Item
                        label="Edited"
                        value={`${d.updated_by}, ${formatDateTime(d.updated_at ?? null)}`}
                      />
                    )}
                  </dl>

                  {d.message && (
                    <p className="mt-3 border-l-2 border-gold/40 pl-3 text-[0.8rem] italic text-ink-soft">
                      {d.message}
                    </p>
                  )}
                </div>

                <div className="shrink-0 text-right">
                  <p className="font-display text-[1.618rem] tabular-nums text-sindoor">
                    {formatINR(Number(d.amount))}
                  </p>
                </div>
              </div>

              {/* ---- the receipt, ticked off ---- */}
              {canSend && d.status === "verified" && (
                <label
                  className={`mt-4 flex cursor-pointer flex-wrap items-center gap-x-3 gap-y-1 border px-3 py-2.5 text-[0.82rem] transition-colors ${
                    d.receipt_sent_at
                      ? "border-leaf/50 bg-leaf/5 text-leaf"
                      : "border-gold/50 text-ink"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={Boolean(d.receipt_sent_at)}
                    disabled={working === d.id}
                    onChange={(e) => void tick(d, e.target.checked)}
                    className="h-4 w-4 accent-[var(--c-leaf)]"
                  />
                  <span>WhatsApp receipt sent</span>
                  {d.receipt_sent_at && (
                    <span className="text-[0.7rem] text-ink-faint">
                      {d.receipt_sent_by ? `${d.receipt_sent_by}, ` : ""}
                      {formatDateTime(d.receipt_sent_at)}
                    </span>
                  )}
                </label>
              )}

              {/* ---- correcting the details ---- */}
              {canEdit && editing === d.id && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    void saveEdit(d, e.currentTarget);
                  }}
                  className="mt-4 border-t border-line pt-4"
                >
                  <fieldset disabled={working === d.id} className="space-y-4">
                    <DonorFields initial={toInput(d)} full />
                    <p className="text-[0.72rem] leading-relaxed text-ink-faint">
                      The receipt number and status do not change. The change is
                      recorded under your name.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <button className="btn btn-primary !py-1.5 !text-[0.65rem]">
                        {working === d.id ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : (
                          <Check size={12} />
                        )}
                        Save changes
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditing(null)}
                        className="btn btn-ghost !py-1.5 !text-[0.65rem]"
                      >
                        Cancel
                      </button>
                    </div>
                  </fieldset>
                </form>
              )}

              {/* ---- actions ---- */}
              <div className="mt-4 flex flex-wrap gap-2 border-t border-line pt-4">
                {d.status === "verified" && (
                  <a
                    href={`/receipt/${d.receipt_token}`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-ghost !py-1.5 !text-[0.65rem]"
                  >
                    <ExternalLink size={12} /> Open receipt
                  </a>
                )}

                {canSend && d.status === "verified" && (
                  <button
                    onClick={() => void sendReceipt(d)}
                    disabled={working === d.id}
                    className="btn btn-ghost !border-leaf !py-1.5 !text-[0.65rem] !text-leaf"
                  >
                    <WhatsappIcon size={12} /> Send on WhatsApp
                  </button>
                )}

                {canEdit && editing !== d.id && (
                  <button
                    onClick={() => setEditing(d.id)}
                    className="btn btn-ghost !py-1.5 !text-[0.65rem]"
                  >
                    <Pencil size={12} /> Edit details
                  </button>
                )}

                {everyone && d.proof_url && (
                  <button
                    onClick={() => void openProof(d.id)}
                    disabled={working === d.id}
                    className="btn btn-ghost !py-1.5 !text-[0.65rem]"
                  >
                    <ImageIcon size={12} /> Screenshot
                  </button>
                )}

                {isAdmin && d.status !== "verified" && (
                  <button
                    onClick={() => void act(d.id, "verify").then(() => void load())}
                    disabled={working === d.id}
                    className="btn btn-primary !py-1.5 !text-[0.65rem]"
                  >
                    {working === d.id ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <Check size={12} />
                    )}
                    Verify and issue receipt
                  </button>
                )}

                {isAdmin && d.status !== "rejected" && (
                  <button
                    onClick={() => void act(d.id, "reject").then(() => void load())}
                    disabled={working === d.id}
                    className="btn btn-ghost !py-1.5 !text-[0.65rem]"
                  >
                    <X size={12} /> Not found in statement
                  </button>
                )}

                {isAdmin && d.status !== "pending" && (
                  <button
                    onClick={() => void act(d.id, "pending").then(() => void load())}
                    disabled={working === d.id}
                    className="btn btn-ghost !py-1.5 !text-[0.65rem]"
                  >
                    <Undo2 size={12} /> Back to pending
                  </button>
                )}

                {isAdmin && !d.receipt_no && (
                  <button
                    onClick={() => {
                      if (
                        window.confirm(
                          "Delete the entry for " +
                            d.name +
                            "? It has no receipt number, so nothing in the numbered series breaks. This cannot be undone.",
                        )
                      ) {
                        void remove(d.id);
                      }
                    }}
                    disabled={working === d.id}
                    className="btn btn-ghost !ml-auto !border-sindoor/40 !py-1.5 !text-[0.65rem] !text-sindoor"
                  >
                    <Trash2 size={12} /> Delete
                  </button>
                )}

                {!isAdmin && d.status === "pending" && (
                  <span className="self-center text-[0.68rem] text-ink-faint">
                    Waiting for the administrator to check this against the
                    statement.
                  </span>
                )}
              </div>
            </motion.article>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: Donation["status"] }) {
  const map = {
    pending: "border-gold text-gold",
    verified: "border-leaf text-leaf",
    rejected: "border-sindoor text-sindoor",
  } as const;
  return (
    <span
      className={`border px-2 py-0.5 text-[0.55rem] uppercase tracking-[0.18em] ${map[status]}`}
    >
      {status}
    </span>
  );
}

function Item({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <dt className="shrink-0 text-ink-faint">{label}</dt>
      <dd className="min-w-0 truncate text-ink-soft">{value}</dd>
    </div>
  );
}

function Cell({
  label,
  value,
  tone = "ink",
}: {
  label: string;
  value: string;
  tone?: "ink" | "sindoor";
}) {
  return (
    <div className="bg-paper p-5">
      <span
        className={`font-display block text-[1.618rem] font-normal leading-none tabular-nums ${
          tone === "sindoor" ? "text-sindoor" : "text-ink"
        }`}
      >
        {value}
      </span>
      <span className="mt-1.5 block text-[0.58rem] uppercase tracking-[0.22em] text-ink-faint">
        {label}
      </span>
    </div>
  );
}
