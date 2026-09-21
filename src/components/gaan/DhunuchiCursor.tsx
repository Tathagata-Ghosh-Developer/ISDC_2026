"use client";

import { useEffect, useRef } from "react";

/* ================================================================
   The pointer carries a censer, and the smoke follows it.

   The cursor itself is a PNG set in CSS. This adds what a PNG cannot:
   smoke that lags behind the hand, drifts up, spreads and goes out.

   Written against the DOM directly rather than through React state,
   because a trail that re-renders a component tree on every pointer
   move is a trail that drops frames. A fixed pool of twenty elements
   is recycled; nothing is ever created or destroyed while moving.

   It does nothing at all on a touch screen, where there is no cursor
   to follow, and nothing for anyone who has asked for less motion.
   ================================================================ */

const PUFFS = 20;
/** Milliseconds between puffs while the pointer is moving. */
const EVERY = 55;
const LIFE = 2100;

type Puff = {
  el: HTMLSpanElement;
  born: number;
  x: number;
  y: number;
  drift: number;
  rise: number;
  size: number;
};

export default function DhunuchiCursor({
  selector = ".dhunuchi-zone",
}: {
  selector?: string;
}) {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const root = host.current;
    if (!root) return;

    const pool: Puff[] = [];
    for (let i = 0; i < PUFFS; i++) {
      const el = document.createElement("span");
      el.className = "dhunuchi-smoke";
      el.style.opacity = "0";
      root.appendChild(el);
      pool.push({ el, born: 0, x: 0, y: 0, drift: 0, rise: 0, size: 1 });
    }

    let next = 0;
    let lastEmit = 0;
    let inside = false;
    let px = 0;
    let py = 0;
    let raf = 0;

    function emit(now: number) {
      const p = pool[next];
      next = (next + 1) % PUFFS;
      p.born = now;
      // The lip of the bowl, which is where the cursor's hotspot is.
      p.x = px + (Math.random() - 0.5) * 5;
      p.y = py - 2;
      p.drift = (Math.random() - 0.5) * 34;
      p.rise = 42 + Math.random() * 46;
      p.size = 0.75 + Math.random() * 0.9;
    }

    function frame(now: number) {
      raf = requestAnimationFrame(frame);
      for (const p of pool) {
        if (!p.born) continue;
        const age = (now - p.born) / LIFE;
        if (age >= 1) {
          p.born = 0;
          p.el.style.opacity = "0";
          continue;
        }
        // Smoke accelerates as it thins, then stops meaning anything.
        const ease = age * age;
        const scale = p.size * (1 + age * 3.4);
        p.el.style.transform = `translate3d(${p.x + p.drift * ease}px, ${
          p.y - p.rise * Math.sqrt(age)
        }px, 0) scale(${scale})`;
        p.el.style.opacity = String((1 - age) * 0.5 * (1 - age * 0.35));
      }
    }

    function move(e: PointerEvent) {
      const over = (e.target as Element | null)?.closest?.(selector);
      inside = Boolean(over);
      if (!inside) return;
      px = e.clientX;
      py = e.clientY;
      const now = performance.now();
      if (now - lastEmit > EVERY) {
        lastEmit = now;
        emit(now);
      }
    }

    window.addEventListener("pointermove", move, { passive: true });
    raf = requestAnimationFrame(frame);

    return () => {
      window.removeEventListener("pointermove", move);
      cancelAnimationFrame(raf);
      for (const p of pool) p.el.remove();
    };
  }, [selector]);

  return <div ref={host} aria-hidden="true" />;
}
