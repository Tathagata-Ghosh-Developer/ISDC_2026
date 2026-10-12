"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ChevronDown } from "lucide-react";
import Countdown from "./Countdown";
import Kash from "./Kash";
import { PoweredBy } from "./Sponsors";
import SeasonLine from "./SeasonLine";
import type { Config } from "@/lib/config";
import type { DayNames } from "@/lib/season";

const EASE = [0.22, 1, 0.36, 1] as const;

export default function Hero({
  hero,
  bodhonLabel,
  countdownTo,
  dates,
  dayNames,
}: {
  hero: Config["hero"];
  bodhonLabel: string;
  countdownTo: string;
  dates: Config["dates"];
  dayNames: DayNames;
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
    /* The first screen, on every shape of screen. It starts below the
       masthead and keeps room at the foot for the scroll cue, so the cue
       never sits on the buttons. A landscape phone ("short") sets the
       title beside the countdown and the buttons, so both are on the
       first screen; a laptop with a short screen ("wide-short") steps
       the title down a size so the buttons still clear the fold. */
    <section
      ref={ref}
      className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden pt-[calc(var(--header-h)+env(safe-area-inset-top)+1rem)] pb-[4.5rem] short:pt-[calc(var(--header-h)+env(safe-area-inset-top)+0.5rem)] short:pb-4 lg:pt-[calc(var(--header-h)+env(safe-area-inset-top)+1.5rem)] wide-short:pt-[calc(var(--header-h)+env(safe-area-inset-top)+0.5rem)] wide-short:pb-8"
    >
      {/* Layer 1, the campus, sunk into the paper */}
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

      {/* Layer 2, paper wash and vignette */}
      <div
        className="absolute inset-0 -z-20"
        style={{
          background:
            "radial-gradient(ellipse 120% 80% at 50% 8%, transparent 0%, var(--c-paper) 72%), linear-gradient(180deg, transparent 40%, var(--c-paper) 96%)",
        }}
      />

      {/* Layer 3, the goddess, framed in a chalchitra arch */}
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

      {/* Layer 4, the words */}
      <motion.div
        style={reduce ? undefined : { y: textY, opacity: fade }}
        className="relative z-10 grid w-full max-w-page items-center px-5 text-center md:px-8 short:grid-cols-[1.1fr_1fr] short:gap-x-8"
      >
        {/* the title block */}
        <div className="flex flex-col items-center">
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
            className="bangla-display mt-5 text-[clamp(2.2rem,11.5vw,2.618rem)] compact:mt-3 leading-[1.18] text-ink short:mt-2 short:!text-[clamp(2rem,5.6vw,2.618rem)] sm:text-[4.236rem] lg:text-[5.388rem] wide-short:mt-3 wide-short:!text-[3.6rem] wide-short:leading-[1.12]"
          >
            <HeroTitle text={hero.titleBangla} />
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, delay: 0.42, ease: EASE }}
            className="font-display mt-3 text-[1.1rem] font-medium uppercase tracking-[0.46em] text-ink-soft short:mt-1 short:!text-[1rem] sm:text-[1.272rem] wide-short:mt-1"
          >
            {hero.titleRoman}
          </motion.p>

          {/* the title sponsor, as the last line of the title block */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, delay: 0.5, ease: EASE }}
            className="mt-4 short:mt-2 wide-short:mt-2 compact:mt-2"
          >
            <PoweredBy size="lg" className="justify-center" />
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, delay: 0.55, ease: EASE }}
            className="font-display mt-8 max-w-[34ch] text-[1.272rem] font-normal italic leading-snug text-ink-soft short:mt-3 short:!text-[1.05rem] sm:max-w-[42ch] sm:text-[1.618rem] wide-short:mt-4 wide-short:!text-[1.3rem] compact:mt-5"
          >
            {hero.subtitle}
          </motion.p>
        </div>

        {/* the count and the two ways in */}
        <div className="flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.7, ease: EASE }}
            className="mt-[1.618rem] w-full short:mt-0 wide-short:mt-4 compact:mt-5"
          >
            <SeasonLine dates={dates} names={dayNames} className="mb-4 short:mb-2 wide-short:mb-2 compact:mb-2" />
            <Countdown target={countdownTo} />
            <p className="mt-4 text-[0.7rem] uppercase tracking-[0.28em] text-ink-faint short:mt-2 short:tracking-[0.14em] wide-short:mt-2">
              {bodhonLabel}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.82, ease: EASE }}
            className="mt-[2.618rem] flex flex-wrap items-center justify-center gap-3 short:mt-4 wide-short:mt-5 compact:mt-6"
          >
            <Link href={hero.ctaPrimary.href} className="btn btn-primary">
              {hero.ctaPrimary.label}
            </Link>
            <Link href={hero.ctaSecondary.href} className="btn btn-ghost">
              {hero.ctaSecondary.label}
            </Link>
          </motion.div>
        </div>
      </motion.div>

      {/* 44px to press, though the mark is 22; not drawn on a landscape
          phone, where the page below is one flick away and the cue
          would sit on the buttons. */}
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
