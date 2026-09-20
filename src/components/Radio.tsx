"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Loader2, Pause, Play, Volume2 } from "lucide-react";

/* ================================================================
   The radio in the corner of the room.

   Every Bengali household of a certain vintage had one: a wooden
   cabinet with a cloth grille, a lit dial with station names printed
   across it, two bakelite knobs and an aerial that somebody always had
   to get up and adjust. Mahalaya came out of this object at four in
   the morning and the whole family sat around it in the dark.

   So the aerial here actually does something. Drag it until the signal
   meter fills, and the set tunes in. It is a toy, but it is the right
   toy: nobody under thirty has ever had to aim an aerial, and this is
   the one page where they should find out what that felt like.
   ================================================================ */

export type Station = {
  id: string;
  name: string;
  bangla: string;
  /** Where on the dial it sits, 0 to 1 from left to right. */
  dial: number;
  /** A stream the browser can play, or empty if we only have a time. */
  url: string;
  note: string;
};

type Props = {
  stations: Station[];
  /** When the broadcast actually happens, shown when nothing is playing. */
  broadcast: string;
};

/** The aerial must point near enough to this to lock on. */
const TARGET_ANGLE = -24;
const TOLERANCE = 16;

export default function Radio({ stations, broadcast }: Props) {
  const reduce = useReducedMotion();
  const [angle, setAngle] = useState(-72);
  const [stationIndex, setStationIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  const audio = useRef<HTMLAudioElement | null>(null);
  const svg = useRef<SVGSVGElement>(null);

  const station = stations[stationIndex] ?? stations[0];

  /** 0 when the aerial points nowhere, 1 when it is bang on. */
  const signal = useMemo(() => {
    const off = Math.abs(angle - TARGET_ANGLE);
    return Math.max(0, Math.min(1, 1 - off / (TOLERANCE * 3.4)));
  }, [angle]);

  const locked = signal > 0.72;

  /* ---- dragging the aerial ---- */
  const onPointerMove = useCallback((e: PointerEvent) => {
    const el = svg.current;
    if (!el) return;
    const box = el.getBoundingClientRect();
    // the aerial is hinged at roughly this point in the viewBox
    const hingeX = box.left + box.width * 0.735;
    const hingeY = box.top + box.height * 0.2;
    const deg =
      (Math.atan2(e.clientY - hingeY, e.clientX - hingeX) * 180) / Math.PI;
    setAngle(Math.max(-96, Math.min(6, deg)));
  }, []);

  useEffect(() => {
    if (!dragging) return;
    const up = () => setDragging(false);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
  }, [dragging, onPointerMove]);

  /* ---- the sound ---- */
  useEffect(() => {
    if (audio.current) audio.current.volume = volume;
  }, [volume]);

  useEffect(() => {
    return () => {
      audio.current?.pause();
      audio.current = null;
    };
  }, []);

  async function toggle() {
    setError(null);

    if (playing) {
      audio.current?.pause();
      setPlaying(false);
      return;
    }

    if (!station?.url) {
      setError(
        "We have no stream we are allowed to relay for this station. Tune a real radio to it, or use the recording below.",
      );
      return;
    }

    setLoading(true);
    if (!audio.current) {
      audio.current = new Audio();
      audio.current.preload = "none";
    }
    const a = audio.current;
    if (a.src !== station.url) a.src = station.url;
    a.volume = volume;

    try {
      await a.play();
      setPlaying(true);
    } catch {
      setError(
        "The station would not open. Live streams move and go down, often at the worst moment.",
      );
    } finally {
      setLoading(false);
    }
  }

  /* stop the sound if the aerial loses the signal, as a real one would */
  useEffect(() => {
    if (!locked && playing) {
      audio.current?.pause();
      setPlaying(false);
    }
  }, [locked, playing]);

  const dialX = 96 + (station?.dial ?? 0.5) * 208;

  return (
    <div className="surface overflow-hidden">
      <div className="relative bg-[#171014] px-4 py-8 sm:px-8">
        <svg
          ref={svg}
          viewBox="0 0 400 300"
          className="mx-auto w-full max-w-[26rem] touch-none select-none"
          role="img"
          aria-label="A vintage valve radio with an adjustable aerial"
        >
          <defs>
            <linearGradient id="cabinet" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8a5a30" />
              <stop offset="45%" stopColor="#6b4423" />
              <stop offset="100%" stopColor="#4a2e17" />
            </linearGradient>
            <linearGradient id="dialGlow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f6e3a8" />
              <stop offset="100%" stopColor="#d9a13a" />
            </linearGradient>
            <pattern id="grille" width="5" height="5" patternUnits="userSpaceOnUse">
              <rect width="5" height="5" fill="#3a2414" />
              <circle cx="2.5" cy="2.5" r="1.5" fill="#241608" />
            </pattern>
          </defs>

          {/* ---- the aerial ---- */}
          <g>
            <motion.g
              style={{ transformOrigin: "294px 60px" }}
              animate={{ rotate: angle }}
              transition={{ type: "spring", stiffness: 260, damping: 26 }}
            >
              <line
                x1="294"
                y1="60"
                x2="294"
                y2="-52"
                stroke="#cbb08a"
                strokeWidth="3.4"
                strokeLinecap="round"
              />
              <line
                x1="294"
                y1="18"
                x2="294"
                y2="-52"
                stroke="#e6d3ad"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
              {/* the grab handle */}
              <circle
                cx="294"
                cy="-52"
                r="13"
                fill={locked ? "#efb44a" : "#8a7360"}
                stroke="#241608"
                strokeWidth="1.5"
                className="cursor-grab active:cursor-grabbing"
                onPointerDown={(e) => {
                  e.preventDefault();
                  setDragging(true);
                }}
              />
              <circle cx="294" cy="-52" r="5" fill="#241608" />
            </motion.g>
            <circle cx="294" cy="60" r="5" fill="#3a2414" stroke="#cbb08a" strokeWidth="1.4" />
          </g>

          {/* ---- cabinet ---- */}
          <path
            d="M40,110 Q40,58 118,52 L282,52 Q360,58 360,110 L360,262 Q360,272 350,272 L50,272 Q40,272 40,262 Z"
            fill="url(#cabinet)"
            stroke="#2d1b0c"
            strokeWidth="2"
          />
          <path
            d="M52,112 Q52,70 120,64 L280,64 Q348,70 348,112 L348,254 Q348,260 342,260 L58,260 Q52,260 52,254 Z"
            fill="none"
            stroke="#a8763f"
            strokeWidth="1.2"
            opacity="0.6"
          />

          {/* ---- the dial ---- */}
          <rect x="88" y="86" width="224" height="62" rx="5" fill="#241608" />
          <motion.rect
            x="90"
            y="88"
            width="220"
            height="58"
            rx="4"
            fill="url(#dialGlow)"
            animate={
              reduce
                ? { opacity: 0.35 + signal * 0.6 }
                : {
                    opacity: locked
                      ? [0.86, 0.96, 0.86]
                      : 0.28 + signal * 0.5,
                  }
            }
            transition={{ duration: 2.4, repeat: locked ? Infinity : 0 }}
          />

          {/* station names across the glass */}
          {stations.map((s) => (
            <text
              key={s.id}
              x={96 + s.dial * 208}
              y="104"
              textAnchor="middle"
              fontSize="7.5"
              fill="#3a2414"
              className="font-body"
              style={{ letterSpacing: "0.06em" }}
            >
              {s.name.toUpperCase()}
            </text>
          ))}

          {/* frequency ticks */}
          {Array.from({ length: 21 }).map((_, i) => (
            <line
              key={i}
              x1={96 + i * 10.4}
              y1="132"
              x2={96 + i * 10.4}
              y2={i % 5 === 0 ? 122 : 127}
              stroke="#3a2414"
              strokeWidth="0.8"
            />
          ))}

          {/* the needle */}
          <motion.line
            animate={{ x: dialX - 200 }}
            transition={{ type: "spring", stiffness: 180, damping: 22 }}
            x1="200"
            y1="88"
            x2="200"
            y2="146"
            stroke="#b3261e"
            strokeWidth="2.2"
          />

          {/* ---- the signal meter ---- */}
          <rect x="88" y="156" width="224" height="9" rx="4.5" fill="#241608" />
          <motion.rect
            x="90"
            y="158"
            height="5"
            rx="2.5"
            fill={locked ? "#7fae6a" : "#c9871f"}
            animate={{ width: 220 * signal }}
            transition={{ type: "spring", stiffness: 220, damping: 26 }}
          />

          {/* ---- speaker grille ---- */}
          <rect x="88" y="176" width="146" height="72" rx="5" fill="url(#grille)" />
          <rect
            x="88"
            y="176"
            width="146"
            height="72"
            rx="5"
            fill="none"
            stroke="#2d1b0c"
            strokeWidth="1.5"
          />

          {/* ---- knobs ---- */}
          {[
            { cx: 276, cy: 198, label: "TUNE" },
            { cx: 276, cy: 236, label: "VOL" },
          ].map((k) => (
            <g key={k.label}>
              <circle cx={k.cx} cy={k.cy} r="17" fill="#241608" />
              <circle cx={k.cx} cy={k.cy} r="13" fill="#3a2414" stroke="#a8763f" strokeWidth="1.2" />
              <motion.line
                x1={k.cx}
                y1={k.cy}
                x2={k.cx}
                y2={k.cy - 10}
                stroke="#e6d3ad"
                strokeWidth="2"
                strokeLinecap="round"
                style={{ transformOrigin: `${k.cx}px ${k.cy}px` }}
                animate={{
                  rotate:
                    k.label === "TUNE" ? (station?.dial ?? 0.5) * 260 - 130 : volume * 260 - 130,
                }}
                transition={{ type: "spring", stiffness: 200, damping: 24 }}
              />
              <text
                x={k.cx}
                y={k.cy + 27}
                textAnchor="middle"
                fontSize="6"
                fill="#cbb08a"
                style={{ letterSpacing: "0.18em" }}
              >
                {k.label}
              </text>
            </g>
          ))}

          {/* the little brass plate every one of these had */}
          <rect x="96" y="256" width="52" height="9" rx="2" fill="#a8763f" opacity="0.7" />
        </svg>

        {/* ---- the hint ---- */}
        <p className="mt-6 text-center text-[0.75rem] leading-relaxed text-[#f0dcc0]/60">
          {locked
            ? "Signal locked. Press play."
            : "Drag the tip of the aerial until the meter fills. Somebody always had to."}
        </p>
      </div>

      {/* ---- controls ---- */}
      <div className="border-t border-line p-5">
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={toggle}
            disabled={!locked || loading}
            className="btn btn-primary !py-2 !text-[0.68rem] disabled:opacity-40"
          >
            {loading ? (
              <Loader2 size={13} className="animate-spin" />
            ) : playing ? (
              <Pause size={13} />
            ) : (
              <Play size={13} />
            )}
            {playing ? "Stop" : "Tune in"}
          </button>

          <div className="flex flex-wrap gap-1">
            {stations.map((s, i) => (
              <button
                key={s.id}
                onClick={() => {
                  setStationIndex(i);
                  setPlaying(false);
                  audio.current?.pause();
                }}
                className={`border px-2.5 py-1.5 text-[0.65rem] uppercase tracking-[0.14em] transition-colors ${
                  i === stationIndex
                    ? "border-sindoor text-sindoor"
                    : "border-line text-ink-faint hover:border-gold hover:text-gold"
                }`}
              >
                {s.name}
              </button>
            ))}
          </div>

          <label className="ml-auto flex min-w-[8rem] items-center gap-2.5">
            <Volume2 size={14} className="shrink-0 text-gold" />
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              aria-label="Radio volume"
              className="w-full accent-[var(--c-sindoor)]"
            />
          </label>
        </div>

        <p className="mt-4 text-[0.82rem] leading-relaxed text-ink-soft">
          <span className="bangla-display text-[1.05rem] text-ink">
            {station?.bangla}
          </span>{" "}
          {station?.note}
        </p>

        <p className="mt-2 text-[0.75rem] leading-relaxed text-ink-faint">
          {broadcast}
        </p>

        {error && (
          <p className="mt-3 border border-sindoor/40 p-3 text-[0.78rem] text-sindoor">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
