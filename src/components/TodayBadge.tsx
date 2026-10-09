"use client";

import { useNow } from "@/lib/browser";
import { pujaDayAt, type PujaDates } from "@/lib/season";

/** "Today", on the card for whichever Puja day it is in Bengaluru. */
export default function TodayBadge({ id, dates }: { id: string; dates: PujaDates }) {
  const now = useNow(60_000);
  if (now === null || pujaDayAt(now, dates) !== id) return null;
  return (
    <span className="mt-3 inline-flex items-center gap-2 rounded-full bg-sindoor px-3 py-1 text-[0.62rem] uppercase tracking-[0.24em] text-paper-3">
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-paper-3" aria-hidden />
      Today <span className="bangla normal-case tracking-normal">আজ</span>
    </span>
  );
}
