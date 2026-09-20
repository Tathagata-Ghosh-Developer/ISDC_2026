"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { BrushRule } from "./Brush";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * A film title card, after the ones Satyajit Ray lettered by hand for
 * his own films: a flat field, oversized brush Bengali, and a small
 * roman line underneath doing all the explaining.
 */
export default function TitleCard({
  bangla,
  roman,
  caption,
}: {
  bangla: string;
  roman: string;
  caption?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const drift = useTransform(scrollYProgress, [0, 1], ["6%", "-6%"]);

  return (
    <section
      ref={ref}
      className="title-card relative flex min-h-[62svh] items-center justify-center overflow-hidden px-5 py-[4.236rem]"
    >
      {/* a single scarlet block, off-centre, the way Ray placed them */}
      <motion.div
        aria-hidden
        style={reduce ? undefined : { y: drift }}
        className="pointer-events-none absolute -left-[8%] top-[14%] h-[42%] w-[38%]"
      >
        <div className="h-full w-full bg-sindoor opacity-[0.86]" />
      </motion.div>
      <motion.div
        aria-hidden
        style={reduce ? undefined : { y: drift }}
        className="pointer-events-none absolute -right-[6%] bottom-[10%] h-[26%] w-[26%] rounded-full border-[6px] border-haldi opacity-70"
      />

      <div className="relative z-10 mx-auto max-w-[52rem] text-center">
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-20%" }}
          transition={{ duration: 1, ease: EASE }}
          className="bangla-display text-[2.618rem] leading-[1.22] text-paper-3 sm:text-[4.236rem] lg:text-[5.388rem]"
        >
          {bangla}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scaleX: 0.3 }}
          whileInView={{ opacity: 1, scaleX: 1 }}
          viewport={{ once: true, margin: "-20%" }}
          transition={{ duration: 1.1, delay: 0.25, ease: EASE }}
          className="mx-auto mt-6 w-[14rem] origin-center text-haldi"
        >
          <BrushRule width={224} className="w-full" />
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-20%" }}
          transition={{ duration: 1, delay: 0.4 }}
          className="font-display mt-6 text-[1.1rem] uppercase tracking-[0.4em] text-paper-3/80 sm:text-[1.272rem]"
        >
          {roman}
        </motion.p>

        {caption && (
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-20%" }}
            transition={{ duration: 1, delay: 0.55 }}
            className="mx-auto mt-7 max-w-[46ch] text-[0.88rem] leading-relaxed text-paper-3/55"
          >
            {caption}
          </motion.p>
        )}
      </div>
    </section>
  );
}
