"use client";

import { useEffect, useState } from "react";
import { PUJA_DATES } from "@/lib/site";

const TARGET = new Date(PUJA_DATES.countdownTo).getTime();

const UNITS = [
  { key: "days", label: "Days", bangla: "দিন" },
  { key: "hours", label: "Hours", bangla: "ঘণ্টা" },
  { key: "minutes", label: "Minutes", bangla: "মিনিট" },
  { key: "seconds", label: "Seconds", bangla: "সেকেন্ড" },
] as const;

function split(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return {
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
  };
}

export default function Countdown() {
  const [left, setLeft] = useState<ReturnType<typeof split> | null>(null);

  useEffect(() => {
    const tick = () => setLeft(split(TARGET - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const done = left !== null && TARGET - Date.now() <= 0;

  if (done) {
    return (
      <p className="bangla text-center text-[1.272rem] text-gold">
        মা এসেছেন। <span className="font-body text-ink-soft">Ma is here.</span>
      </p>
    );
  }

  return (
    <div
      className="flex items-stretch justify-center gap-0"
      role="timer"
      aria-live="off"
      aria-label="Time remaining until Bodhon"
    >
      {UNITS.map((u, i) => (
        <div key={u.key} className="flex items-stretch">
          {i > 0 && (
            <span
              className="mx-1 self-center text-[1.4rem] font-light text-gold/40 sm:mx-2"
              aria-hidden
            >
              ·
            </span>
          )}
          <div className="min-w-[3.6rem] text-center sm:min-w-[4.8rem]">
            <span className="block font-display text-[2.058rem] font-light leading-none tabular-nums text-ink sm:text-[2.618rem]">
              {left === null
                ? "––"
                : String(left[u.key]).padStart(2, "0")}
            </span>
            <span className="mt-2 block text-[0.6rem] uppercase tracking-[0.22em] text-ink-faint">
              {u.label}
            </span>
            <span className="bangla block text-[0.66rem] text-gold/70">
              {u.bangla}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
