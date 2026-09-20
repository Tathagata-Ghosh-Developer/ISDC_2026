"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { SHLOKAS, ARRIVAL_LINES } from "@/lib/content/shlokas";
import { FACTS } from "@/lib/content/facts";

/* ================================================================
   The arrival sequence.

   Four movements, told in SVG rather than video so it weighs a few
   kilobytes and stays sharp on any screen:

     1  Alpona   — a mandala draws itself, a shloka settles
     2  Agomon   — the boat crosses the river, Ma and four children
     3  Mardini  — ten arms open, the trishul falls, the asura breaks
     4  Bodhon   — the title, then the doors part

   Plays once per browser session. Skippable at any point. Collapses
   to a single fade when the visitor asks for reduced motion.
   ================================================================ */

const ACTS = [1400, 1500, 2200, 1200] as const;
const TOTAL = ACTS.reduce((a, b) => a + b, 0);
const EASE = [0.22, 1, 0.36, 1] as const;
const SESSION_KEY = "isdc-arrived";

type Props = {
  /** Set false to show the sequence on every navigation, for previewing. */
  oncePerSession?: boolean;
};

export default function Arrival({ oncePerSession = true }: Props) {
  const reduce = useReducedMotion();
  const [visible, setVisible] = useState(false);
  const [act, setAct] = useState(0);
  const [progress, setProgress] = useState(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const shloka = useMemo(
    () => SHLOKAS[Math.floor(Math.random() * SHLOKAS.length)],
    [],
  );
  const tickerFacts = useMemo(() => {
    const start = Math.floor(Math.random() * FACTS.length);
    return Array.from({ length: 4 }, (_, i) => FACTS[(start + i * 5) % FACTS.length]);
  }, []);

  /* --- decide whether to play at all --- */
  useEffect(() => {
    let seen = false;
    try {
      seen = oncePerSession && sessionStorage.getItem(SESSION_KEY) === "1";
    } catch {
      /* private mode: just play it */
    }
    if (seen) return;

    setVisible(true);
    document.body.style.overflow = "hidden";

    if (reduce) {
      timers.current.push(setTimeout(finish, 700));
      return cleanup;
    }

    let elapsed = 0;
    ACTS.forEach((ms, i) => {
      elapsed += ms;
      if (i < ACTS.length - 1) {
        timers.current.push(setTimeout(() => setAct(i + 1), elapsed));
      }
    });
    timers.current.push(setTimeout(finish, TOTAL));

    const started = performance.now();
    const raf = () => {
      const p = Math.min(1, (performance.now() - started) / TOTAL);
      setProgress(p);
      if (p < 1) frame = requestAnimationFrame(raf);
    };
    let frame = requestAnimationFrame(raf);
    timers.current.push(
      setTimeout(() => cancelAnimationFrame(frame), TOTAL + 100),
    );

    return cleanup;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function cleanup() {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    document.body.style.overflow = "";
  }

  function finish() {
    try {
      sessionStorage.setItem(SESSION_KEY, "1");
    } catch {
      /* ignore */
    }
    cleanup();
    setVisible(false);
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "Enter") finish();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="arrival"
          className="fixed inset-0 z-[200] flex flex-col items-center justify-center overflow-hidden"
          style={{ background: "#0b0709" }}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: EASE }}
          role="status"
          aria-label="Welcome sequence"
        >
          {/* lamp glow */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 70% 55% at 50% 48%, rgba(224,138,44,0.18), transparent 70%)",
            }}
          />

          {/* ---------- doors, act 4 ---------- */}
          <AnimatePresence>
            {act >= 3 && !reduce && (
              <>
                <motion.div
                  key="door-l"
                  className="absolute inset-y-0 left-0 z-30 w-1/2 origin-left"
                  style={{ background: "#0b0709" }}
                  initial={{ x: 0 }}
                  animate={{ x: "-100%" }}
                  transition={{ duration: 1.1, delay: 0.45, ease: EASE }}
                />
                <motion.div
                  key="door-r"
                  className="absolute inset-y-0 right-0 z-30 w-1/2 origin-right"
                  style={{ background: "#0b0709" }}
                  initial={{ x: 0 }}
                  animate={{ x: "100%" }}
                  transition={{ duration: 1.1, delay: 0.45, ease: EASE }}
                />
              </>
            )}
          </AnimatePresence>

          {/* ---------- the stage ---------- */}
          <div className="relative z-20 flex w-full max-w-[42rem] flex-1 flex-col items-center justify-center px-6">
            <AnimatePresence mode="wait">
              {reduce ? (
                <motion.div key="reduced" className="text-center">
                  <Mandala drawn />
                  <p className="bangla mt-6 text-[1.6rem] text-[#f0dcc0]">
                    শারদীয়া দুর্গোৎসব
                  </p>
                </motion.div>
              ) : act === 0 ? (
                <ActAlpona key="a0" shloka={shloka} />
              ) : act === 1 ? (
                <ActAgomon key="a1" />
              ) : act === 2 ? (
                <ActMardini key="a2" />
              ) : (
                <ActBodhon key="a3" />
              )}
            </AnimatePresence>
          </div>

          {/* ---------- ticker and progress ---------- */}
          {!reduce && (
            <div className="relative z-20 w-full max-w-[42rem] px-6 pb-8">
              <TickerLine facts={tickerFacts} act={act} />
              <div className="mt-4 h-px w-full bg-[#f0dcc0]/12">
                <motion.div
                  className="h-px"
                  style={{
                    width: `${progress * 100}%`,
                    background:
                      "linear-gradient(90deg, #a8842f, #efb44a, #fbf3e4)",
                  }}
                />
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-[0.6rem] uppercase tracking-[0.3em] text-[#f0dcc0]/40">
                  {["Alpona", "Agomon", "Mardini", "Bodhon"][act]}
                </span>
                <button
                  onClick={finish}
                  className="text-[0.6rem] uppercase tracking-[0.3em] text-[#f0dcc0]/55 transition-colors hover:text-[#efb44a]"
                >
                  Skip
                </button>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ================================================================
   Act 1 — Alpona
   ================================================================ */

function ActAlpona({ shloka }: { shloka: (typeof SHLOKAS)[number] }) {
  return (
    <motion.div
      className="flex flex-col items-center text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.5, ease: EASE }}
    >
      <Mandala />
      <motion.p
        className="bangla mt-7 whitespace-pre-line text-[0.95rem] leading-[1.9] text-[#f0dcc0] sm:text-[1.1rem]"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.5, ease: EASE }}
      >
        {shloka.sanskrit}
      </motion.p>
      <motion.p
        className="mt-3 max-w-[40ch] text-[0.72rem] italic leading-relaxed text-[#f0dcc0]/50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.9, delay: 0.85 }}
      >
        {shloka.meaning}
      </motion.p>
    </motion.div>
  );
}

function Mandala({ drawn = false }: { drawn?: boolean }) {
  const petals = 8;
  return (
    <svg viewBox="0 0 200 200" className="h-[8.5rem] w-[8.5rem] sm:h-[11rem] sm:w-[11rem]">
      <g
        fill="none"
        stroke="#c9871f"
        strokeWidth="0.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {[86, 68, 44, 24].map((r, i) => (
          <motion.circle
            key={r}
            cx="100"
            cy="100"
            r={r}
            pathLength={1}
            initial={drawn ? false : { pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.1, delay: i * 0.1, ease: EASE }}
          />
        ))}
        {Array.from({ length: petals }).map((_, i) => {
          const a = (i * 360) / petals;
          return (
            <motion.path
              key={i}
              d="M100,24 C118,48 118,72 100,92 C82,72 82,48 100,24 Z"
              transform={`rotate(${a} 100 100)`}
              pathLength={1}
              initial={drawn ? false : { pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.9, delay: 0.25 + i * 0.05, ease: EASE }}
            />
          );
        })}
        {Array.from({ length: 16 }).map((_, i) => {
          const a = ((i * 360) / 16) * (Math.PI / 180);
          return (
            <motion.line
              key={i}
              x1={100 + 88 * Math.cos(a)}
              y1={100 + 88 * Math.sin(a)}
              x2={100 + 96 * Math.cos(a)}
              y2={100 + 96 * Math.sin(a)}
              pathLength={1}
              initial={drawn ? false : { pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.5, delay: 0.7 + i * 0.02 }}
            />
          );
        })}
      </g>
      <motion.circle
        cx="100"
        cy="100"
        r="7"
        fill="#b3261e"
        initial={drawn ? false : { scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.7, delay: 0.9, ease: [0.34, 1.56, 0.64, 1] }}
        style={{ transformOrigin: "100px 100px" }}
      />
    </svg>
  );
}

/* ================================================================
   Act 2 — Agomon, the crossing
   ================================================================ */

function ActAgomon() {
  return (
    <motion.div
      className="flex w-full flex-col items-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
    >
      <svg viewBox="0 0 360 160" className="w-full max-w-[26rem]">
        {/* moon */}
        <motion.circle
          cx="300"
          cy="34"
          r="13"
          fill="#f0dcc0"
          opacity="0.75"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.75 }}
          transition={{ duration: 1, ease: EASE }}
          style={{ transformOrigin: "300px 34px" }}
        />

        {/* far bank: a skyline of temple finials */}
        <motion.path
          d="M0,104 L18,104 L22,92 L26,104 L52,104 L56,86 L60,104 L96,104 L100,96 L104,104 L150,104"
          fill="none"
          stroke="#6b4a2f"
          strokeWidth="1.1"
          pathLength={1}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.1, ease: EASE }}
        />

        {/* river */}
        {[112, 122, 132, 142].map((y, i) => (
          <motion.path
            key={y}
            d={`M-20,${y} q 30,-5 60,0 t 60,0 t 60,0 t 60,0 t 60,0 t 60,0`}
            fill="none"
            stroke="#1e3a5f"
            strokeOpacity={0.75 - i * 0.12}
            strokeWidth="1.2"
            initial={{ x: 0 }}
            animate={{ x: [0, -120] }}
            transition={{
              duration: 5 - i * 0.7,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}

        {/* the boat, carrying five */}
        <motion.g
          initial={{ x: -150 }}
          animate={{ x: 190 }}
          transition={{ duration: 2.6, ease: [0.4, 0, 0.3, 1] }}
        >
          <motion.g
            animate={{ y: [0, -2.5, 0] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          >
            {/* hull */}
            <path
              d="M40,120 L120,120 L112,132 L48,132 Z"
              fill="#2a1a10"
              stroke="#c9871f"
              strokeWidth="0.8"
            />
            {/* sail */}
            <path d="M80,120 L80,80 L104,112 Z" fill="#f0dcc0" opacity="0.85" />
            <line x1="80" y1="78" x2="80" y2="121" stroke="#c9871f" strokeWidth="1" />

            {/* Ma, taller, ten arms hinted as a fan */}
            <g stroke="#c9871f" strokeWidth="0.7" fill="none">
              {Array.from({ length: 10 }).map((_, i) => {
                const a = (-165 + i * 16.5) * (Math.PI / 180);
                return (
                  <line
                    key={i}
                    x1="62"
                    y1="106"
                    x2={62 + 11 * Math.cos(a)}
                    y2={106 + 11 * Math.sin(a)}
                  />
                );
              })}
            </g>
            <ellipse cx="62" cy="102" rx="3.4" ry="4" fill="#b3261e" />
            <path d="M58.6,106 L65.4,106 L67,120 L57,120 Z" fill="#b3261e" />

            {/* four children */}
            {[
              { x: 50, h: 9, c: "#a8842f" },
              { x: 56, h: 8, c: "#4f6b4a" },
              { x: 96, h: 8, c: "#1e3a5f" },
              { x: 103, h: 9, c: "#a9613c" },
            ].map((k) => (
              <g key={k.x}>
                <circle cx={k.x} cy={120 - k.h - 2.4} r="2.2" fill={k.c} />
                <path
                  d={`M${k.x - 2.4},${120 - k.h} L${k.x + 2.4},${120 - k.h} L${k.x + 3},120 L${k.x - 3},120 Z`}
                  fill={k.c}
                />
              </g>
            ))}
          </motion.g>
        </motion.g>

        {/* kash reeds in the foreground */}
        {Array.from({ length: 22 }).map((_, i) => {
          const x = 6 + i * 16.4;
          const h = 20 + ((i * 37) % 16);
          return (
            <motion.g
              key={i}
              style={{ transformOrigin: `${x}px 158px` }}
              animate={{ rotate: [-2.5, 2.5, -2.5] }}
              transition={{
                duration: 3 + (i % 4) * 0.4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.05,
              }}
            >
              <line
                x1={x}
                y1="158"
                x2={x}
                y2={158 - h}
                stroke="#6b4a2f"
                strokeWidth="0.8"
              />
              <ellipse
                cx={x}
                cy={158 - h - 3}
                rx="2.4"
                ry="4.6"
                fill="#f0dcc0"
                opacity="0.8"
              />
            </motion.g>
          );
        })}
      </svg>

      <ArrivalCaption index={1} />
    </motion.div>
  );
}

/* ================================================================
   Act 3 — Mahishasura Mardini
   ================================================================ */

const WEAPONS = [
  "trishul",
  "chakra",
  "shankha",
  "gada",
  "padma",
  "khadga",
  "dhanu",
  "bajra",
  "ghanta",
  "sarpa",
] as const;

function Weapon({ kind, size = 9 }: { kind: string; size?: number }) {
  const s = size;
  switch (kind) {
    case "trishul":
      return (
        <g stroke="#efb44a" strokeWidth="1" fill="none" strokeLinecap="round">
          <line x1="0" y1={s} x2="0" y2={-s} />
          <path d={`M${-s * 0.5},${-s * 0.3} L${-s * 0.5},${-s} M${s * 0.5},${-s * 0.3} L${s * 0.5},${-s}`} />
          <line x1={-s * 0.5} y1={-s * 0.3} x2={s * 0.5} y2={-s * 0.3} />
        </g>
      );
    case "chakra":
      return (
        <g stroke="#efb44a" strokeWidth="0.9" fill="none">
          <circle cx="0" cy="0" r={s * 0.7} />
          {Array.from({ length: 6 }).map((_, i) => {
            const a = (i * Math.PI) / 3;
            return (
              <line
                key={i}
                x1={0}
                y1={0}
                x2={s * 0.7 * Math.cos(a)}
                y2={s * 0.7 * Math.sin(a)}
              />
            );
          })}
        </g>
      );
    case "shankha":
      return (
        <path
          d={`M0,${s * 0.7} C${-s * 0.6},${s * 0.2} ${-s * 0.3},${-s * 0.7} 0,${-s * 0.7} C${s * 0.45},${-s * 0.7} ${s * 0.5},${s * 0.1} 0,${s * 0.7} Z`}
          fill="#f0dcc0"
          opacity="0.9"
        />
      );
    case "padma":
      return (
        <g fill="#b3261e" opacity="0.9">
          {Array.from({ length: 6 }).map((_, i) => (
            <ellipse
              key={i}
              cx="0"
              cy={-s * 0.35}
              rx={s * 0.18}
              ry={s * 0.45}
              transform={`rotate(${i * 60})`}
            />
          ))}
        </g>
      );
    case "khadga":
      return (
        <g stroke="#efb44a" strokeWidth="1.1" strokeLinecap="round">
          <line x1="0" y1={s * 0.7} x2="0" y2={-s * 0.8} />
          <line x1={-s * 0.35} y1={s * 0.35} x2={s * 0.35} y2={s * 0.35} />
        </g>
      );
    case "dhanu":
      return (
        <g stroke="#efb44a" strokeWidth="0.9" fill="none">
          <path d={`M${-s * 0.5},${-s * 0.7} Q${s * 0.6},0 ${-s * 0.5},${s * 0.7}`} />
          <line x1={-s * 0.5} y1={-s * 0.7} x2={-s * 0.5} y2={s * 0.7} />
        </g>
      );
    case "gada":
      return (
        <g stroke="#efb44a" strokeWidth="1" fill="#efb44a">
          <line x1="0" y1={s * 0.8} x2="0" y2={-s * 0.3} />
          <circle cx="0" cy={-s * 0.6} r={s * 0.34} />
        </g>
      );
    case "bajra":
      return (
        <g stroke="#efb44a" strokeWidth="0.9" fill="none" strokeLinecap="round">
          <line x1="0" y1={-s * 0.8} x2="0" y2={s * 0.8} />
          <path d={`M${-s * 0.4},${-s * 0.8} L0,${-s * 0.4} L${s * 0.4},${-s * 0.8}`} />
          <path d={`M${-s * 0.4},${s * 0.8} L0,${s * 0.4} L${s * 0.4},${s * 0.8}`} />
        </g>
      );
    case "ghanta":
      return (
        <path
          d={`M${-s * 0.4},${s * 0.4} Q${-s * 0.4},${-s * 0.5} 0,${-s * 0.6} Q${s * 0.4},${-s * 0.5} ${s * 0.4},${s * 0.4} Z`}
          fill="#efb44a"
          opacity="0.85"
        />
      );
    default:
      return (
        <path
          d={`M${-s * 0.5},${s * 0.5} Q0,0 ${-s * 0.3},${-s * 0.5} Q${s * 0.4},${-s * 0.2} ${s * 0.4},${s * 0.4}`}
          stroke="#efb44a"
          strokeWidth="0.9"
          fill="none"
          strokeLinecap="round"
        />
      );
  }
}

function ActMardini() {
  const shards = useMemo(
    () =>
      Array.from({ length: 26 }, (_, i) => {
        const a = (i / 26) * Math.PI * 2;
        const d = 40 + ((i * 53) % 60);
        return { x: Math.cos(a) * d, y: Math.sin(a) * d * 0.7, r: 1 + (i % 3) };
      }),
    [],
  );

  return (
    <motion.div
      className="flex w-full flex-col items-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, ease: EASE }}
    >
      <svg viewBox="0 0 240 220" className="w-full max-w-[19rem]">
        {/* halo */}
        <motion.g
          style={{ transformOrigin: "120px 92px" }}
          animate={{ rotate: 360 }}
          transition={{ duration: 26, repeat: Infinity, ease: "linear" }}
        >
          <circle
            cx="120"
            cy="92"
            r="74"
            fill="none"
            stroke="#c9871f"
            strokeOpacity="0.35"
            strokeWidth="0.7"
            strokeDasharray="2 7"
          />
          <circle
            cx="120"
            cy="92"
            r="82"
            fill="none"
            stroke="#c9871f"
            strokeOpacity="0.2"
            strokeWidth="0.6"
            strokeDasharray="1 11"
          />
        </motion.g>

        {/* ten arms opening */}
        {WEAPONS.map((w, i) => {
          const deg = -172 + i * 16;
          const rad = (deg * Math.PI) / 180;
          const len = 62;
          const tx = 120 + len * Math.cos(rad);
          const ty = 92 + len * Math.sin(rad);
          return (
            <motion.g
              key={w}
              initial={{ opacity: 0, scale: 0.2 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                duration: 0.55,
                delay: 0.1 + i * 0.045,
                ease: [0.34, 1.56, 0.64, 1],
              }}
              style={{ transformOrigin: "120px 92px" }}
            >
              <line
                x1="120"
                y1="92"
                x2={tx}
                y2={ty}
                stroke="#b3261e"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
              <g transform={`translate(${tx} ${ty})`}>
                <Weapon kind={w} />
              </g>
            </motion.g>
          );
        })}

        {/* the goddess: face, third eye, body */}
        <motion.g
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.7, ease: [0.34, 1.56, 0.64, 1] }}
          style={{ transformOrigin: "120px 92px" }}
        >
          <ellipse cx="120" cy="82" rx="15" ry="18" fill="#f0dcc0" />
          <path d="M105,74 Q120,56 135,74 Q120,66 105,74 Z" fill="#2a1a10" />
          <circle cx="114" cy="83" r="1.9" fill="#2a1a10" />
          <circle cx="126" cy="83" r="1.9" fill="#2a1a10" />
          <motion.ellipse
            cx="120"
            cy="76"
            rx="1.5"
            ry="2.8"
            fill="#b3261e"
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 1.4, repeat: Infinity }}
          />
          {/* crown */}
          <path
            d="M104,68 L108,54 L114,64 L120,48 L126,64 L132,54 L136,68 Z"
            fill="#efb44a"
          />
          <path d="M108,100 L132,100 L140,142 L100,142 Z" fill="#b3261e" />
        </motion.g>

        {/* the lion */}
        <motion.g
          initial={{ x: -26, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5, ease: EASE }}
        >
          <ellipse cx="86" cy="152" rx="24" ry="13" fill="#a9613c" />
          <circle cx="66" cy="146" r="11" fill="#c9871f" />
          <circle cx="66" cy="146" r="6.5" fill="#a9613c" />
        </motion.g>

        {/* trishul falling */}
        <motion.g
          initial={{ y: -180, opacity: 0, rotate: -8 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          transition={{ duration: 0.5, delay: 0.85, ease: [0.6, 0, 0.9, 1] }}
          style={{ transformOrigin: "156px 100px" }}
        >
          <line
            x1="156"
            y1="96"
            x2="156"
            y2="176"
            stroke="#efb44a"
            strokeWidth="2.6"
            strokeLinecap="round"
          />
          <path
            d="M146,104 L146,84 M156,100 L156,78 M166,104 L166,84"
            stroke="#efb44a"
            strokeWidth="2.2"
            fill="none"
            strokeLinecap="round"
          />
          <line x1="144" y1="104" x2="168" y2="104" stroke="#efb44a" strokeWidth="2" />
        </motion.g>

        {/* the asura, and his breaking */}
        <motion.path
          d="M156,196 C144,196 136,188 136,178 C136,170 140,164 146,161 L142,154 C136,152 130,146 130,140 C136,140 142,144 146,150 L150,158 C152,157 154,156 156,156 C158,156 160,157 162,158 L166,150 C170,144 176,140 182,140 C182,146 176,152 170,154 L166,161 C172,164 176,170 176,178 C176,188 168,196 156,196 Z"
          fill="#2a1a10"
          stroke="#6b4a2f"
          strokeWidth="0.8"
          initial={{ opacity: 1, scale: 1 }}
          animate={{ opacity: [1, 1, 0], scale: [1, 1.08, 0.5] }}
          transition={{ duration: 0.9, delay: 1.05, times: [0, 0.22, 1], ease: EASE }}
          style={{ transformOrigin: "156px 172px" }}
        />

        {/* impact flash */}
        <motion.circle
          cx="156"
          cy="172"
          r="4"
          fill="none"
          stroke="#fbf3e4"
          strokeWidth="2"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [0, 9], opacity: [0, 0.9, 0] }}
          transition={{ duration: 0.75, delay: 1.3, ease: "easeOut" }}
          style={{ transformOrigin: "156px 172px" }}
        />

        {/* shards */}
        {shards.map((s, i) => (
          <motion.circle
            key={i}
            cx="156"
            cy="172"
            r={s.r}
            fill={i % 3 === 0 ? "#b3261e" : "#c9871f"}
            initial={{ opacity: 0, x: 0, y: 0 }}
            animate={{ opacity: [0, 1, 0], x: s.x, y: s.y }}
            transition={{ duration: 1, delay: 1.32, ease: "easeOut" }}
          />
        ))}
      </svg>

      <ArrivalCaption index={3} />
    </motion.div>
  );
}

/* ================================================================
   Act 4 — Bodhon
   ================================================================ */

function ActBodhon() {
  return (
    <motion.div
      className="flex flex-col items-center text-center"
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.7, ease: EASE }}
    >
      <motion.div
        animate={{ scale: [1, 1.06, 1] }}
        transition={{ duration: 0.62, repeat: 2, ease: "easeInOut" }}
      >
        <Mandala drawn />
      </motion.div>
      <motion.h1
        className="bangla mt-6 text-[2rem] font-semibold leading-tight text-[#f0dcc0] sm:text-[2.8rem]"
        initial={{ opacity: 0, y: 16, letterSpacing: "0.3em" }}
        animate={{ opacity: 1, y: 0, letterSpacing: "0em" }}
        transition={{ duration: 0.9, ease: EASE }}
      >
        শারদীয়া দুর্গোৎসব
      </motion.h1>
      <motion.p
        className="mt-2 text-[0.7rem] uppercase tracking-[0.45em] text-[#c9871f]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.25 }}
      >
        IISc · 2026
      </motion.p>
    </motion.div>
  );
}

/* ================================================================
   Shared bits
   ================================================================ */

function ArrivalCaption({ index }: { index: number }) {
  const line = ARRIVAL_LINES[index % ARRIVAL_LINES.length];
  return (
    <motion.div
      className="mt-7 max-w-[34ch] text-center"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.35, ease: EASE }}
    >
      <p className="bangla text-[1rem] text-[#f0dcc0] sm:text-[1.15rem]">
        {line.bn}
      </p>
      <p className="mt-1.5 text-[0.68rem] italic text-[#f0dcc0]/45">{line.en}</p>
    </motion.div>
  );
}

function TickerLine({
  facts,
  act,
}: {
  facts: typeof FACTS;
  act: number;
}) {
  const f = facts[Math.min(act, facts.length - 1)];
  return (
    <div className="h-[3.2rem] overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.p
          key={f.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.45, ease: EASE }}
          className="text-[0.7rem] leading-relaxed text-[#f0dcc0]/60"
        >
          <span className="text-[#efb44a]">
            {f.year ? `${f.year} — ` : ""}
            {f.title}.{" "}
          </span>
          {f.fact}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}
