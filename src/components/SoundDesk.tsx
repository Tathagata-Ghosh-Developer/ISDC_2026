"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Pause, Play, RotateCcw, Share2, Volume2 } from "lucide-react";
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

const STORE_KEY = "isdc-mix";

/** A mix packs into a URL as id:level pairs, so it can be shared. */
function encodeMix(levels: Record<string, number>): string {
  return Object.entries(levels)
    .filter(([, v]) => v > 0.01)
    .map(([k, v]) => `${k}:${Math.round(v * 100)}`)
    .join(",");
}

function decodeMix(raw: string): Record<string, number> {
  const out: Record<string, number> = {};
  for (const part of raw.split(",")) {
    const [id, value] = part.split(":");
    const n = Number(value);
    if (id && Number.isFinite(n)) out[id] = Math.min(1, Math.max(0, n / 100));
  }
  return out;
}

export default function SoundDesk({ layers }: Props) {
  const [levels, setLevels] = useState<Record<string, number>>({});
  const [playing, setPlaying] = useState(false);
  const [master, setMaster] = useState(0.8);
  const [failed, setFailed] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState(false);
  const elements = useRef<Record<string, HTMLAudioElement>>({});
  const fades = useRef<Record<string, number>>({});

  /* ---- a shared link wins, otherwise the last mix on this device ---- */
  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get("mix");
    if (fromUrl) {
      setLevels(decodeMix(fromUrl));
      return;
    }
    try {
      const saved = localStorage.getItem(STORE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as {
          levels?: Record<string, number>;
          master?: number;
        };
        if (parsed.levels) setLevels(parsed.levels);
        if (typeof parsed.master === "number") setMaster(parsed.master);
      }
    } catch {
      /* private browsing, or a stale shape */
    }
  }, []);

  /* ---- remember it, so a return visit sounds the same ---- */
  useEffect(() => {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify({ levels, master }));
    } catch {
      /* not important enough to complain about */
    }
  }, [levels, master]);

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
      const target = Math.min(1, Math.max(0, level * master));

      // Ease to the new level rather than jumping. A hard cut on a
      // looping field recording is audible and cheap sounding.
      window.clearInterval(fades.current[layer.id]);
      fades.current[layer.id] = window.setInterval(() => {
        const step = 0.06;
        if (Math.abs(a.volume - target) <= step) {
          a.volume = target;
          window.clearInterval(fades.current[layer.id]);
          return;
        }
        a.volume += a.volume < target ? step : -step;
      }, 40);

      if (a.paused) {
        a.volume = 0;
        void a.play().catch(() => setFailed((f) => ({ ...f, [layer.id]: true })));
      }
    }
  }, [layers, levels, playing, master]);

  /* ---- stop everything when the page goes away ---- */
  useEffect(() => {
    const els = elements.current;
    const timers = fades.current;
    return () => {
      for (const t of Object.values(timers)) window.clearInterval(t);
      for (const a of Object.values(els)) {
        a.pause();
        a.src = "";
      }
    };
  }, []);

  /* ---- space to play, arrows for the master ---- */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (e.code === "Space") {
        e.preventDefault();
        setPlaying((p) => !p);
      }
      if (e.code === "ArrowUp") setMaster((m) => Math.min(1, m + 0.05));
      if (e.code === "ArrowDown") setMaster((m) => Math.max(0, m - 0.05));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  async function share() {
    const url = `${window.location.origin}${window.location.pathname}?mix=${encodeMix(levels)}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copy this link", url);
    }
  }

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

        <button
          onClick={share}
          disabled={!anyOn}
          className="btn btn-ghost !py-2 !text-[0.68rem] disabled:opacity-40"
        >
          <Share2 size={13} /> {copied ? "Link copied" : "Share this mix"}
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
