"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import type { BoardEntry } from "@/lib/db";
import { formatINR } from "@/lib/format";

const PAGE = 50;
const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Everyone who has given, ranked by amount. One list, no categories
 * separated out, and no running total anywhere: the committee asked
 * for names and amounts only.
 */
export default function Leaderboard({ entries }: { entries: BoardEntry[] }) {
  const [q, setQ] = useState("");
  const [shown, setShown] = useState(PAGE);

  const ranked = useMemo(
    () => [...entries].sort((a, b) => b.amount - a.amount),
    [entries],
  );

  /** Rank is position on the whole board, not within the filter. */
  const withRank = useMemo(
    () => ranked.map((e, i) => ({ ...e, rank: i + 1 })),
    [ranked],
  );

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return withRank;
    return withRank.filter(
      (e) =>
        e.name.toLowerCase().includes(needle) ||
        (e.message ?? "").toLowerCase().includes(needle),
    );
  }, [withRank, q]);

  if (entries.length === 0) {
    return (
      <p className="surface p-8 text-center text-[0.88rem] leading-relaxed text-ink-soft">
        No names on the board yet. Yours could be the first.
      </p>
    );
  }

  return (
    <div>
      <label className="relative block max-w-[22rem]">
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
          aria-label="Search the board"
          className="field !py-2 !pl-9 !text-[0.85rem]"
        />
      </label>

      <p className="mt-3 text-[0.7rem] uppercase tracking-[0.2em] text-ink-faint">
        {rows.length} {rows.length === 1 ? "name" : "names"}
      </p>

      <ol className="mt-5 divide-y divide-line border-y border-line">
        {rows.slice(0, shown).map((e, i) => {
          const rank = e.rank;
          const top = rank <= 3;
          return (
            <motion.li
              key={`${rank}-${e.name}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.4,
                delay: Math.min(i, 14) * 0.02,
                ease: EASE,
              }}
              className="flex items-center gap-4 py-4"
            >
              <span
                className={`w-9 shrink-0 text-right font-display tabular-nums ${
                  top
                    ? "text-[1.4rem] text-gold"
                    : "text-[1rem] text-ink-faint"
                }`}
              >
                {rank}
              </span>

              <span className="min-w-0 flex-1">
                <span
                  className={`block truncate ${
                    top ? "text-[1.05rem] text-ink" : "text-[0.95rem] text-ink"
                  }`}
                >
                  {e.name}
                </span>
                {e.message && (
                  <span className="mt-0.5 block truncate text-[0.76rem] italic text-ink-faint">
                    {e.message}
                  </span>
                )}
              </span>

              <span
                className={`shrink-0 font-display tabular-nums ${
                  top ? "text-[1.4rem] text-sindoor" : "text-[1.1rem] text-sindoor"
                }`}
              >
                {formatINR(e.amount)}
              </span>
            </motion.li>
          );
        })}
      </ol>

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
