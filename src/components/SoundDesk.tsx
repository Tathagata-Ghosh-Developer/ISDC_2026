"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Pause, Play, RotateCcw, Volume2 } from "lucide-react";
import type { AmbienceLayer } from "@/lib/content/music";

/* ================================================================
   A mixing desk, not a play button.

   Each layer is its own looping audio element with its own fader, so
   you build the room you want: dhak loud and rain underneath, or a
   conch alone, or the whole pandal at once. Volume is set on the
   element itself rather than through the Web Audio API, which means
   it works on a cross-origin file without any CORS negotiation.

   Nothing loads until you press something. Audio is the one thing a
   website must never start on its own.
   ================================================================ */

type Props = {
  layers: (AmbienceLayer & { src: string; local: boolean })[];
};

const PRESETS: { id: string; bangla: string; roman: string; mix: Record<string, number> }[] = [
  {
    id: "pandal",
    bangla: "মণ্ডপ",
    roman: "The pandal at arati",
    mix: { dhak: 0.85, kanshor_ghanta: 0.6, shankha: 0.5, ulu_dhwani: 0.45, adda: 0.3 },
  },
  {
    id: "bhor",
    bangla: "ভোর",
    roman: "Before dawn",
    mix: { mantra_path: 0.8, shankha_commons: 0.4, jhijhi_poka: 0.35, tanpura_drone: 0.5 },
  },
  {
    id: "gram",
    bangla: "গ্রাম",
    roman: "A village by the river",
    mix: { gangar_dhara: 0.7, jhijhi_poka: 0.5, brishti: 0.35, dhak_cc0: 0.4 },
  },
  {
    id: "brishti",
    bangla: "বৃষ্টি",
    roman: "Rain on the canvas",
    mix: { brishti: 0.8, mandir_ghanta: 0.35, adda: 0.25 },
  },
];

export default function SoundDesk({ layers }: Props) {
  const [levels, setLevels] = useState<Record<string, number>>({});
  const [playing, setPlaying] = useState(false);
  const [master, setMaster] = useState(0.8);
  const [failed, setFailed] = useState<Record<string, boolean>>({});
  const elements = useRef<Record<string, HTMLAudioElement>>({});

  /* ---- keep the elements in step with the state ---- */
  useEffect(() => {
    for (const layer of layers) {
      const level = levels[layer.id] ?? 0;
      const el = elements.current[layer.id];

      if (level <= 0 || !playing) {
        if (el) {
          el.pause();
        }
        continue;
      }

      if (!el) {
        const audio = new Audio(layer.src);
        audio.loop = true;
        audio.preload = "none";
        audio.crossOrigin = "anonymous";
        audio.addEventListener("error", () =>
          setFailed((f) => ({ ...f, [layer.id]: true })),
        );
        elements.current[layer.id] = audio;
      }

      const a = elements.current[layer.id];
      a.volume = Math.min(1, Math.max(0, level * master));
      if (a.paused) {
        void a.play().catch(() => setFailed((f) => ({ ...f, [layer.id]: true })));
      }
    }
  }, [layers, levels, playing, master]);

  /* ---- stop everything when the page goes away ---- */
  useEffect(() => {
    const els = elements.current;
    return () => {
      for (const a of Object.values(els)) {
        a.pause();
        a.src = "";
      }
    };
  }, []);

  const applyPreset = useCallback((mix: Record<string, number>) => {
    setLevels(mix);
    setPlaying(true);
  }, []);

  const anyOn = Object.values(levels).some((v) => v > 0);

  return (
    <div className="surface overflow-hidden">
      {/* ---- transport ---- */}
      <div className="flex flex-wrap items-center gap-4 border-b border-line px-5 py-4">
        <button
          onClick={() => setPlaying((p) => !p)}
          disabled={!anyOn}
          className="btn btn-primary !py-2 !text-[0.68rem] disabled:opacity-40"
        >
          {playing ? <Pause size={13} /> : <Play size={13} />}
          {playing ? "Pause" : "Play"}
        </button>

        <button
          onClick={() => {
            setLevels({});
            setPlaying(false);
          }}
          className="btn btn-ghost !py-2 !text-[0.68rem]"
        >
          <RotateCcw size={13} /> Clear
        </button>

        <label className="ml-auto flex min-w-[10rem] flex-1 items-center gap-3 sm:max-w-[16rem]">
          <Volume2 size={14} className="shrink-0 text-gold" />
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={master}
            onChange={(e) => setMaster(Number(e.target.value))}
            aria-label="Overall volume"
            className="w-full accent-[var(--c-sindoor)]"
          />
        </label>
      </div>

      {/* ---- presets ---- */}
      <div className="flex flex-wrap gap-2 border-b border-line px-5 py-4">
        {PRESETS.map((p) => (
          <button
            key={p.id}
            onClick={() => applyPreset(p.mix)}
            className="border border-line px-3 py-2 text-left transition-colors hover:border-gold"
          >
            <span className="bangla-display block text-[1rem] text-ink">
              {p.bangla}
            </span>
            <span className="block text-[0.62rem] uppercase tracking-[0.16em] text-ink-faint">
              {p.roman}
            </span>
          </button>
        ))}
      </div>

      {/* ---- faders ---- */}
      <ul className="grid gap-px bg-line sm:grid-cols-2">
        {layers.map((layer) => {
          const level = levels[layer.id] ?? 0;
          const on = level > 0;
          return (
            <li key={layer.id} className="bg-paper p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <span className="bangla-display block text-[1.15rem] text-ink">
                    {layer.bangla}
                  </span>
                  <span className="block text-[0.7rem] uppercase tracking-[0.16em] text-ink-faint">
                    {layer.roman}
                  </span>
                </div>
                <motion.span
                  animate={
                    on && playing
                      ? { opacity: [0.35, 1, 0.35] }
                      : { opacity: 0.2 }
                  }
                  transition={{ duration: 1.8, repeat: Infinity }}
                  className="mt-1 h-2 w-2 shrink-0 rotate-45 bg-sindoor"
                  aria-hidden
                />
              </div>

              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={level}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setLevels((l) => ({ ...l, [layer.id]: v }));
                  if (v > 0) setPlaying(true);
                }}
                aria-label={`${layer.roman} volume`}
                className="mt-4 w-full accent-[var(--c-sindoor)]"
              />

              <p className="mt-3 text-[0.78rem] leading-relaxed text-ink-soft">
                {layer.description}
              </p>

              {layer.caveat && (
                <p className="mt-2 text-[0.7rem] leading-relaxed text-gold">
                  {layer.caveat}
                </p>
              )}

              {failed[layer.id] && (
                <p className="mt-2 text-[0.7rem] text-sindoor">
                  This layer would not load. It streams from its original host,
                  which is sometimes unreachable.
                </p>
              )}

              <p className="mt-3 text-[0.62rem] leading-relaxed text-ink-faint">
                <a
                  href={layer.sourceUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="hover:text-gold"
                >
                  {layer.attribution}
                </a>
              </p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
