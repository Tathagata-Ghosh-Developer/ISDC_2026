"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  Download,
  Loader2,
  RefreshCw,
  Search,
  Undo2,
  X,
} from "lucide-react";
import { WhatsappIcon } from "@/components/BrandIcons";
import AddDonor from "./AddDonor";
import type { Donation } from "@/lib/db";
import { formatINR, formatDate, formatDateTime } from "@/lib/format";

type Filter = "pending" | "verified" | "rejected" | "all";

const FILTERS: { value: Filter; label: string }[] = [
  { value: "pending", label: "Awaiting check" },
  { value: "verified", label: "Verified" },
  { value: "rejected", label: "Rejected" },
  { value: "all", label: "Everything" },
];

export default function DonationsPanel() {
  const [rows, setRows] = useState<Donation[]>([]);
  const [filter, setFilter] = useState<Filter>("pending");
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams({ status: filter });
    if (q.trim()) params.set("q", q.trim());

    const res = await fetch(`/api/admin/donations?${params}`).catch(() => null);
    if (!res || !res.ok) {
      setError("Could not load donations.");
      setLoading(false);
      return;
    }
    const data = (await res.json()) as { donations?: Donation[] };
    setRows(data.donations ?? []);
    setLoading(false);
  }, [filter, q]);

  useEffect(() => {
    const t = setTimeout(load, q ? 350 : 0);
    return () => clearTimeout(t);
  }, [load, q]);

  async function act(id: string, action: string) {
    setWorking(id);
    const res = await fetch("/api/admin/donations", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id, action }),
    }).catch(() => null);

    if (!res || !res.ok) {
      const data = res ? ((await res.json().catch(() => ({}))) as { error?: string }) : {};
      setError(data.error ?? "That did not go through.");
      setWorking(null);
      return;
    }
    const data = (await res.json()) as { donation?: Donation };
    if (data.donation) {
      setRows((rs) =>
        rs.map((r) =>
          r.id === id ? { ...r, ...data.donation, amount: Number(data.donation!.amount) } : r,
        ),
      );
    }
    setWorking(null);
    if (filter !== "all") void load();
  }

  /**
   * Sends through the Cloud API when the committee has configured it,
   * and otherwise opens WhatsApp with the message already written.
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

    if (data.emailed && data.emailed.startsWith("failed")) {
      setError(`Email ${data.emailed}`);
    }

    if (data.link) {
      window.open(data.link, "_blank", "noopener");
      await act(d.id, "receipt-sent");
      setWorking(null);
      return;
    }

    if (!data.ok) setError(data.error ?? "Could not send that.");
    setWorking(null);
    void load();
  }

  const totals = useMemo(() => {
    const verified = rows.filter((r) => r.status === "verified");
    return {
      count: rows.length,
      shown: rows.reduce((s, r) => s + Number(r.amount), 0),
      verified: verified.reduce((s, r) => s + Number(r.amount), 0),
      awaiting: rows.filter((r) => r.status === "pending").length,
    };
  }, [rows]);

  return (
    <div>
      <AddDonor onAdded={() => void load()} />

      {/* ---- summary ---- */}
      <div className="grid gap-px overflow-hidden border border-line bg-line sm:grid-cols-4">
        <Cell label="Rows shown" value={String(totals.count)} />
        <Cell label="Awaiting check" value={String(totals.awaiting)} tone="sindoor" />
        <Cell label="Verified in view" value={formatINR(totals.verified)} />
        <Cell label="Total in view" value={formatINR(totals.shown)} />
      </div>

      {/* ---- controls ---- */}
      <div className="mt-6 flex flex-wrap items-center gap-2">
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

        <label className="relative min-w-[12rem] flex-1">
          <Search
            size={14}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint"
          />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Name, email, phone, UTR, receipt or SR number"
            className="field !py-2 !pl-9 !text-[0.8rem]"
          />
        </label>

        <button onClick={() => void load()} className="btn btn-ghost !py-2 !text-[0.68rem]">
          <RefreshCw size={13} className={loading ? "animate-spin" : ""} /> Refresh
        </button>

        <a
          href={`/api/admin/export?what=donations&status=${filter}`}
          className="btn btn-ghost !py-2 !text-[0.68rem]"
        >
          <Download size={13} /> CSV
        </a>
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
            Nothing here. {filter === "pending" && "Every declaration has been checked."}
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
                    {d.anonymous && (
                      <span className="text-[0.6rem] uppercase tracking-[0.18em] text-ink-faint">
                        Anonymous on board
                      </span>
                    )}
                  </div>

                  <dl className="mt-3 grid gap-x-6 gap-y-1.5 text-[0.78rem] sm:grid-cols-2 lg:grid-cols-3">
                    <Item label="Category" value={d.category} />
                    <Item label="SR" value={d.sr_number ?? "not given"} />
                    <Item label="Email" value={d.email} />
                    <Item label="WhatsApp" value={`+91 ${d.phone}`} />
                    <Item label="Mode" value={d.method.toUpperCase()} />
                    <Item label="Reference" value={d.reference ?? "not given"} />
                    <Item label="Paid on" value={formatDate(d.paid_on)} />
                    <Item label="Declared" value={formatDateTime(d.created_at)} />
                    {d.verified_by && (
                      <Item label="Verified by" value={d.verified_by} />
                    )}
                    {d.receipt_sent_at && (
                      <Item
                        label="Receipt sent"
                        value={formatDateTime(d.receipt_sent_at)}
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

              {/* ---- actions ---- */}
              <div className="mt-5 flex flex-wrap gap-2 border-t border-line pt-4">
                {d.status !== "verified" && (
                  <button
                    onClick={() => act(d.id, "verify")}
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

                {d.status === "verified" && (
                  <>
                    <a
                      href={`/receipt/${d.receipt_token}`}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-ghost !py-1.5 !text-[0.65rem]"
                    >
                      Open receipt
                    </a>
                    <button
                      onClick={() => sendReceipt(d)}
                      disabled={working === d.id}
                      className="btn btn-ghost !py-1.5 !text-[0.65rem] !border-leaf !text-leaf"
                    >
                      <WhatsappIcon size={12} /> Send the receipt
                    </button>
                  </>
                )}

                {d.status !== "rejected" && (
                  <button
                    onClick={() => act(d.id, "reject")}
                    disabled={working === d.id}
                    className="btn btn-ghost !py-1.5 !text-[0.65rem]"
                  >
                    <X size={12} /> Not found in statement
                  </button>
                )}

                {d.status !== "pending" && (
                  <button
                    onClick={() => act(d.id, "pending")}
                    disabled={working === d.id}
                    className="btn btn-ghost !py-1.5 !text-[0.65rem]"
                  >
                    <Undo2 size={12} /> Back to pending
                  </button>
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
