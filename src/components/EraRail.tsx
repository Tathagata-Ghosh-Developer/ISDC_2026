"use client";

import { useEffect, useState } from "react";

/**
 * A sticky rail that tracks which era is on screen. Uses an observer
 * rather than a scroll handler, so it costs nothing while idle.
 */
export default function EraRail({ eras }: { eras: readonly string[] }) {
  const [active, setActive] = useState(eras[0]);

  useEffect(() => {
    const sections = eras
      .map((e) => document.getElementById(e.toLowerCase()))
      .filter((el): el is HTMLElement => el !== null);

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: [0, 0.25, 0.5, 1] },
    );

    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [eras]);

  return (
    <nav
      aria-label="Eras"
      className="sticky top-[3.6rem] z-30 border-y border-line bg-paper/90 backdrop-blur-xl"
    >
      <div className="mx-auto flex max-w-[1180px] gap-1 overflow-x-auto px-4 py-2.5 md:px-8">
        {eras.map((era) => {
          const id = era.toLowerCase();
          const on = active === id || active === era;
          return (
            <a
              key={era}
              href={`#${id}`}
              className={`shrink-0 whitespace-nowrap px-3 py-1.5 text-[0.72rem] uppercase tracking-[0.18em] transition-colors ${
                on ? "text-sindoor" : "text-ink-faint hover:text-ink"
              }`}
            >
              {era}
              {on && (
                <span className="mt-1 block h-px w-full bg-sindoor" aria-hidden />
              )}
            </a>
          );
        })}
      </div>
    </nav>
  );
}
