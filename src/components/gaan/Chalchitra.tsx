"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import type { Mix } from "@/lib/content/desk";

/* ================================================================
   চালচিত্র, the painted arch behind the idol.

   This used to be drawn: flat fields, hard edges, a print rather than
   a photograph. It was a decent piece of illustration and it was the
   wrong thing on this page, because everything else here is real. The
   recordings are real, the songs are the artists' own uploads, and the
   ground in these photographs is the ground the committee will stand
   on this October.

   So the backdrop is now the photographs, and the faders choose which
   one you are looking at. Push the dhak up and the crowd arrives. Push
   the arati up and it is the evening lamp. Push the river up and she
   is already on the road out of the campus. The slider from city to
   village moves the whole set with it.

   Nothing here is decorative in the sense of being arbitrary. Every
   frame is last year, on this ground, and the caption says which
   moment it was.
   ================================================================ */

type Shot = { id: string; at: number };

type Scene = {
  id: string;
  src: string;
  alt: string;
  bangla: string;
  caption: string;
  /** Faders that pull this frame forward, and how hard. */
  pull: Partial<Record<string, number>>;
  /** Where it sits on the city to village line, 0 city, 100 village. */
  place: number;
  /** Treated as an old plate rather than a photograph. */
  plate?: boolean;
};

/**
 * Ordered roughly as an evening runs, which is also the order the
 * faders sit in on the desk.
 */
const SCENES: Scene[] = [
  {
    id: "pandal-wide",
    src: "/media/puja2025/08.jpg",
    alt: "The pandal from the floor, the full pratima under her arch",
    bangla: "মণ্ডপ",
    caption: "The whole of her, from the floor of the pandal",
    pull: { adda: 1, mandir_ghanta: 0.5 },
    place: 20,
  },
  {
    id: "pratima",
    src: "/media/puja2025/16.jpg",
    alt: "The pratima with the white sholapith arch behind her",
    bangla: "প্রতিমা",
    caption: "Sholar saj, cut from pith and set against the blue",
    pull: { mantra_path: 1, shankha: 0.8 },
    place: 35,
  },
  {
    id: "mukh",
    src: "/media/puja2025/38.jpg",
    alt: "The goddess's face, close, under the pith crown",
    bangla: "মুখ",
    caption: "The eyes, painted last, at dawn, by the oldest hand in the workshop",
    pull: { drone: 1, mantra_path: 0.6 },
    place: 45,
  },
  {
    id: "arati",
    src: "/media/puja2025/12.jpg",
    alt: "Evening arati in front of the idol, the lamp lit",
    bangla: "সন্ধ্যারতি",
    caption: "Sandhya arati, the hour the pandal starts to fill",
    pull: { sandhya_arati: 1.6, kanshor_ghanta: 0.7, mandir_ghanta: 0.5 },
    place: 30,
  },
  {
    id: "homa",
    src: "/media/puja2025/10.jpg",
    alt: "The fire lit for the homa in front of the idol",
    bangla: "হোম",
    caption: "The homa fire, which is the one part nobody photographs well",
    pull: { mantra_path: 1.4, drone: 0.5 },
    place: 55,
  },
  {
    id: "dhunuchi",
    src: "/media/video/dhunuchi-smoke.jpg",
    alt: "Dhunuchi smoke rising through a crowd",
    bangla: "ধুনুচি",
    caption: "Coconut husk and camphor, carried into the middle of the crowd",
    pull: { dhak: 1.3, kanshor_ghanta: 1 },
    place: 25,
  },
  {
    id: "bhir",
    src: "/media/video/pandal-evening.jpg",
    alt: "The ground full, an evening under the lights",
    bangla: "ভিড়",
    caption: "Navami night, when nobody is watching anything in particular",
    pull: { adda: 1.6, dhak: 0.8 },
    place: 10,
  },
  {
    id: "sindoor",
    src: "/media/video/sindoor-khela.jpg",
    alt: "Sindoor khela on Dashami morning",
    bangla: "সিঁদুর খেলা",
    caption: "Dashami morning, vermilion, and then she goes",
    pull: { shankha: 1.5, kanshor_ghanta: 0.6 },
    place: 40,
  },
  {
    id: "path",
    src: "/media/video/bisarjan-road.jpg",
    alt: "The procession out on the road with the dhak",
    bangla: "পথে",
    caption: "Out of the gate, where the campus stops and Bengaluru starts",
    pull: { dhak: 1, gangar_dhara: 0.9 },
    place: 70,
  },
  {
    id: "gachh",
    src: "/media/puja2025/37.jpg",
    alt: "The idol carried out under the trees of the campus",
    bangla: "গাছের নিচে",
    caption: "Under the rain trees, on the way to the water",
    pull: { jhijhi_poka: 1.2, brishti: 0.8, gangar_dhara: 0.8 },
    place: 85,
  },
  {
    id: "nodi",
    src: "/media/art/company-school-durbar.jpg",
    alt: "A nineteenth-century painting of a Durga Puja by the river",
    bangla: "নদীর ধারে",
    caption: "A Company school painting, when the Puja was a courtyard and a river",
    pull: { gangar_dhara: 1.6, jhijhi_poka: 0.6 },
    place: 100,
    plate: true,
  },
  {
    id: "raat",
    src: "/media/art/old-kolkata-puja-night.jpg",
    alt: "A nineteenth-century Puja at night in Calcutta",
    bangla: "কলকাতার রাত",
    caption: "Calcutta at night, a hundred and fifty years ago, and much the same noise",
    pull: { drone: 1, adda: 0.5 },
    place: 60,
    plate: true,
  },
];

/** Layers whose level should wash the whole frame rather than pick one. */
const WASH = {
  brishti: "rain",
  jhijhi_poka: "dusk",
  drone: "vignette",
} as const;

export default function Chalchitra({
  mix,
  city,
  playing,
  shots,
}: {
  mix: Mix;
  /** 0 is the city, 100 the village. */
  city: number;
  playing: boolean;
  shots: Shot[];
}) {
  const host = useRef<HTMLDivElement>(null);
  const [flash, setFlash] = useState(0);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  /* ---- a conch or a bell lands, and the frame takes the light ---- */
  const lastShot = shots.length ? shots[shots.length - 1].at : 0;
  useEffect(() => {
    if (!lastShot) return;
    setFlash((n) => n + 1);
  }, [lastShot]);

  /* ---- which photograph is on ---- */
  const scene = useMemo(() => {
    let best = SCENES[0];
    let bestScore = -Infinity;
    for (const s of SCENES) {
      let score = 0;
      for (const [layer, weight] of Object.entries(s.pull)) {
        score += ((mix[layer] ?? 0) / 100) * (weight ?? 1);
      }
      // The city to village slider tips the whole set. A frame at the
      // far end of the line gains most when the slider is there too.
      score += 0.55 * (1 - Math.abs(s.place - city) / 100);
      if (score > bestScore) {
        bestScore = score;
        best = s;
      }
    }
    return best;
  }, [mix, city]);

  /* ---- the washes, as plain numbers ---- */
  const rain = (mix.brishti ?? 0) / 100;
  const dusk = (mix.jhijhi_poka ?? 0) / 100;
  const vignette = (mix.drone ?? 0) / 100;
  const loud =
    (((mix.dhak ?? 0) + (mix.kanshor_ghanta ?? 0) + (mix.adda ?? 0)) / 300) *
    (playing ? 1 : 0.35);

  return (
    <div
      ref={host}
      className="relative aspect-[16/9] w-full select-none overflow-hidden border border-line bg-ink"
    >
      {/* ---------- the photograph ---------- */}
      <AnimatePresence mode="sync">
        <motion.div
          key={scene.id}
          initial={{ opacity: 0, scale: 1.06 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0"
        >
          <motion.div
            className="absolute inset-[-3%]"
            animate={
              reduced
                ? {}
                : {
                    scale: playing ? [1, 1.045, 1] : 1,
                    x: [0, -6, 0],
                  }
            }
            transition={{
              duration: 26,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <Image
              src={scene.src}
              alt={scene.alt}
              fill
              sizes="(max-width: 768px) 100vw, 900px"
              priority={false}
              className={`object-cover ${scene.plate ? "sepia-plate" : ""}`}
              style={{
                filter: `saturate(${1 - rain * 0.45}) contrast(${1 + loud * 0.18}) brightness(${
                  0.86 + (playing ? 0.14 : 0) - dusk * 0.18
                })`,
              }}
            />
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* ---------- dusk, when the crickets come up ---------- */}
      <div
        className="pointer-events-none absolute inset-0 mix-blend-multiply transition-opacity duration-1000"
        style={{
          opacity: dusk * 0.75,
          background:
            "linear-gradient(to top, #1b2f4b 0%, #24406080 45%, transparent 100%)",
        }}
      />

      {/* ---------- rain ---------- */}
      {rain > 0.02 && !reduced && (
        <div
          className="pointer-events-none absolute inset-0 chalchitra-rain"
          style={{ opacity: Math.min(0.55, rain * 0.8) }}
        />
      )}

      {/* ---------- the conch, as light ---------- */}
      <AnimatePresence>
        <motion.div
          key={flash}
          initial={{ opacity: 0.42 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          className="pointer-events-none absolute inset-0 bg-[#f5e2b0] mix-blend-screen"
        />
      </AnimatePresence>

      {/* ---------- vignette, tied to the drone ---------- */}
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-1000"
        style={{
          opacity: 0.35 + vignette * 0.5,
          background:
            "radial-gradient(ellipse at 50% 42%, transparent 35%, rgba(12,9,6,0.85) 100%)",
        }}
      />

      {/* ---------- the grain, always ---------- */}
      <div className="pointer-events-none absolute inset-0 chalchitra-grain opacity-[0.16] mix-blend-overlay" />

      {/* ---------- the level, drawn as the arch ---------- */}
      <svg
        viewBox="0 0 100 56"
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[22%] w-full"
        aria-hidden="true"
      >
        <path
          d={`M0 56 L0 ${44 - loud * 14} Q 50 ${20 - loud * 16} 100 ${44 - loud * 14} L100 56 Z`}
          fill="rgba(200,32,42,0.16)"
        />
      </svg>

      {/* ---------- the caption ---------- */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/90 via-ink/50 to-transparent px-5 pb-4 pt-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={scene.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.5 }}
          >
            <span className="bangla-display block text-[1.15rem] leading-tight text-paper-3">
              {scene.bangla}
            </span>
            <span className="mt-0.5 block text-[0.72rem] leading-relaxed text-paper-3/75">
              {scene.caption}
            </span>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ---------- what the faders are doing to the picture ---------- */}
      <div className="absolute right-4 top-4 flex flex-col items-end gap-1.5">
        <span className="text-[0.52rem] uppercase tracking-[0.22em] text-paper-3/55">
          {playing ? "the room is on" : "silent"}
        </span>
        <div className="flex gap-1">
          {Object.keys(WASH).map((id) => (
            <span
              key={id}
              className="h-1 w-6 bg-paper-3/25"
              aria-hidden="true"
            >
              <span
                className="block h-full bg-gold transition-all duration-500"
                style={{ width: `${mix[id] ?? 0}%` }}
              />
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
