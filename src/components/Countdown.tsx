"use client";

import { PUJA_DATES } from "@/lib/site";
import { useNow } from "@/lib/browser";
import { bijoyaFrom } from "@/lib/season";

const UNITS = [
  { key: "days", label: "Days", bangla: "দিন" },
  { key: "hours", label: "Hours", bangla: "ঘণ্টা" },
  { key: "minutes", label: "Minutes", bangla: "মিনিট" },
  { key: "seconds", label: "Seconds", bangla: "সেকেন্ড" },
] as const;

/**
 * One thing to count down to. A stage can also hold the floor for a
 * while once it arrives: Mahalaya morning shows "on air" for the
 * length of the broadcast before the count moves on to Bodhon.
 */
export type Stage = {
  at: string;
  label?: string;
  until?: string;
  live?: { text: string; bangla?: string; href?: string };
};

function split(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return {
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
  };
}

/** The stage to count to, the stage on air, or neither once all have passed. */
function current(stages: Stage[], now: number) {
  for (const s of stages) {
    if (now < Date.parse(s.at)) return { counting: s, live: null };
    if (s.live && s.until && now < Date.parse(s.until)) return { counting: null, live: s };
  }
  return { counting: null, live: null };
}

export default function Countdown({
  target = PUJA_DATES.countdownTo,
  stages,
  dashami = PUJA_DATES.dashami,
}: {
  target?: string;
  stages?: Stage[];
  /** After this day ends the count gives way to the farewell. */
  dashami?: string;
}) {
  const now = useNow(1000);
  const list = stages ?? [{ at: target }];
  const state = now === null ? { counting: list[0], live: null } : current(list, now);
  const showLabels = list.some((s) => s.label);

  if (state.live?.live) {
    const { text, bangla, href } = state.live.live;
    const body = (
      <span className="flex flex-col items-center gap-2 text-center">
        <span className="flex items-center gap-2 text-[0.66rem] uppercase tracking-[0.28em] text-sindoor">
          <span className="relative flex h-2 w-2" aria-hidden>
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sindoor opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-sindoor" />
          </span>
          On air
        </span>
        <span className="font-display text-[1.618rem] leading-snug text-ink sm:text-[2.058rem]">
          {text}
        </span>
        {bangla && <span className="bangla text-[1.05rem] text-gold">{bangla}</span>}
      </span>
    );
    return href ? (
      <a href={href} className="block hover:opacity-90">
        {body}
      </a>
    ) : (
      body
    );
  }

  if (!state.counting && now !== null && now >= bijoyaFrom({ dashami })) {
    return (
      <p className="bangla text-center text-[1.272rem] text-gold">
        আসছে বছর আবার হবে।{" "}
        <span className="font-body text-ink-soft">She comes again next year.</span>
      </p>
    );
  }

  if (!state.counting) {
    return (
      <p className="bangla text-center text-[1.272rem] text-gold">
        মা এসেছেন। <span className="font-body text-ink-soft">Ma is here.</span>
      </p>
    );
  }

  const left = now === null ? null : split(Date.parse(state.counting.at) - now);

  return (
    <div>
      <div
        className="flex items-stretch justify-center gap-0"
        role="timer"
        aria-live="off"
        aria-label={state.counting.label ? `Time remaining ${state.counting.label}` : "Time remaining"}
      >
        {UNITS.map((u) => (
          <div key={u.key} className="flex items-stretch">
            <div className="min-w-[3.6rem] px-0.5 text-center sm:min-w-[4.8rem] short:!min-w-[3.9rem]">
              <span className="block font-display text-[2.058rem] font-normal leading-none tabular-nums text-ink sm:text-[2.618rem] short:!text-[2.058rem] wide-short:!text-[2.3rem]">
                {left === null ? "––" : String(left[u.key]).padStart(2, "0")}
              </span>
              <span className="mt-2 block text-[0.6rem] uppercase tracking-[0.05em] text-ink-faint min-[360px]:tracking-[0.12em] sm:tracking-[0.22em] short:mt-1 short:tracking-[0.06em]">
                {u.label}
              </span>
              <span className="bangla block text-[0.66rem] text-gold/70">{u.bangla}</span>
            </div>
          </div>
        ))}
      </div>
      {showLabels && (
        <p
          className={`mt-6 min-h-[1.2em] text-center text-[0.72rem] uppercase tracking-[0.24em] text-ink-faint transition-opacity ${
            now === null ? "opacity-0" : "opacity-100"
          }`}
        >
          {state.counting.label}
        </p>
      )}
    </div>
  );
}
