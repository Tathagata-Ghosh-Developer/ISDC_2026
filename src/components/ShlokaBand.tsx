"use client";

import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { shlokaFor } from "@/lib/content/shlokas";

/**
 * A different verse on every page, set on a dark field like the
 * closing card of a film. Reads the route rather than taking props,
 * so no page has to remember to pass one.
 */
export default function ShlokaBand() {
  const pathname = usePathname() ?? "/";
  const reduce = useReducedMotion();

  if (pathname.startsWith("/admin") || pathname.startsWith("/receipt")) {
    return null;
  }

  const shloka = shlokaFor(pathname);

  return (
    <section
      className="title-card relative overflow-hidden px-5 py-[4.236rem] sm:py-[6.854rem]"
      aria-label="Verse"
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 70% at 50% 50%, rgba(239,180,74,0.14), transparent 70%)",
        }}
      />

      <div className="relative mx-auto max-w-[46rem] text-center">
        <motion.p
          initial={reduce ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-20%" }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="bangla-display whitespace-pre-line text-[1.15rem] leading-[2.1] text-paper-3 sm:text-[1.5rem]"
        >
          {shloka.sanskrit}
        </motion.p>

        <motion.p
          initial={reduce ? false : { opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-20%" }}
          transition={{ duration: 1, delay: 0.25 }}
          className="mx-auto mt-6 max-w-[54ch] text-[0.86rem] italic leading-relaxed text-paper-3/60"
        >
          {shloka.meaning}
        </motion.p>

        <motion.p
          initial={reduce ? false : { opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-20%" }}
          transition={{ duration: 1, delay: 0.4 }}
          className="mt-5 text-[0.6rem] uppercase tracking-[0.3em] text-haldi"
        >
          {shloka.source}
        </motion.p>
      </div>
    </section>
  );
}
