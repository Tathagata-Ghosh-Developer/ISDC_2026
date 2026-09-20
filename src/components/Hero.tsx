"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ChevronDown } from "lucide-react";
import Countdown from "./Countdown";
import Kash from "./Kash";
import type { Config } from "@/lib/config";

const EASE = [0.22, 1, 0.36, 1] as const;

export default function Hero({
  hero,
  bodhonLabel,
  countdownTo,
}: {
  hero: Config["hero"];
  bodhonLabel: string;
  countdownTo: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const campusY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const idolY = useTransform(scrollYProgress, [0, 1], ["0%", "-12%"]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);
  const fade = useTransform(scrollYProgress, [0, 0.75], [1, 0]);

  return (
    <section
      ref={ref}
      className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden pt-24"
    >
      {/* Layer 1 — the campus, sunk into the paper */}
      <motion.div
        style={reduce ? undefined : { y: campusY }}
        className="absolute inset-0 -z-30"
      >
        <Image
          src={hero.campusImage}
          alt=""
          fill
          priority
          sizes="100vw"
          className="scale-110 object-cover opacity-[0.22] [filter:sepia(0.75)_contrast(1.05)]"
        />
      </motion.div>

      {/* Layer 2 — paper wash and vignette */}
      <div
        className="absolute inset-0 -z-20"
        style={{
          background:
            "radial-gradient(ellipse 120% 80% at 50% 8%, transparent 0%, var(--c-paper) 72%), linear-gradient(180deg, transparent 40%, var(--c-paper) 96%)",
        }}
      />

      {/* Layer 3 — the goddess, framed in a chalchitra arch */}
      <motion.div
        style={reduce ? undefined : { y: idolY }}
        className="pointer-events-none absolute left-1/2 top-[8%] -z-10 w-[min(62vw,30rem)] -translate-x-1/2 sm:top-[6%]"
      >
        <div className="arch lamp relative aspect-[3/4] w-full overflow-hidden opacity-[0.5] sm:opacity-[0.42]">
          <Image
            src={hero.image}
            alt="Durga, after Nandalal Bose"
            fill
            priority
            sizes="(max-width: 640px) 62vw, 30rem"
            className="object-cover [filter:sepia(0.3)_saturate(1.1)]"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse at 50% 42%, transparent 20%, var(--c-paper) 82%)",
            }}
          />
        </div>
      </motion.div>

      <Kash count={20} />

      {/* Layer 4 — the words */}
      <motion.div
        style={reduce ? undefined : { y: textY, opacity: fade }}
        className="relative z-10 flex w-full max-w-[1180px] flex-col items-center px-5 text-center md:px-8"
      >
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.15, ease: EASE }}
          className="eyebrow"
        >
          {hero.eyebrow}
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.28, ease: EASE }}
          className="bangla mt-5 text-[2.618rem] font-semibold leading-[1.12] text-ink sm:text-[4.236rem] lg:text-[5.388rem]"
        >
          <HeroTitle text={hero.titleBangla} />
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, delay: 0.42, ease: EASE }}
          className="font-display mt-1 text-[1.272rem] font-light uppercase tracking-[0.42em] text-ink-soft sm:text-[1.618rem]"
        >
          {hero.titleRoman}
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, delay: 0.55, ease: EASE }}
          className="font-display mt-8 max-w-[34ch] text-[1.272rem] font-light italic leading-snug text-ink-soft sm:max-w-[42ch] sm:text-[1.618rem]"
        >
          {hero.subtitle}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.7, ease: EASE }}
          className="mt-[2.618rem] w-full"
        >
          <Countdown target={countdownTo} />
          <p className="mt-4 text-[0.7rem] uppercase tracking-[0.28em] text-ink-faint">
            {bodhonLabel}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.82, ease: EASE }}
          className="mt-[2.618rem] flex flex-wrap items-center justify-center gap-3"
        >
          <Link href={hero.ctaPrimary.href} className="btn btn-primary">
            {hero.ctaPrimary.label}
          </Link>
          <Link href={hero.ctaSecondary.href} className="btn btn-ghost">
            {hero.ctaSecondary.label}
          </Link>
        </motion.div>
      </motion.div>

      <motion.a
        href="#ahwan"
        aria-label="Scroll"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 1 }}
        className="absolute bottom-6 z-10 text-gold"
      >
        <ChevronDown size={22} className="animate-bounce" />
      </motion.a>
    </section>
  );
}

/** Gilds the last word of the title, whatever the committee sets it to. */
function HeroTitle({ text }: { text: string }) {
  const words = text.trim().split(/\s+/);
  if (words.length < 2) return <span className="gilt">{text}</span>;
  const last = words.pop() as string;
  return (
    <>
      {words.join(" ")} <span className="gilt">{last}</span>
    </>
  );
}
