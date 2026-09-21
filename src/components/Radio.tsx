"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ExternalLink, Power } from "lucide-react";

/* ================================================================
   The set in the corner of the room, and it actually tunes.

   Modelled on a Murphy India TAO-776 MK II of about 1960: far wider
   than tall, veneered plywood, a horizontal dial glass printed black
   and gold with a stacked scale per band, city names along the medium
   wave, a red travelling pointer, an EM84 magic eye, gold cloth behind
   a slatted fret, and fluted bakelite knobs. A mains valve set had no
   telescopic whip, so the thing you drag here is the wire running to
   a bamboo pole on the roof, which is what somebody actually had to go
   and adjust.

   Two controls, both real. The TUNE knob walks the pointer across the
   dial; the aerial sets how strong the signal is when you get there.
   Between them they give a proximity, and the proximity crossfades
   hiss into programme. The hiss is generated here with Web Audio, so
   it is ours; the programme is the rights holder's own upload, whose
   volume we drive. Turn the knob away and it dissolves back into
   noise, which is what a radio does.
   ================================================================ */

export type Station = {
  id: string;
  name: string;
  bangla: string;
  frequency: string;
  dial: number;
  listenUrl: string;
  /** Set only on the station whose programme we may legitimately play. */
  youtubeId?: string;
  startSeconds?: number;
  note: string;
};

type YTPlayer = {
  playVideo: () => void;
  pauseVideo: () => void;
  setVolume: (v: number) => void;
  destroy: () => void;
};

declare global {
  interface Window {
    YT?: {
      Player: new (el: HTMLElement | string, opts: unknown) => YTPlayer;
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

const BAND = 0.075;

function loadYouTubeApi(): Promise<void> {
  return new Promise((resolve) => {
    if (window.YT?.Player) return resolve();
    const existing = document.getElementById("yt-iframe-api");
    if (!existing) {
      const s = document.createElement("script");
      s.id = "yt-iframe-api";
      s.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(s);
    }
    const prior = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      prior?.();
      resolve();
    };
    // If the API was already loaded by something else, poll briefly.
    const started = Date.now();
    const poll = setInterval(() => {
      if (window.YT?.Player || Date.now() - started > 8000) {
        clearInterval(poll);
        resolve();
      }
    }, 120);
  });
}

export default function Radio({
  stations,
  broadcast,
}: {
  stations: Station[];
  broadcast: string;
}) {
  const reduce = useReducedMotion();
  const [tune, setTune] = useState(0.52);
  const [aerial, setAerial] = useState(-76);
  const [dragging, setDragging] = useState(false);
  const [on, setOn] = useState(false);
  const [ready, setReady] = useState(false);

  const svg = useRef<SVGSVGElement>(null);
  const ctx = useRef<AudioContext | null>(null);
  const hiss = useRef<GainNode | null>(null);
  const player = useRef<YTPlayer | null>(null);
  const mount = useRef<HTMLDivElement>(null);

  /* ---- how well the aerial is pointed, 0 to 1 ---- */
  const aerialQuality = useMemo(() => {
    const off = Math.abs(aerial - -28);
    return Math.max(0, Math.min(1, 1 - off / 54));
  }, [aerial]);

  /* ---- which station the pointer is nearest, and how near ---- */
  const { station, proximity } = useMemo(() => {
    let best = stations[0];
    let p = 0;
    for (const s of stations) {
      const near = Math.max(0, 1 - Math.abs(tune - s.dial) / BAND);
      if (near > p) {
        p = near;
        best = s;
      }
    }
    return { station: best, proximity: p };
  }, [stations, tune]);

  const signal = proximity * aerialQuality;
  const locked = signal > 0.8;
  const playable = Boolean(station?.youtubeId);

  /* ---- dragging the aerial pole ---- */
  const onMove = useCallback((e: PointerEvent) => {
    const el = svg.current;
    if (!el) return;
    const box = el.getBoundingClientRect();
    const hx = box.left + box.width * 0.845;
    const hy = box.top + box.height * 0.6;
    const deg = (Math.atan2(e.clientY - hy, e.clientX - hx) * 180) / Math.PI;
    setAerial(Math.max(-104, Math.min(4, deg)));
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

  /* ---- power: the hiss, then the player ---- */
  async function power() {
    if (on) {
      hiss.current?.gain.setTargetAtTime(0, ctx.current?.currentTime ?? 0, 0.1);
      player.current?.pauseVideo();
      setOn(false);
      return;
    }

    if (!ctx.current) {
      const Ctor =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      const c = new Ctor();
      await c.resume();

      // Two seconds of noise, band limited so it reads as a valve set
      // rather than a broken speaker.
      const len = c.sampleRate * 2;
      const buf = c.createBuffer(1, len, c.sampleRate);
      const data = buf.getChannelData(0);
      let last = 0;
      for (let i = 0; i < len; i++) {
        const white = Math.random() * 2 - 1;
        last = 0.96 * last + 0.04 * white;
        data[i] = last * 2.4 + white * 0.35;
      }

      const src = c.createBufferSource();
      src.buffer = buf;
      src.loop = true;

      const band = c.createBiquadFilter();
      band.type = "bandpass";
      band.frequency.value = 1500;
      band.Q.value = 0.7;

      const g = c.createGain();
      g.gain.value = 0;

      src.connect(band);
      band.connect(g);
      g.connect(c.destination);
      src.start();

      ctx.current = c;
      hiss.current = g;
    } else {
      await ctx.current.resume();
    }

    setOn(true);

    if (!player.current && mount.current) {
      await loadYouTubeApi();
      const withVideo = stations.find((s) => s.youtubeId);
      if (window.YT?.Player && withVideo?.youtubeId) {
        player.current = new window.YT.Player(mount.current, {
          videoId: withVideo.youtubeId,
          playerVars: {
            start: withVideo.startSeconds ?? 0,
            rel: 0,
            playsinline: 1,
          },
          events: {
            onReady: (e: { target: YTPlayer }) => {
              e.target.setVolume(0);
              e.target.playVideo();
              setReady(true);
            },
          },
        });
      }
    } else {
      player.current?.playVideo();
    }
  }

  /* ---- the crossfade, every time the dial moves ---- */
  useEffect(() => {
    if (!on) return;
    const c = ctx.current;
    if (c && hiss.current) {
      // Hiss never disappears entirely at the edges of the band; it
      // fades to nothing only when you are properly on the station.
      const noise = Math.pow(1 - signal, 1.4) * 0.28;
      hiss.current.gain.setTargetAtTime(noise, c.currentTime, 0.08);
    }
    if (player.current && ready) {
      player.current.setVolume(
        playable ? Math.round(Math.pow(signal, 1.3) * 100) : 0,
      );
    }
  }, [on, signal, ready, playable]);

  useEffect(
    () => () => {
      player.current?.destroy();
      void ctx.current?.close();
    },
    [],
  );

  const pointerX = 74 + tune * 248;

  return (
    <div className="surface overflow-hidden">
      <div className="bg-[#140f0c] px-4 py-8 sm:px-8">
        <svg
          ref={svg}
          viewBox="0 0 440 262"
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
          <motion.g
            style={{ transformOrigin: "372px 156px" }}
            animate={{ rotate: aerial + 76 }}
            transition={{ type: "spring", stiffness: 220, damping: 24 }}
          >
            <line x1="372" y1="156" x2="372" y2="12" stroke="#9a7b4a" strokeWidth="4" strokeLinecap="round" />
            {[42, 74, 106].map((y) => (
              <line key={y} x1="368" y1={y} x2="376" y2={y} stroke="#6d4320" strokeWidth="1.4" />
            ))}
            <circle
              cx="372"
              cy="12"
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
          <path
            d={`M372,18 Q300,${88 + (1 - aerialQuality) * 26} 250,106`}
            fill="none"
            stroke="#b9a184"
            strokeWidth="1.4"
            opacity="0.85"
          />
          <text x="256" y="102" fontSize="7" fill="#b9a184">A</text>

          {/* ---- cabinet ---- */}
          <rect x="26" y="106" width="352" height="140" rx="8" fill="url(#veneer)" stroke="#2d1b0c" strokeWidth="2" />
          <rect x="34" y="114" width="336" height="124" rx="5" fill="none" stroke="#a8763f" strokeWidth="1" opacity="0.55" />

          {/* ---- the dial glass ---- */}
          <rect x="62" y="124" width="272" height="52" rx="3" fill="#1a1109" />
          <motion.rect
            x="64"
            y="126"
            width="268"
            height="48"
            rx="2"
            fill="url(#glass)"
            animate={{ opacity: on ? 0.42 + signal * 0.55 : 0.16 }}
            transition={{ duration: 0.3 }}
          />

          {["13", "16", "19", "25", "31", "41", "49", "60", "75"].map((m, i) => (
            <text key={m} x={74 + i * 31} y="138" fontSize="6" fill="#2d1b0c" textAnchor="middle">
              {m}
            </text>
          ))}
          <line x1="66" y1="142" x2="330" y2="142" stroke="#2d1b0c" strokeWidth="0.6" />

          {stations.map((s) => (
            <text
              key={s.id}
              x={74 + s.dial * 248}
              y="154"
              fontSize="6.2"
              fill="#2d1b0c"
              textAnchor="middle"
              style={{ letterSpacing: "0.04em" }}
            >
              {s.name.toUpperCase()}
            </text>
          ))}

          {Array.from({ length: 27 }).map((_, i) => (
            <line
              key={i}
              x1={68 + i * 10}
              y1="170"
              x2={68 + i * 10}
              y2={i % 5 === 0 ? 160 : 165}
              stroke="#2d1b0c"
              strokeWidth="0.7"
            />
          ))}

          <motion.line
            animate={{ x: pointerX - 200 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            x1="200"
            y1="126"
            x2="200"
            y2="174"
            stroke="#c0271a"
            strokeWidth="2"
          />

          {/* the magic eye closes as the signal comes in */}
          <g>
            <circle cx="348" cy="150" r="11" fill="#1a1109" />
            <motion.ellipse
              cx="348"
              cy="150"
              rx={1.5 + (1 - signal) * 8}
              ry="7.5"
              fill="#5fbf7a"
              animate={{ opacity: on ? 0.4 + signal * 0.55 : 0.12 }}
            />
          </g>

          {/* ---- fret and cloth ---- */}
          <rect x="62" y="184" width="168" height="50" rx="3" fill="url(#gold)" />
          {Array.from({ length: 11 }).map((_, i) => (
            <rect key={i} x={66 + i * 15} y="184" width="5" height="50" fill="#6d4320" />
          ))}
          <rect x="62" y="184" width="168" height="50" rx="3" fill="none" stroke="#2d1b0c" strokeWidth="1.4" />

          {/* ---- knobs. the right one tunes. ---- */}
          {[
            { cx: 262, cy: 208, label: "VOL", angle: 40 },
            { cx: 330, cy: 208, label: "TUNE", angle: tune * 250 - 125 },
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
                animate={{ rotate: k.angle }}
                transition={{ type: "spring", stiffness: 250, damping: 26 }}
              />
              <text x={k.cx} y={k.cy + 30} textAnchor="middle" fontSize="5.6" fill="#c8ab82" style={{ letterSpacing: "0.2em" }}>
                {k.label}
              </text>
            </g>
          ))}

          <text x="146" y="246" textAnchor="middle" fontSize="9" fill="#c8ab82" style={{ letterSpacing: "0.32em" }}>
            MURPHY
          </text>
        </svg>

        {/* ---- the tuning control, a real input so it works everywhere ---- */}
        <label className="mx-auto mt-6 block max-w-[30rem]">
          <span className="mb-2 block text-center text-[0.62rem] uppercase tracking-[0.26em] text-[#e6d3ad]/55">
            Tune
          </span>
          <input
            type="range"
            min={0}
            max={1000}
            value={Math.round(tune * 1000)}
            onChange={(e) => setTune(Number(e.target.value) / 1000)}
            aria-label="Tuning dial"
            className="w-full accent-[#c0271a]"
          />
        </label>

        <p className="mt-4 text-center text-[0.75rem] leading-relaxed text-[#e6d3ad]/65">
          {!on
            ? "Switch it on, then find the station. The hiss tells you how close you are."
            : locked
              ? `${station?.name}. The magic eye has closed.`
              : signal > 0.25
                ? "Almost. Turn the dial slowly and lift the aerial."
                : "Static. Walk the dial across the glass and drag the top of the aerial pole."}
        </p>
      </div>

      {/* ---- the programme, visible as the player API requires ---- */}
      <div className="border-t border-line bg-[#0f0b09] p-5">
        <div className="mx-auto aspect-video w-full max-w-[26rem]">
          <div ref={mount} className="h-full w-full" />
        </div>
        <p className="mt-3 text-center text-[0.62rem] uppercase tracking-[0.2em] text-ink-faint">
          {playable
            ? "Mahishasuramardini, from Saregama's own upload"
            : `${station?.name} is live only. Open Akashvani for it.`}
        </p>
      </div>

      {/* ---- controls ---- */}
      <div className="border-t border-line p-5">
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={power}
            className={`btn !py-2 !text-[0.68rem] ${on ? "btn-ghost" : "btn-primary"}`}
          >
            <Power size={13} /> {on ? "Switch off" : "Switch on"}
          </button>

          <div className="flex flex-wrap gap-1">
            {stations.map((s) => (
              <button
                key={s.id}
                onClick={() => setTune(s.dial)}
                className={`border px-2.5 py-1.5 text-[0.62rem] uppercase tracking-[0.12em] transition-colors ${
                  s.id === station?.id && proximity > 0.5
                    ? "border-sindoor text-sindoor"
                    : "border-line text-ink-faint hover:border-gold hover:text-gold"
                }`}
              >
                {s.name}
              </button>
            ))}
          </div>

          <a
            href={station?.listenUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="btn btn-ghost !py-2 !text-[0.65rem]"
          >
            <ExternalLink size={12} /> Akashvani live
          </a>
        </div>

        <p className="mt-4 text-[0.85rem] leading-relaxed text-ink-soft">
          <span className="bangla-display text-[1.1rem] text-ink">
            {station?.bangla}
          </span>{" "}
          <span className="text-gold">{station?.frequency}</span> {station?.note}
        </p>

        <p className="mt-2 text-[0.75rem] leading-relaxed text-ink-faint">
          {broadcast}
        </p>

        <p className="mt-3 text-[0.72rem] leading-relaxed text-ink-faint">
          The hiss is generated here. The programme is Saregama&apos;s own
          upload, whose volume the dial controls, because the recording is
          theirs and the broadcast is Prasar Bharati&apos;s. For the live
          signal on the morning itself, the Akashvani button opens their
          player.
        </p>
      </div>
    </div>
  );
}
