"use client";

import { useEffect, useRef } from "react";
import { istParts } from "@/lib/format";

/**
 * Date and time of payment, filled in from the server's clock and kept
 * ticking until someone changes them by hand. Named paid_on and
 * paid_time, so any form that posts its fields picks them up.
 *
 * The inputs are uncontrolled and written to directly. A form reset
 * clears the DOM without telling React, and a controlled input whose
 * state has not changed is never re-rendered, so after a save the next
 * entry would have posted a blank date. Writing the value keeps what the
 * visitor sees and what the form posts the same thing.
 */
export default function PaidAt({
  initialDate = "",
  initialTime = "",
  live = true,
  className = "field",
}: {
  initialDate?: string;
  initialTime?: string;
  /** Off when editing an old entry: its date is history, not now. */
  live?: boolean;
  className?: string;
}) {
  const dateInput = useRef<HTMLInputElement>(null);
  const timeInput = useRef<HTMLInputElement>(null);
  const touched = useRef(false);

  useEffect(() => {
    if (!live) return;
    let offset = 0;
    let alive = true;
    const tick = () => {
      if (!alive || touched.current || !dateInput.current || !timeInput.current) return;
      const p = istParts(Date.now() + offset);
      dateInput.current.value = p.date;
      timeInput.current.value = p.time;
    };
    const sync = () => {
      const t0 = Date.now();
      fetch("/api/now", { cache: "no-store" })
        .then((r) => r.json() as Promise<{ now: number }>)
        .then(({ now }) => {
          offset = now - (t0 + Date.now()) / 2;
          tick();
        })
        // No answer: the phone's own clock is better than a blank.
        .catch(tick);
    };
    sync();
    // A saved and reset form starts the next entry at the real time again.
    // The reset event fires before the browser clears the fields, hence
    // the deferred tick.
    const form = dateInput.current?.form;
    const onReset = () => {
      touched.current = false;
      setTimeout(tick, 0);
    };
    form?.addEventListener("reset", onReset);
    const ticking = setInterval(tick, 15_000);
    const resync = setInterval(sync, 10 * 60_000);
    return () => {
      alive = false;
      clearInterval(ticking);
      clearInterval(resync);
      form?.removeEventListener("reset", onReset);
    };
  }, [live]);

  const edited = () => {
    touched.current = true;
  };

  return (
    <div className="grid grid-cols-[1.4fr_1fr] gap-2">
      <input
        ref={dateInput}
        name="paid_on"
        type="date"
        aria-label="Date of payment"
        className={className}
        defaultValue={initialDate}
        onInput={edited}
      />
      <input
        ref={timeInput}
        name="paid_time"
        type="time"
        aria-label="Time of payment"
        className={className}
        defaultValue={initialTime}
        onInput={edited}
      />
    </div>
  );
}
