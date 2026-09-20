"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

export type Shot = { src: string; alt: string };

const EASE = [0.22, 1, 0.36, 1] as const;

export default function Lightbox({
  shots,
  sepia = false,
}: {
  shots: Shot[];
  sepia?: boolean;
}) {
  const [index, setIndex] = useState<number | null>(null);

  const close = useCallback(() => setIndex(null), []);
  const step = useCallback(
    (by: number) =>
      setIndex((i) => (i === null ? null : (i + by + shots.length) % shots.length)),
    [shots.length],
  );

  useEffect(() => {
    if (index === null) return;
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
  }, [index, close, step]);

  return (
    <>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {shots.map((s, i) => (
          <motion.li
            key={s.src}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-8%" }}
            transition={{ duration: 0.6, delay: Math.min(i, 8) * 0.04, ease: EASE }}
          >
            <button
              onClick={() => setIndex(i)}
              className="group relative block aspect-[4/5] w-full overflow-hidden"
              aria-label={`Open ${s.alt}`}
            >
              <Image
                src={s.src}
                alt={s.alt}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className={`object-cover transition-transform duration-[900ms] ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.06] ${
                  sepia ? "sepia-plate" : ""
                }`}
              />
              <span className="absolute inset-0 bg-ink/0 transition-colors duration-500 group-hover:bg-ink/10" />
            </button>
          </motion.li>
        ))}
      </ul>

      <AnimatePresence>
        {index !== null && (
          <motion.div
            className="fixed inset-0 z-[120] flex items-center justify-center bg-[#0b0709]/95 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={close}
            role="dialog"
            aria-modal="true"
            aria-label={shots[index].alt}
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
              key={shots[index].src}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.45, ease: EASE }}
              className="relative max-h-[86vh] w-full max-w-[64rem]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative mx-auto aspect-[4/3] max-h-[78vh] w-full">
                <Image
                  src={shots[index].src}
                  alt={shots[index].alt}
                  fill
                  sizes="100vw"
                  className="object-contain"
                  priority
                />
              </div>
              <figcaption className="mt-3 text-center text-[0.72rem] uppercase tracking-[0.2em] text-[#f0dcc0]/55">
                {shots[index].alt} {index + 1} of {shots.length}
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
    </>
  );
}
