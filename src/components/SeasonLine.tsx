"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useNow } from "@/lib/browser";
import { seasonNote, type DayNames, type PujaDates } from "@/lib/season";

/**
 * The line above the title that says where the season stands: Mahalaya
 * tomorrow, the broadcast on air, Bodhon in four days, today at the
 * pandal. Worked out in the browser, because the page around it is
 * cached and cannot know what day it is being read on.
 *
 * The box keeps its height before the line appears, so the title
 * below it does not jump when it does.
 */
export default function SeasonLine({
  dates,
  names,
  className = "",
}: {
  dates: PujaDates;
  names: DayNames;
  className?: string;
}) {
  const now = useNow(30_000);
  const note = now === null ? null : seasonNote(now, dates, names);

  return (
    <div className={`flex min-h-[2.4rem] items-center justify-center ${className}`}>
      {note && (
        <Link
          href={note.href}
          className="group inline-flex max-w-full items-center gap-2.5 rounded-full border border-gold/50 bg-paper/75 px-4 py-1.5 text-left text-[0.72rem] leading-snug text-ink backdrop-blur-sm transition-colors hover:border-sindoor sm:text-[0.78rem]"
        >
          {note.live ? (
            <span className="relative flex h-2 w-2 shrink-0" aria-hidden>
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sindoor opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-sindoor" />
            </span>
          ) : (
            <span className="h-1.5 w-1.5 shrink-0 rotate-45 bg-gold" aria-hidden />
          )}
          <span className="bangla shrink-0 text-sindoor">{note.bangla}</span>
          <span className="min-w-0">{note.text}</span>
          <ArrowRight
            size={13}
            className="shrink-0 text-gold transition-transform group-hover:translate-x-0.5"
          />
        </Link>
      )}
    </div>
  );
}
