"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

export type Shot = { src: string; alt: string };

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * A rail of photographs that scrolls sideways, snaps, and opens into a
 * lightbox. Uses native scroll snapping rather than a carousel library,
 * so a phone flick behaves exactly as a phone flick should.
 */
export default function Carousel({
  shots,
  sepia = false,
  aspect = "4/5",
}: {
  shots: Shot[];
  sepia?: boolean;
  aspect?: string;
}) {
  const rail = useRef<HTMLUListElement>(null);
  const [open, setOpen] = useState<number | null>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const sync = useCallback(() => {
    const el = rail.current;
    if (!el) return;
    setAtStart(el.scrollLeft < 8);
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 8);
  }, []);

  useEffect(() => {
    sync();
    const el = rail.current;
    if (!el) return;
    el.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    return () => {
      el.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
    };
  }, [sync]);

  function nudge(by: number) {
    const el = rail.current;
    if (!el) return;
    el.scrollBy({ left: by * el.clientWidth * 0.8, behavior: "smooth" });
  }

  const close = useCallback(() => setOpen(null), []);
  const step = useCallback(
    (by: number) =>
      setOpen((i) =>
        i === null ? null : (i + by + shots.length) % shots.length,
      ),
    [shots.length],
  );

  useEffect(() => {
    if (open === null) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, close, step]);

  return (
    <div className="relative">
      <ul
        ref={rail}
        className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {shots.map((s, i) => (
          <li
            key={s.src}
            className="w-[68vw] shrink-0 snap-start sm:w-[38vw] lg:w-[24vw] xl:w-[19rem]"
          >
            <button
              onClick={() => setOpen(i)}
              className="group relative block w-full overflow-hidden"
              style={{ aspectRatio: aspect }}
              aria-label={`Open ${s.alt}`}
            >
              <Image
                src={s.src}
                alt={s.alt}
                fill
                sizes="(max-width: 640px) 68vw, (max-width: 1024px) 38vw, 20rem"
                className={`object-cover transition-transform duration-[900ms] ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.06] ${
                  sepia ? "sepia-plate" : ""
                }`}
              />
              <span className="absolute inset-0 bg-ink/0 transition-colors duration-500 group-hover:bg-ink/10" />
            </button>
          </li>
        ))}
      </ul>

      {/* arrows, hidden when there is nowhere to go */}
      <button
        onClick={() => nudge(-1)}
        disabled={atStart}
        aria-label="Scroll left"
        className="absolute -left-2 top-1/2 hidden h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-line bg-paper/90 text-ink-soft backdrop-blur transition-opacity hover:border-gold hover:text-gold disabled:pointer-events-none disabled:opacity-0 sm:grid"
      >
        <ChevronLeft size={18} />
      </button>
      <button
        onClick={() => nudge(1)}
        disabled={atEnd}
        aria-label="Scroll right"
        className="absolute -right-2 top-1/2 hidden h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-line bg-paper/90 text-ink-soft backdrop-blur transition-opacity hover:border-gold hover:text-gold disabled:pointer-events-none disabled:opacity-0 sm:grid"
      >
        <ChevronRight size={18} />
      </button>

      <AnimatePresence>
        {open !== null && (
          <motion.div
            className="fixed inset-0 z-[120] flex items-center justify-center bg-[#0b0709]/95 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={close}
            role="dialog"
            aria-modal="true"
            aria-label={shots[open].alt}
          >
            <button
              onClick={close}
              aria-label="Close"
              className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full border border-[#f0dcc0]/30 text-[#f0dcc0] transition-colors hover:border-[#efb44a] hover:text-[#efb44a]"
            >
              <X size={18} />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                step(-1);
              }}
              aria-label="Previous"
              className="absolute left-2 grid h-11 w-11 place-items-center rounded-full text-[#f0dcc0]/70 transition-colors hover:text-[#efb44a] sm:left-6"
            >
              <ChevronLeft size={24} />
            </button>

            <motion.figure
              key={shots[open].src}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.45, ease: EASE }}
              className="relative w-full max-w-[64rem]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative mx-auto aspect-[4/3] max-h-[78vh] w-full">
                <Image
                  src={shots[open].src}
                  alt={shots[open].alt}
                  fill
                  sizes="100vw"
                  className="object-contain"
                  priority
                />
              </div>
              <figcaption className="mt-3 text-center text-[0.72rem] uppercase tracking-[0.2em] text-[#f0dcc0]/55">
                {open + 1} of {shots.length}
              </figcaption>
            </motion.figure>

            <button
              onClick={(e) => {
                e.stopPropagation();
                step(1);
              }}
              aria-label="Next"
              className="absolute right-2 grid h-11 w-11 place-items-center rounded-full text-[#f0dcc0]/70 transition-colors hover:text-[#efb44a] sm:right-6"
            >
              <ChevronRight size={24} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
