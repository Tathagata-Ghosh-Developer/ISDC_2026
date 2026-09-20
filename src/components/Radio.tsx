"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ExternalLink, Loader2, Pause, Play, Volume2 } from "lucide-react";

/* ================================================================
   The set in the corner of the room.

   Modelled on a Murphy India TAO-776 MK II of about 1960, which is the
   radio Bengal remembers: roughly 510 by 290 mm, so far wider than it
   is tall, a veneered plywood cabinet, a horizontal dial glass printed
   in black and gold with a stacked scale for each band, city names
   along the medium wave, a red pointer, an amber backlight, gold cloth
   behind a slatted wooden fret, and fluted bakelite knobs.

   Two corrections worth honouring, because the usual illustration gets
   both wrong. A mains valve set had no telescopic whip; that is a
   transistor portable. It had two terminals at the back marked A and E
   and a wire running to a bamboo pole on the roof, which is the thing
   somebody actually had to go and adjust. And Murphy is the remembered
   icon while Philips was the Calcutta workhorse, building radios in
   the city from 1948.

   So the wire is what you drag here, and it is tied to a pole.
   ================================================================ */

export type Station = {
  id: string;
  name: string;
  bangla: string;
  frequency: string;
  /** Where on the dial it sits, 0 to 1. */
  dial: number;
  /** Akashvani's own player. We link, we do not relay. */
  listenUrl: string;
  /** Only used if the committee obtains written permission. */
  streamUrl?: string;
  note: string;
};

type Props = {
  stations: Station[];
  broadcast: string;
  /** Off unless the committee has permission in writing from AIR. */
  allowInPageStream?: boolean;
};

const TARGET = -28;
const TOLERANCE = 18;

export default function Radio({
  stations,
  broadcast,
  allowInPageStream = false,
}: Props) {
  const reduce = useReducedMotion();
  const [angle, setAngle] = useState(-74);
  const [index, setIndex] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [error, setError] = useState<string | null>(null);

  const audio = useRef<HTMLAudioElement | null>(null);
  const svg = useRef<SVGSVGElement>(null);

  const station = stations[index] ?? stations[0];

  const signal = useMemo(() => {
    const off = Math.abs(angle - TARGET);
    return Math.max(0, Math.min(1, 1 - off / (TOLERANCE * 3)));
  }, [angle]);

  const locked = signal > 0.7;

  const onMove = useCallback((e: PointerEvent) => {
    const el = svg.current;
    if (!el) return;
    const box = el.getBoundingClientRect();
    const hingeX = box.left + box.width * 0.845;
    const hingeY = box.top + box.height * 0.6;
    const deg =
      (Math.atan2(e.clientY - hingeY, e.clientX - hingeX) * 180) / Math.PI;
    setAngle(Math.max(-104, Math.min(4, deg)));
  }, []);

  useEffect(() => {
    if (!dragging) return;
    const up = () => setDragging(false);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
  }, [dragging, onMove]);

  useEffect(() => {
    if (audio.current) audio.current.volume = volume;
  }, [volume]);

  useEffect(
    () => () => {
      audio.current?.pause();
      audio.current = null;
    },
    [],
  );

  async function toggle() {
    setError(null);
    if (playing) {
      audio.current?.pause();
      setPlaying(false);
      return;
    }
    if (!allowInPageStream || !station?.streamUrl) return;

    setLoading(true);
    audio.current ??= new Audio();
    const a = audio.current;
    if (a.src !== station.streamUrl) a.src = station.streamUrl;
    a.volume = volume;
    try {
      await a.play();
      setPlaying(true);
    } catch {
      setError(
        "This browser will not play a broadcast stream directly. Safari does, most others need a helper.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!locked && playing) {
      audio.current?.pause();
      setPlaying(false);
    }
  }, [locked, playing]);

  const pointerX = 74 + (station?.dial ?? 0.5) * 248;

  return (
    <div className="surface overflow-hidden">
      <div className="bg-[#140f0c] px-4 py-8 sm:px-8">
        <svg
          ref={svg}
          viewBox="0 0 440 260"
          className="mx-auto w-full max-w-[30rem] touch-none select-none"
          role="img"
          aria-label="A Murphy valve radio with a wire aerial running to a roof pole"
        >
          <defs>
            <linearGradient id="veneer" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8d5a2c" />
              <stop offset="42%" stopColor="#6d4320" />
              <stop offset="100%" stopColor="#452a13" />
            </linearGradient>
            <linearGradient id="glass" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f7e6b4" />
              <stop offset="100%" stopColor="#d9a63a" />
            </linearGradient>
            <pattern id="gold" width="4" height="4" patternUnits="userSpaceOnUse">
              <rect width="4" height="4" fill="#8a6a2c" />
              <rect width="4" height="1" fill="#6b4f1d" />
            </pattern>
          </defs>

          {/* ---- the roof pole and the wire ---- */}
          <g>
            <motion.g
              style={{ transformOrigin: "372px 156px" }}
              animate={{ rotate: angle + 74 }}
              transition={{ type: "spring", stiffness: 220, damping: 24 }}
            >
              {/* bamboo pole */}
              <line
                x1="372"
                y1="156"
                x2="372"
                y2="10"
                stroke="#9a7b4a"
                strokeWidth="4"
                strokeLinecap="round"
              />
              {[40, 72, 104].map((y) => (
                <line
                  key={y}
                  x1="368"
                  y1={y}
                  x2="376"
                  y2={y}
                  stroke="#6d4320"
                  strokeWidth="1.4"
                />
              ))}
              <circle
                cx="372"
                cy="10"
                r="12"
                fill={locked ? "#e8a020" : "#7d6a52"}
                stroke="#241608"
                strokeWidth="1.4"
                className="cursor-grab active:cursor-grabbing"
                onPointerDown={(e) => {
                  e.preventDefault();
                  setDragging(true);
                }}
              />
            </motion.g>

            {/* the aerial wire, sagging to the set's A terminal */}
            <path
              d={`M372,16 Q300,${86 + (1 - signal) * 26} 250,104`}
              fill="none"
              stroke="#b9a184"
              strokeWidth="1.4"
              opacity="0.85"
            />
            <text x="256" y="100" fontSize="7" fill="#b9a184">
              A
            </text>
          </g>

          {/* ---- cabinet, wider than tall ---- */}
          <rect
            x="26"
            y="104"
            width="352"
            height="140"
            rx="8"
            fill="url(#veneer)"
            stroke="#2d1b0c"
            strokeWidth="2"
          />
          <rect
            x="34"
            y="112"
            width="336"
            height="124"
            rx="5"
            fill="none"
            stroke="#a8763f"
            strokeWidth="1"
            opacity="0.55"
          />

          {/* ---- the dial glass, printed black and gold ---- */}
          <rect x="62" y="122" width="272" height="52" rx="3" fill="#1a1109" />
          <motion.rect
            x="64"
            y="124"
            width="268"
            height="48"
            rx="2"
            fill="url(#glass)"
            animate={
              reduce
                ? { opacity: 0.3 + signal * 0.6 }
                : { opacity: locked ? [0.88, 0.97, 0.88] : 0.24 + signal * 0.5 }
            }
            transition={{ duration: 2.6, repeat: locked ? Infinity : 0 }}
          />

          {/* stacked band scales, metre markings above, cities below */}
          {["13", "16", "19", "25", "31", "41", "49", "60", "75"].map((m, i) => (
            <text
              key={m}
              x={74 + i * 31}
              y="136"
              fontSize="6"
              fill="#2d1b0c"
              textAnchor="middle"
            >
              {m}
            </text>
          ))}
          <line x1="66" y1="140" x2="330" y2="140" stroke="#2d1b0c" strokeWidth="0.6" />

          {stations.map((s) => (
            <text
              key={s.id}
              x={74 + s.dial * 248}
              y="152"
              fontSize="6.4"
              fill="#2d1b0c"
              textAnchor="middle"
              style={{ letterSpacing: "0.05em" }}
            >
              {s.name.toUpperCase()}
            </text>
          ))}

          {Array.from({ length: 27 }).map((_, i) => (
            <line
              key={i}
              x1={68 + i * 10}
              y1="168"
              x2={68 + i * 10}
              y2={i % 5 === 0 ? 158 : 163}
              stroke="#2d1b0c"
              strokeWidth="0.7"
            />
          ))}

          {/* the red travelling pointer */}
          <motion.line
            animate={{ x: pointerX - 200 }}
            transition={{ type: "spring", stiffness: 170, damping: 22 }}
            x1="200"
            y1="124"
            x2="200"
            y2="172"
            stroke="#c0271a"
            strokeWidth="2"
          />

          {/* the magic eye, an EM84 */}
          <g>
            <circle cx="348" cy="148" r="11" fill="#1a1109" />
            <motion.ellipse
              cx="348"
              cy="148"
              rx={2 + signal * 7}
              ry="7.5"
              fill="#5fbf7a"
              animate={{ opacity: 0.35 + signal * 0.6 }}
            />
          </g>

          {/* ---- the fret and gold cloth ---- */}
          <rect x="62" y="182" width="168" height="50" rx="3" fill="url(#gold)" />
          {Array.from({ length: 11 }).map((_, i) => (
            <rect
              key={i}
              x={66 + i * 15}
              y="182"
              width="5"
              height="50"
              fill="#6d4320"
            />
          ))}
          <rect
            x="62"
            y="182"
            width="168"
            height="50"
            rx="3"
            fill="none"
            stroke="#2d1b0c"
            strokeWidth="1.4"
          />

          {/* ---- fluted bakelite knobs ---- */}
          {[
            { cx: 262, cy: 206, label: "VOL" },
            { cx: 330, cy: 206, label: "TUNE" },
          ].map((k) => (
            <g key={k.label}>
              <circle cx={k.cx} cy={k.cy} r="19" fill="#1a1109" />
              <circle cx={k.cx} cy={k.cy} r="15.5" fill="#2e1e12" />
              {Array.from({ length: 16 }).map((_, i) => {
                const a = (i * Math.PI) / 8;
                return (
                  <line
                    key={i}
                    x1={k.cx + 12 * Math.cos(a)}
                    y1={k.cy + 12 * Math.sin(a)}
                    x2={k.cx + 15.5 * Math.cos(a)}
                    y2={k.cy + 15.5 * Math.sin(a)}
                    stroke="#54381f"
                    strokeWidth="1.2"
                  />
                );
              })}
              <motion.line
                x1={k.cx}
                y1={k.cy}
                x2={k.cx}
                y2={k.cy - 11}
                stroke="#d8c39c"
                strokeWidth="2"
                strokeLinecap="round"
                style={{ transformOrigin: `${k.cx}px ${k.cy}px` }}
                animate={{
                  rotate:
                    k.label === "TUNE"
                      ? (station?.dial ?? 0.5) * 250 - 125
                      : volume * 250 - 125,
                }}
                transition={{ type: "spring", stiffness: 190, damping: 22 }}
              />
              <text
                x={k.cx}
                y={k.cy + 30}
                textAnchor="middle"
                fontSize="5.6"
                fill="#c8ab82"
                style={{ letterSpacing: "0.2em" }}
              >
                {k.label}
              </text>
            </g>
          ))}

          {/* the badge */}
          <text
            x="146"
            y="244"
            textAnchor="middle"
            fontSize="9"
            fill="#c8ab82"
            style={{ letterSpacing: "0.32em" }}
          >
            MURPHY
          </text>
        </svg>

        <p className="mt-6 text-center text-[0.75rem] leading-relaxed text-[#e6d3ad]/65">
          {locked
            ? "Signal found. The magic eye has closed."
            : "Drag the top of the aerial pole until the green eye narrows. Somebody always had to go up and do this."}
        </p>
      </div>

      {/* ---- controls ---- */}
      <div className="border-t border-line p-5">
        <div className="flex flex-wrap items-center gap-3">
          {allowInPageStream && station?.streamUrl ? (
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
          ) : (
            <a
              href={station?.listenUrl}
              target="_blank"
              rel="noreferrer noopener"
              aria-disabled={!locked}
              className={`btn btn-primary !py-2 !text-[0.68rem] ${locked ? "" : "pointer-events-none opacity-40"}`}
            >
              <ExternalLink size={13} /> Open Akashvani
            </a>
          )}

          <div className="flex flex-wrap gap-1">
            {stations.map((s, i) => (
              <button
                key={s.id}
                onClick={() => {
                  setIndex(i);
                  setPlaying(false);
                  audio.current?.pause();
                }}
                className={`border px-2.5 py-1.5 text-[0.62rem] uppercase tracking-[0.12em] transition-colors ${
                  i === index
                    ? "border-sindoor text-sindoor"
                    : "border-line text-ink-faint hover:border-gold hover:text-gold"
                }`}
              >
                {s.name}
              </button>
            ))}
          </div>

          {allowInPageStream && (
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
          )}
        </div>

        <p className="mt-4 text-[0.85rem] leading-relaxed text-ink-soft">
          <span className="bangla-display text-[1.1rem] text-ink">
            {station?.bangla}
          </span>{" "}
          <span className="text-gold">{station?.frequency}</span>{" "}
          {station?.note}
        </p>

        <p className="mt-2 text-[0.75rem] leading-relaxed text-ink-faint">
          {broadcast}
        </p>

        {!allowInPageStream && (
          <p className="mt-3 text-[0.72rem] leading-relaxed text-ink-faint">
            The button opens Akashvani&apos;s own player rather than piping the
            broadcast through this page. The stream is theirs, their terms
            restrict redistribution, and a student committee should not relay a
            national broadcaster without asking. Written permission from the
            News Services Division would change that, and the player here is
            built and waiting for it.
          </p>
        )}

        {error && (
          <p className="mt-3 border border-sindoor/40 p-3 text-[0.78rem] text-sindoor">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
