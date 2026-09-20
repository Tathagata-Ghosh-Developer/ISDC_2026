"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Download, Loader2, Plus, Trash2 } from "lucide-react";
import type { Expense } from "@/lib/db";
import { formatINR, formatDate } from "@/lib/format";

const HEADS = [
  "Pratima",
  "Pandal",
  "Decoration",
  "Priest and rituals",
  "Bhog and prasad",
  "Dhaki and musicians",
  "Sound and lighting",
  "Cultural programme",
  "Magazine",
  "Permissions",
  "Transport",
  "Miscellaneous",
];

export default function ExpensesPanel() {
  const [rows, setRows] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/expenses").catch(() => null);
    if (res?.ok) {
      const data = (await res.json()) as { expenses?: Expense[] };
      setRows(data.expenses ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function add(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    setBusy(true);
    setError(null);

    const res = await fetch("/api/admin/expenses", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        head: fd.get("head"),
        description: fd.get("description"),
        amount: Number(fd.get("amount")),
        spent_on: fd.get("spent_on"),
        vendor: fd.get("vendor"),
        bill_url: fd.get("bill_url"),
        published: fd.get("published") === "on",
      }),
    }).catch(() => null);

    const data = res ? ((await res.json().catch(() => ({}))) as { error?: string }) : {};
    if (!res || !res.ok) {
      setError(data.error ?? "Could not save that.");
      setBusy(false);
      return;
    }

    form.reset();
    setBusy(false);
    void load();
  }

  async function remove(id: string) {
    if (!confirm("Delete this expense line? This cannot be undone.")) return;
    await fetch(`/api/admin/expenses?id=${id}`, { method: "DELETE" });
    void load();
  }

  const total = rows.reduce((s, r) => s + r.amount, 0);
  const published = rows.filter((r) => r.published).reduce((s, r) => s + r.amount, 0);

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1.618fr] lg:items-start">
      {/* ---- add ---- */}
      <form onSubmit={add} className="surface space-y-4 p-6 lg:sticky lg:top-24">
        <h2 className="font-display text-[1.272rem] text-ink">Record a payment</h2>

        <label className="block">
          <Lbl>Head</Lbl>
          <input
            name="head"
            required
            list="expense-heads"
            className="field mt-2"
            placeholder="Pratima"
          />
          <datalist id="expense-heads">
            {HEADS.map((h) => (
              <option key={h} value={h} />
            ))}
          </datalist>
        </label>

        <label className="block">
          <Lbl>Amount</Lbl>
          <input
            name="amount"
            type="number"
            step="0.01"
            min="0"
            required
            className="field mt-2"
            inputMode="decimal"
          />
        </label>

        <label className="block">
          <Lbl>Paid on</Lbl>
          <input name="spent_on" type="date" className="field mt-2" />
        </label>

        <label className="block">
          <Lbl>Vendor</Lbl>
          <input name="vendor" className="field mt-2" placeholder="Who was paid" />
        </label>

        <label className="block">
          <Lbl>Detail</Lbl>
          <textarea
            name="description"
            rows={2}
            className="field mt-2 resize-none"
            placeholder="What it covered"
          />
        </label>

        <label className="block">
          <Lbl>Bill link</Lbl>
          <input
            name="bill_url"
            className="field mt-2"
            placeholder="Optional URL to a scanned bill"
          />
        </label>

        <label className="flex items-center gap-2.5 text-[0.8rem] text-ink-soft">
          <input
            type="checkbox"
            name="published"
            defaultChecked
            className="accent-[var(--c-sindoor)]"
          />
          Show on the public board
        </label>

        {error && (
          <p className="border border-sindoor/40 p-3 text-[0.8rem] text-sindoor">
            {error}
          </p>
        )}

        <button disabled={busy} className="btn btn-primary w-full">
          {busy ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
          Add expense
        </button>
      </form>

      {/* ---- list ---- */}
      <div>
        <div className="grid gap-px overflow-hidden border border-line bg-line sm:grid-cols-3">
          <Cell label="Lines" value={String(rows.length)} />
          <Cell label="Published" value={formatINR(published)} />
          <Cell label="Total recorded" value={formatINR(total)} tone="sindoor" />
        </div>

        <div className="mt-4 flex justify-end">
          <a href="/api/admin/export?what=expenses" className="btn btn-ghost !py-2 !text-[0.68rem]">
            <Download size={13} /> CSV
          </a>
        </div>

        {loading ? (
          <p className="py-12 text-center">
            <Loader2 size={16} className="mx-auto animate-spin text-ink-faint" />
          </p>
        ) : rows.length === 0 ? (
          <p className="surface mt-4 p-8 text-center text-[0.85rem] text-ink-soft">
            No expenses recorded yet.
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-line border-y border-line">
            <AnimatePresence initial={false}>
              {rows.map((e) => (
                <motion.li
                  key={e.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-start justify-between gap-4 py-4"
                >
                  <div className="min-w-0">
                    <p className="text-[0.95rem] text-ink">
                      {e.head}
                      {!e.published && (
                        <span className="ml-2 border border-gold px-1.5 py-0.5 text-[0.55rem] uppercase tracking-[0.16em] text-gold">
                          Hidden
                        </span>
                      )}
                    </p>
                    {e.description && (
                      <p className="mt-0.5 text-[0.8rem] text-ink-soft">
                        {e.description}
                      </p>
                    )}
                    <p className="mt-1 text-[0.68rem] uppercase tracking-[0.16em] text-ink-faint">
                      {formatDate(e.spent_on)}
                      {e.vendor ? ` ${e.vendor}` : ""}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="font-display text-[1.1rem] tabular-nums text-ink">
                      {formatINR(e.amount)}
                    </span>
                    <button
                      onClick={() => remove(e.id)}
                      aria-label="Delete"
                      className="grid h-7 w-7 place-items-center border border-line text-ink-faint transition-colors hover:border-sindoor hover:text-sindoor"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </div>
    </div>
  );
}

function Lbl({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[0.62rem] uppercase tracking-[0.22em] text-ink-soft">
      {children}
    </span>
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
