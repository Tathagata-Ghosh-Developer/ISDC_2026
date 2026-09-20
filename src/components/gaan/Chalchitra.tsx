"use client";

import { useEffect, useRef, useState } from "react";
import type { Mix } from "@/lib/content/desk";

/* ================================================================
   চালচিত্র, the painted arch behind the idol, used here as the meter.

   Flat fields, hard edges, mis-registered plates. Light is posterised
   rather than glowed, because a glow is a photograph and this page is
   a print. Everything responds to what is actually playing, but it
   responds in steps and bar graphs, never in blurs.

   Runs at 30fps, not 60. This is ambience; halving the rate halves the
   battery cost and nothing about it looks worse.
   ================================================================ */

type Shot = { id: string; at: number };

const INK = "#16120F";
const PAPER = "#EFE3CC";
const ALTA = "#C8202A";
const HOLUD = "#E8A020";
const NIL = "#1B4B6B";

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
  const [t, setT] = useState(0);
  const [slip, setSlip] = useState(1.5);
  const host = useRef<HTMLDivElement>(null);
  const visible = useRef(true);

  /* ---- a slow clock, paused when off screen or hidden ---- */
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const el = host.current;
    const io = el
      ? new IntersectionObserver(([e]) => (visible.current = e.isIntersecting), {
          threshold: 0.02,
        })
      : null;
    if (el && io) io.observe(el);

    let raf = 0;
    let last = 0;
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (now - last < 33) return;
      last = now;
      if (document.hidden || !visible.current) return;
      setT(now / 1000);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      io?.disconnect();
    };
  }, []);

  /* ---- a bell rings and the press slips ---- */
  useEffect(() => {
    const bell = shots.find(
      (s) => s.id === "kanshor_ghanta" || s.id === "mandir_ghanta",
    );
    if (!bell) return;
    setSlip(3);
    const id = setTimeout(() => setSlip(1.5), 120);
    return () => clearTimeout(id);
  }, [shots]);

  const v = (id: string) => (mix[id] ?? 0) / 100;

  const dhak = v("dhak");
  const adda = v("adda");
  const rain = v("brishti");
  const arati = v("sandhya_arati");
  const ganga = v("gangar_dhara");
  const drone = Math.max(v("tanpura_drone"), v("mantra_path"));

  const beat = playing ? 1 + dhak * 0.035 * (0.5 + 0.5 * Math.sin(t * 4.4)) : 1;
  const figures = Math.round(adda * 24);
  const rainLines = Math.round(rain * 26);
  const villageWipe = city;

  const conch = shots.find((s) => s.id === "shankha");
  const ulu = shots.find((s) => s.id === "ulu_dhwani");

  return (
    <div ref={host} className="relative w-full overflow-hidden" style={{ background: INK }}>
      <svg
        viewBox="0 0 400 240"
        className="block w-full"
        role="img"
        aria-label="A painted arch that responds to the sounds playing"
      >
        <defs>
          <clipPath id="archClip">
            <path d="M40,230 L40,120 Q40,36 200,36 Q360,36 360,120 L360,230 Z" />
          </clipPath>
          <clipPath id="villageClip">
            <rect x="0" y="0" width={(villageWipe / 100) * 400} height="240" />
          </clipPath>
        </defs>

        {/* ---- the scarlet plate, mis-registered ---- */}
        <g transform={`translate(${slip} ${slip * 0.6})`} opacity="0.92">
          <path
            d="M40,230 L40,120 Q40,36 200,36 Q360,36 360,120 L360,230 Z"
            fill={ALTA}
          />
        </g>

        {/* ---- the black plate ---- */}
        <path
          d="M46,230 L46,122 Q46,44 200,44 Q354,44 354,122 L354,230 Z"
          fill={INK}
        />

        <g clipPath="url(#archClip)">
          {/* ---- the city behind ---- */}
          <g>
            {[70, 120, 170, 220, 270, 320].map((x, i) => (
              <rect
                key={x}
                x={x - 16}
                y={128 - (i % 3) * 14}
                width="32"
                height={110 + (i % 3) * 14}
                fill={NIL}
                opacity={0.5}
              />
            ))}
            {/* a pandal façade, three finials */}
            <path
              d="M150,150 L200,96 L250,150 Z"
              fill={HOLUD}
              opacity="0.65"
            />
            <rect x="182" y="150" width="36" height="80" fill={HOLUD} opacity="0.5" />
          </g>

          {/* ---- the village, wiped in from the left ---- */}
          <g clipPath="url(#villageClip)">
            <rect x="0" y="0" width="400" height="240" fill={INK} />
            <rect x="0" y="176" width="400" height="54" fill={NIL} opacity="0.75" />
            {/* a boat */}
            <path d="M120,186 L190,186 L182,198 L128,198 Z" fill={PAPER} opacity="0.8" />
            <path d="M155,186 L155,150 L180,178 Z" fill={PAPER} opacity="0.62" />
            {/* palms, flat */}
            {[60, 300, 340].map((x) => (
              <g key={x}>
                <rect x={x} y="132" width="3" height="48" fill={PAPER} opacity="0.5" />
                <path
                  d={`M${x + 1.5},132 q-22,-10 -28,4 q18,-6 28,2 q10,-12 28,-6 q-8,-14 -28,0 Z`}
                  fill={PAPER}
                  opacity="0.45"
                />
              </g>
            ))}
          </g>

          {/* the wipe edge travels as a keyline, a slide changeover */}
          {villageWipe > 1 && villageWipe < 99 && (
            <rect
              x={(villageWipe / 100) * 400 - 1}
              y="0"
              width="2"
              height="240"
              fill={INK}
            />
          )}

          {/* ---- the petal ring, scaled by the dhak ---- */}
          <g
            style={{
              transform: `scale(${beat})`,
              transformOrigin: "200px 230px",
            }}
          >
            {Array.from({ length: 22 }).map((_, i) => {
              const a = (Math.PI * i) / 21 + Math.PI;
              const r = 152;
              return (
                <ellipse
                  key={i}
                  cx={200 + r * Math.cos(a)}
                  cy={230 + r * Math.sin(a)}
                  rx="7"
                  ry="13"
                  fill={HOLUD}
                  opacity={0.5 + dhak * 0.45}
                  transform={`rotate(${(a * 180) / Math.PI + 90} ${200 + r * Math.cos(a)} ${230 + r * Math.sin(a)})`}
                />
              );
            })}
          </g>

          {/* ---- ten alpona dots as a bar graph ---- */}
          {Array.from({ length: 10 }).map((_, i) => {
            const lit = playing && i < Math.round(dhak * 10);
            return (
              <circle
                key={i}
                cx={128 + i * 16}
                cy="66"
                r="3.4"
                fill={lit ? HOLUD : PAPER}
                opacity={lit ? 1 : 0.16}
              />
            );
          })}

          {/* ---- the diya, posterised ---- */}
          {arati > 0.02 && (
            <g>
              {[3, 2, 1].map((ring) => (
                <circle
                  key={ring}
                  cx="200"
                  cy="128"
                  r={10 + arati * 26 * ring}
                  fill={HOLUD}
                  opacity={ring === 3 ? 0.18 : ring === 2 ? 0.35 : 0.6}
                />
              ))}
              <circle cx="200" cy="128" r={5 + arati * 12} fill={HOLUD} />
            </g>
          )}

          {/* ---- the sruti hairline ---- */}
          {drone > 0.02 && (
            <rect
              x="46"
              y={112 + Math.sin(t / 6.4) * 3}
              width="308"
              height="1"
              fill={HOLUD}
              opacity={0.3 + drone * 0.5}
            />
          )}

          {/* ---- the river band ---- */}
          {ganga > 0.02 && (
            <g>
              <rect x="0" y="196" width="400" height="34" fill={NIL} opacity={0.4 + ganga * 0.5} />
              {[0, 1, 2].map((i) => (
                <path
                  key={i}
                  d={`M-40,${204 + i * 8} q 20,-4 40,0 t 40,0 t 40,0 t 40,0 t 40,0 t 40,0 t 40,0 t 40,0 t 40,0`}
                  fill="none"
                  stroke={INK}
                  strokeWidth="1.25"
                  opacity="0.7"
                  transform={`translate(${(-(t * (8 + i * 3)) % 80)} 0)`}
                />
              ))}
            </g>
          )}

          {/* ---- rain, drawn with a ruler ---- */}
          {rainLines > 0 &&
            Array.from({ length: rainLines }).map((_, i) => {
              const x = ((i * 53) % 400) + ((t * 130) % 40);
              const y = ((i * 91 + t * 260) % 260) - 20;
              return (
                <line
                  key={i}
                  x1={x}
                  y1={y}
                  x2={x - 5}
                  y2={y + 22}
                  stroke={PAPER}
                  strokeWidth="1"
                  opacity="0.22"
                />
              );
            })}

          {/* ---- the crowd along the base ---- */}
          {figures > 0 &&
            Array.from({ length: figures }).map((_, i) => {
              const x = 46 + (i * 308) / Math.max(1, figures);
              const bob = Math.sin(t * 1.6 + i * 2.39) * 0.5;
              return (
                <g key={i} transform={`translate(${x} ${bob})`}>
                  <circle cx="0" cy="204" r="4" fill={INK} />
                  <path d="M-4.5,210 L4.5,210 L6,230 L-6,230 Z" fill={INK} />
                </g>
              );
            })}

          {/* ---- one-shots ---- */}
          {conch && (
            <circle
              cx="330"
              cy="150"
              r="14"
              fill="none"
              stroke={PAPER}
              strokeWidth="2"
              opacity="0.8"
              style={{
                animation: "shot-ring 700ms steps(5) 1",
                transformOrigin: "330px 150px",
              }}
            />
          )}
          {ulu &&
            Array.from({ length: 7 }).map((_, i) => (
              <rect
                key={i}
                x={120 + i * 28}
                y="74"
                width="2.5"
                height="16"
                fill={HOLUD}
                opacity="0.85"
                style={{ animation: `shot-flick 630ms steps(2) ${i * 90}ms 1` }}
              />
            ))}
        </g>

        {/* the arch keyline, on top of everything */}
        <path
          d="M46,230 L46,122 Q46,44 200,44 Q354,44 354,122 L354,230"
          fill="none"
          stroke={PAPER}
          strokeWidth="1.25"
          opacity="0.5"
        />
      </svg>

      <style>{`
        @keyframes shot-ring {
          from { transform: scale(0.4); opacity: 0.9; }
          to   { transform: scale(5); opacity: 0; }
        }
        @keyframes shot-flick {
          0%, 100% { opacity: 0; }
          50% { opacity: 0.9; }
        }
      `}</style>
    </div>
  );
}
