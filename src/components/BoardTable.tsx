"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import type { BoardEntry } from "@/lib/db";
import { formatINR, formatDate } from "@/lib/format";
import { DONOR_CATEGORIES } from "@/lib/site";

type Sort = "recent" | "amount" | "name";

const PAGE = 40;

export default function BoardTable({ entries }: { entries: BoardEntry[] }) {
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState<Sort>("recent");
  const [shown, setShown] = useState(PAGE);

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const filtered = entries.filter((e) => {
      if (category !== "all" && e.category !== category) return false;
      if (!needle) return true;
      return (
        e.name.toLowerCase().includes(needle) ||
        (e.message ?? "").toLowerCase().includes(needle)
      );
    });

    const sorted = [...filtered];
    if (sort === "amount") sorted.sort((a, b) => b.amount - a.amount);
    else if (sort === "name") sorted.sort((a, b) => a.name.localeCompare(b.name));
    return sorted;
  }, [entries, q, category, sort]);

  if (entries.length === 0) {
    return (
      <p className="surface p-8 text-center text-[0.88rem] leading-relaxed text-ink-soft">
        No verified donations yet. Yours could be the first name on the board.
      </p>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <label className="relative min-w-[11rem] flex-1">
          <Search
            size={14}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint"
          />
          <input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setShown(PAGE);
            }}
            placeholder="Find a name"
            aria-label="Search donors"
            className="field !py-2 !pl-9 !text-[0.82rem]"
          />
        </label>

        <select
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setShown(PAGE);
          }}
          aria-label="Filter by category"
          className="field !w-auto !py-2 !text-[0.82rem]"
        >
          <option value="all">Everyone</option>
          {DONOR_CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as Sort)}
          aria-label="Sort"
          className="field !w-auto !py-2 !text-[0.82rem]"
        >
          <option value="recent">Most recent</option>
          <option value="amount">Largest first</option>
          <option value="name">By name</option>
        </select>
      </div>

      <p className="mt-3 text-[0.7rem] uppercase tracking-[0.2em] text-ink-faint">
        {rows.length} {rows.length === 1 ? "entry" : "entries"}
      </p>

      <ul className="mt-4 divide-y divide-line border-y border-line">
        {rows.slice(0, shown).map((e, i) => (
          <motion.li
            key={e.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.35, delay: Math.min(i, 12) * 0.015 }}
            className="flex items-baseline justify-between gap-4 py-3.5"
          >
            <div className="min-w-0">
              <p className="truncate text-[0.92rem] text-ink">{e.name}</p>
              {e.message && (
                <p className="mt-0.5 truncate text-[0.76rem] italic text-ink-faint">
                  {e.message}
                </p>
              )}
              <p className="mt-0.5 text-[0.62rem] uppercase tracking-[0.18em] text-ink-faint">
                {e.category} {formatDate(e.verified_at)}
              </p>
            </div>
            <span className="shrink-0 font-display text-[1.1rem] tabular-nums text-sindoor">
              {formatINR(e.amount)}
            </span>
          </motion.li>
        ))}
      </ul>

      {shown < rows.length && (
        <button
          onClick={() => setShown((s) => s + PAGE)}
          className="btn btn-ghost mt-6 w-full"
        >
          Show {Math.min(PAGE, rows.length - shown)} more
        </button>
      )}
    </div>
  );
}
