"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { SHLOKAS, ARRIVAL_LINES } from "@/lib/content/shlokas";
import { FACTS } from "@/lib/content/facts";

/* ================================================================
   পুতুল নাচ — the arrival, as a rod-puppet show.

   Bengal's putul naach works with figures on bamboo rods, jointed at
   the shoulder, worked from behind a cloth. This borrows that stage
   and draws the family in a miniature, cel-shaded register: large
   heads, larger eyes, flat colour with one shadow tone.

   Four movements:
     1  প্রস্তুতি   the lamps are lit, the curtain still down
     2  আগমন      the curtain parts, five puppets come down on rods
     3  মর্দিনী    the asura rises, the trishul swings, he is pulled under
     4  বোধন      the banner unrolls and the stage opens onto the site

   Plays once per browser session, skippable, and collapses to a
   single still frame when the visitor asks for reduced motion.
   ================================================================ */

const ACTS = [1400, 2100, 2000, 1300] as const;
const TOTAL = ACTS.reduce((a, b) => a + b, 0);
const EASE = [0.22, 1, 0.36, 1] as const;
const SPRING = [0.34, 1.56, 0.64, 1] as const;
/* Bumped when the sequence changes, so returning visitors see the new one. */
const SESSION_KEY = "isdc-arrived-putul";

/* ---------------- palette, kept close to a real pratima ---------------- */
const C = {
  night: "#0b0709",
  lamp: "#efb44a",
  gold: "#d8a13a",
  goldDark: "#9d6d1f",
  cream: "#f6ead2",
  sindoor: "#c0271a",
  alta: "#8d1810",
  skinDurga: "#f3c669",
  skinFair: "#f6dcae",
  skinPink: "#f0a99a",
  green: "#3f6b4a",
  blue: "#33608f",
  hair: "#241611",
  asura: "#4a4038",
  wood: "#7a5a3a",
} as const;

type Props = { oncePerSession?: boolean };

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
    return Array.from(
      { length: 4 },
      (_, i) => FACTS[(start + i * 5) % FACTS.length],
    );
  }, []);

  useEffect(() => {
    let seen = false;
    try {
      seen = oncePerSession && sessionStorage.getItem(SESSION_KEY) === "1";
    } catch {
      /* private window: just play it */
    }
    if (seen) return;

    setVisible(true);
    document.body.style.overflow = "hidden";

    if (reduce) {
      timers.current.push(setTimeout(finish, 900));
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
    let frame = 0;
    const raf = () => {
      const p = Math.min(1, (performance.now() - started) / TOTAL);
      setProgress(p);
      if (p < 1) frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);
    timers.current.push(
      setTimeout(() => cancelAnimationFrame(frame), TOTAL + 120),
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
          style={{ background: C.night }}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: EASE }}
          role="status"
          aria-label="Welcome sequence: a puppet show"
        >
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 70% 52% at 50% 56%, rgba(239,180,74,0.16), transparent 72%)",
            }}
          />

          <div className="relative z-20 flex w-full max-w-[44rem] flex-1 flex-col items-center justify-center px-5">
            <Stage act={act} reduce={Boolean(reduce)} />

            <AnimatePresence mode="wait">
              <motion.div
                key={act}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.5, ease: EASE }}
                className="mt-7 max-w-[38ch] text-center"
              >
                {act === 0 ? (
                  <>
                    <p
                      className="bangla-display whitespace-pre-line text-[0.95rem] leading-[1.95] sm:text-[1.05rem]"
                      style={{ color: C.cream }}
                    >
                      {shloka.sanskrit}
                    </p>
                    <p
                      className="mt-2.5 text-[0.7rem] italic leading-relaxed"
                      style={{ color: "rgba(246,234,210,0.45)" }}
                    >
                      {shloka.meaning}
                    </p>
                  </>
                ) : (
                  <Caption index={act} />
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {!reduce && (
            <div className="relative z-20 w-full max-w-[44rem] px-5 pb-7">
              <Ticker facts={tickerFacts} act={act} />
              <div
                className="mt-4 h-px w-full"
                style={{ background: "rgba(246,234,210,0.12)" }}
              >
                <motion.div
                  className="h-px"
                  style={{
                    width: `${progress * 100}%`,
                    background: `linear-gradient(90deg, ${C.goldDark}, ${C.lamp}, ${C.cream})`,
                  }}
                />
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span
                  className="bangla-display text-[0.78rem]"
                  style={{ color: "rgba(246,234,210,0.42)" }}
                >
                  {["প্রস্তুতি", "আগমন", "মর্দিনী", "বোধন"][act]}
                </span>
                <button
                  onClick={finish}
                  className="text-[0.6rem] uppercase tracking-[0.3em] transition-colors"
                  style={{ color: "rgba(246,234,210,0.55)" }}
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
   The stage
   ================================================================ */

function Stage({ act, reduce }: { act: number; reduce: boolean }) {
  const open = act >= 1;
  const strike = act >= 2;
  const finale = act >= 3;

  return (
    <svg
      viewBox="0 0 420 300"
      className="w-full max-w-[30rem]"
      role="img"
      aria-label="A rod-puppet stage with Durga and her four children"
    >
      <defs>
        <linearGradient id="sari" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={C.sindoor} />
          <stop offset="100%" stopColor={C.alta} />
        </linearGradient>
        <radialGradient id="footlight" cx="50%" cy="100%" r="80%">
          <stop offset="0%" stopColor={C.lamp} stopOpacity="0.5" />
          <stop offset="100%" stopColor={C.lamp} stopOpacity="0" />
        </radialGradient>
        <clipPath id="stageClip">
          <rect x="26" y="26" width="368" height="212" />
        </clipPath>
      </defs>

      {/* ---- bamboo frame ---- */}
      <g stroke={C.wood} strokeWidth="5" strokeLinecap="round" fill="none">
        <line x1="26" y1="18" x2="26" y2="250" />
        <line x1="394" y1="18" x2="394" y2="250" />
        <line x1="18" y1="22" x2="402" y2="22" />
      </g>
      {/* lashing at the joints, the way a pandal frame is tied */}
      {[
        [26, 22],
        [394, 22],
      ].map(([x, y]) => (
        <g key={x} stroke={C.gold} strokeWidth="1.4" opacity="0.8">
          <line x1={x - 7} y1={y - 4} x2={x + 7} y2={y + 4} />
          <line x1={x - 7} y1={y + 4} x2={x + 7} y2={y - 4} />
        </g>
      ))}

      {/* ---- the stage interior ---- */}
      <g clipPath="url(#stageClip)">
        <rect x="26" y="26" width="368" height="212" fill="#160f12" />

        {/* back cloth with an alpona motif */}
        <motion.g
          opacity={open ? 0.5 : 0}
          initial={false}
          animate={{ opacity: open ? 0.5 : 0 }}
          transition={{ duration: 1 }}
        >
          {[70, 140, 210, 280, 350].map((x) => (
            <g key={x} stroke={C.goldDark} strokeWidth="0.7" fill="none">
              <circle cx={x} cy="96" r="17" />
              <circle cx={x} cy="96" r="9" />
              {[0, 45, 90, 135].map((a) => (
                <line
                  key={a}
                  x1={x - 20 * Math.cos((a * Math.PI) / 180)}
                  y1={96 - 20 * Math.sin((a * Math.PI) / 180)}
                  x2={x + 20 * Math.cos((a * Math.PI) / 180)}
                  y2={96 + 20 * Math.sin((a * Math.PI) / 180)}
                />
              ))}
            </g>
          ))}
        </motion.g>

        {/* the boards */}
        <rect x="26" y="228" width="368" height="10" fill={C.wood} />
        <rect x="26" y="228" width="368" height="2" fill={C.gold} opacity="0.5" />
        <ellipse cx="210" cy="238" rx="150" ry="40" fill="url(#footlight)" />

        {/* ---- the family, on rods ---- */}
        <AnimatePresence>
          {open && (
            <g key="family">
              <Puppet
                x={78}
                y={186}
                scale={0.62}
                delay={0.5}
                kind="ganesh"
                reduce={reduce}
                dance={finale}
              />
              <Puppet
                x={140}
                y={190}
                scale={0.7}
                delay={0.32}
                kind="lakshmi"
                reduce={reduce}
                dance={finale}
              />
              <Puppet
                x={280}
                y={190}
                scale={0.7}
                delay={0.4}
                kind="saraswati"
                reduce={reduce}
                dance={finale}
              />
              <Puppet
                x={342}
                y={186}
                scale={0.62}
                delay={0.58}
                kind="kartik"
                reduce={reduce}
                dance={finale}
              />
              <Durga
                x={210}
                y={196}
                delay={0.12}
                strike={strike}
                reduce={reduce}
                dance={finale}
              />
            </g>
          )}
        </AnimatePresence>

        {/* ---- the asura ---- */}
        <AnimatePresence>
          {act === 2 && <Asura key="asura" reduce={reduce} />}
        </AnimatePresence>

        {/* ---- the banner ---- */}
        <AnimatePresence>
          {finale && (
            <motion.g
              key="banner"
              initial={{ y: -90, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.85, ease: SPRING }}
            >
              <rect x="96" y="40" width="228" height="46" fill={C.sindoor} />
              <rect x="96" y="40" width="228" height="3" fill={C.gold} />
              <rect x="96" y="83" width="228" height="3" fill={C.gold} />
              <text
                x="210"
                y="71"
                textAnchor="middle"
                className="bangla-poster"
                fontSize="25"
                fill={C.cream}
              >
                শারদীয়া দুর্গোৎসব
              </text>
              {/* the cords it hangs from */}
              <line x1="120" y1="22" x2="120" y2="40" stroke={C.gold} strokeWidth="1" />
              <line x1="300" y1="22" x2="300" y2="40" stroke={C.gold} strokeWidth="1" />
            </motion.g>
          )}
        </AnimatePresence>

        {/* ---- curtains ---- */}
        <Curtain side="left" open={open} />
        <Curtain side="right" open={open} />
      </g>

      {/* ---- footlights: little earthen lamps along the lip ---- */}
      {[56, 108, 160, 212, 264, 316, 368].map((x, i) => (
        <Lamp key={x} x={x} delay={i * 0.09} reduce={reduce} />
      ))}
    </svg>
  );
}

function Curtain({ side, open }: { side: "left" | "right"; open: boolean }) {
  const isLeft = side === "left";
  const width = 186;
  const x = isLeft ? 26 : 208;

  return (
    <motion.g
      initial={false}
      animate={{ x: open ? (isLeft ? -width : width) : 0 }}
      transition={{ duration: 1.15, ease: EASE }}
    >
      <rect x={x} y="26" width={width} height="212" fill={C.alta} />
      {/* folds */}
      {Array.from({ length: 7 }).map((_, i) => (
        <rect
          key={i}
          x={x + 6 + i * 26}
          y="26"
          width="11"
          height="212"
          fill="#000"
          opacity="0.16"
        />
      ))}
      {/* a gold hem, and the scallop a pandal curtain always has */}
      <rect x={x} y="26" width={width} height="5" fill={C.gold} />
      <g fill={C.gold} opacity="0.85">
        {Array.from({ length: 8 }).map((_, i) => (
          <circle key={i} cx={x + 12 + i * 24} cy="42" r="4.5" />
        ))}
      </g>
    </motion.g>
  );
}

function Lamp({
  x,
  delay,
  reduce,
}: {
  x: number;
  delay: number;
  reduce: boolean;
}) {
  return (
    <g>
      <path
        d={`M${x - 7},244 Q${x},252 ${x + 7},244 Z`}
        fill={C.wood}
        stroke={C.goldDark}
        strokeWidth="0.6"
      />
      <motion.ellipse
        cx={x}
        cy="241"
        rx="3"
        ry="5"
        fill={C.lamp}
        initial={{ opacity: 0, scaleY: 0.2 }}
        animate={
          reduce
            ? { opacity: 1, scaleY: 1 }
            : { opacity: [0, 1, 0.82, 1], scaleY: [0.2, 1, 0.9, 1] }
        }
        transition={{
          duration: reduce ? 0.3 : 2.2,
          delay,
          repeat: reduce ? 0 : Infinity,
          repeatType: "mirror",
        }}
        style={{ transformBox: "fill-box", transformOrigin: "50% 100%" }}
      />
      <motion.circle
        cx={x}
        cy="240"
        r="9"
        fill={C.lamp}
        opacity="0.16"
        animate={reduce ? undefined : { opacity: [0.1, 0.22, 0.1] }}
        transition={{ duration: 2.4, delay, repeat: Infinity }}
      />
    </g>
  );
}

/* ================================================================
   Puppets
   ================================================================ */

type Kind = "lakshmi" | "saraswati" | "kartik" | "ganesh";

const KINDS: Record<
  Kind,
  { skin: string; robe: string; accent: string; bangla: string }
> = {
  lakshmi: { skin: C.skinFair, robe: C.sindoor, accent: C.gold, bangla: "লক্ষ্মী" },
  saraswati: { skin: C.skinFair, robe: C.cream, accent: C.blue, bangla: "সরস্বতী" },
  kartik: { skin: C.skinFair, robe: C.blue, accent: C.green, bangla: "কার্তিক" },
  ganesh: { skin: C.skinPink, robe: C.green, accent: C.gold, bangla: "গণেশ" },
};

/** Big eyes, one highlight, and a blink on a loop. Cel shading, no gradients. */
function Eyes({
  cx,
  cy,
  gap = 5.4,
  r = 3.1,
  reduce,
  delay = 0,
}: {
  cx: number;
  cy: number;
  gap?: number;
  r?: number;
  reduce: boolean;
  delay?: number;
}) {
  return (
    <g>
      {[-gap, gap].map((dx) => (
        <motion.g
          key={dx}
          animate={reduce ? undefined : { scaleY: [1, 1, 0.12, 1] }}
          transition={{
            duration: 3.6,
            times: [0, 0.82, 0.87, 0.92],
            repeat: Infinity,
            delay: delay + (dx > 0 ? 0.02 : 0),
          }}
          style={{ transformBox: "fill-box", transformOrigin: "50% 50%" }}
        >
          <ellipse cx={cx + dx} cy={cy} rx={r} ry={r * 1.2} fill="#fff" />
          <ellipse cx={cx + dx} cy={cy + 0.3} rx={r * 0.62} ry={r * 0.8} fill={C.hair} />
          <circle cx={cx + dx - r * 0.28} cy={cy - r * 0.42} r={r * 0.28} fill="#fff" />
        </motion.g>
      ))}
      {/* kohl line, the way a pratima's eyes are drawn */}
      <path
        d={`M${cx - gap - r - 0.8},${cy - r * 0.9} q${r},-1.4 ${r * 1.9},0`}
        stroke={C.hair}
        strokeWidth="0.7"
        fill="none"
      />
      <path
        d={`M${cx + gap - r + 0.8},${cy - r * 0.9} q${r},-1.4 ${r * 1.9},0`}
        stroke={C.hair}
        strokeWidth="0.7"
        fill="none"
      />
    </g>
  );
}

/** The control rod, drawn from above the stage down to the puppet's head. */
function Rod({ height = 170 }: { height?: number }) {
  return (
    <g>
      <line
        x1="0"
        y1={-height}
        x2="0"
        y2="-34"
        stroke={C.wood}
        strokeWidth="1.6"
        opacity="0.75"
      />
      <circle cx="0" cy="-34" r="1.8" fill={C.gold} opacity="0.9" />
    </g>
  );
}

/** A jointed arm: rotates about its own shoulder, with a visible pin. */
function Arm({
  x,
  y,
  length = 16,
  angle,
  swing,
  colour,
  reduce,
  delay = 0,
  width = 3.4,
}: {
  x: number;
  y: number;
  length?: number;
  angle: number;
  swing?: number[];
  colour: string;
  reduce: boolean;
  delay?: number;
  width?: number;
}) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <motion.g
        initial={{ rotate: angle }}
        animate={reduce || !swing ? { rotate: angle } : { rotate: swing }}
        transition={
          reduce || !swing
            ? { duration: 0 }
            : { duration: 2.8, repeat: Infinity, repeatType: "mirror", delay }
        }
        style={{ transformOrigin: "0px 0px" }}
      >
        <rect
          x={-width / 2}
          y="0"
          width={width}
          height={length}
          rx={width / 2}
          fill={colour}
        />
        <circle cx="0" cy={length} r={width * 0.55} fill={colour} />
      </motion.g>
      {/* the joint pin */}
      <circle cx="0" cy="0" r="1.5" fill={C.wood} stroke={C.gold} strokeWidth="0.5" />
    </g>
  );
}

function Puppet({
  x,
  y,
  scale,
  delay,
  kind,
  reduce,
  dance,
}: {
  x: number;
  y: number;
  scale: number;
  delay: number;
  kind: Kind;
  reduce: boolean;
  dance: boolean;
}) {
  const k = KINDS[kind];
  const bob = dance ? [0, -5, 0] : [0, -2.2, 0];

  return (
    <motion.g
      initial={{ y: -150, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.9, delay, ease: SPRING }}
    >
      <motion.g
        transform={`translate(${x} ${y}) scale(${scale})`}
        animate={reduce ? undefined : { y: bob }}
        transition={{
          duration: dance ? 0.62 : 2.6,
          repeat: Infinity,
          repeatType: "mirror",
          delay,
          ease: "easeInOut",
        }}
      >
        <Rod />

        {/* skirt */}
        <path d="M-15,42 L15,42 L11,0 L-11,0 Z" fill={k.robe} />
        <path d="M-15,42 L-4,42 L-6,0 L-11,0 Z" fill="#000" opacity="0.12" />
        <rect x="-15" y="38" width="30" height="4" fill={k.accent} />

        {/* torso */}
        <path d="M-9,2 L9,2 L7,-18 L-7,-18 Z" fill={k.robe} />
        <rect x="-8" y="-19" width="16" height="3" fill={k.accent} />

        {/* arms */}
        <Arm
          x={-8}
          y={-15}
          angle={38}
          swing={[30, 48]}
          colour={k.skin}
          reduce={reduce}
          delay={delay}
        />
        <Arm
          x={8}
          y={-15}
          angle={-38}
          swing={[-48, -30]}
          colour={k.skin}
          reduce={reduce}
          delay={delay + 0.3}
        />

        {/* head */}
        {kind === "ganesh" ? (
          <GaneshHead reduce={reduce} delay={delay} />
        ) : (
          <g>
            <circle cx="0" cy="-30" r="11.5" fill={k.skin} />
            {/* hair */}
            <path
              d="M-11.5,-31 a11.5,11.5 0 0 1 23,0 q-4,-7 -11.5,-7 q-7.5,0 -11.5,7 Z"
              fill={C.hair}
            />
            {kind !== "kartik" && (
              <path
                d="M-11,-28 q-4,10 -1,17 q3,-9 2,-17 Z M11,-28 q4,10 1,17 q-3,-9 -2,-17 Z"
                fill={C.hair}
              />
            )}
            <Eyes cx={0} cy={-29} reduce={reduce} delay={delay} />
            <path
              d="M-3,-23.5 q3,2.6 6,0"
              stroke={C.alta}
              strokeWidth="0.9"
              fill="none"
              strokeLinecap="round"
            />
            {/* sindoor tika */}
            <circle cx="0" cy="-37" r="1.5" fill={C.sindoor} />
            {/* crown */}
            <path
              d="M-9,-39 L-6,-49 L-3,-42 L0,-53 L3,-42 L6,-49 L9,-39 Z"
              fill={C.gold}
            />
          </g>
        )}

        {/* what each one carries */}
        {kind === "saraswati" && (
          <g transform="translate(15 -12) rotate(18)">
            <rect x="-1.2" y="-18" width="2.4" height="34" rx="1.2" fill={C.wood} />
            <ellipse cx="0" cy="17" rx="6" ry="7.5" fill={C.wood} />
            <ellipse cx="0" cy="17" rx="2" ry="2.4" fill={C.night} />
          </g>
        )}
        {kind === "kartik" && (
          <g transform="translate(-16 -10)">
            <path
              d="M0,-16 q9,16 0,32"
              stroke={C.gold}
              strokeWidth="1.6"
              fill="none"
            />
            <line x1="0" y1="-16" x2="0" y2="16" stroke={C.cream} strokeWidth="0.7" />
          </g>
        )}
        {kind === "lakshmi" && (
          <g transform="translate(15 -8)">
            <ellipse cx="0" cy="0" rx="5" ry="6" fill={C.gold} />
            <ellipse cx="0" cy="-1" rx="2.6" ry="3" fill={C.goldDark} />
          </g>
        )}

        {/* the vahana, small at the feet */}
        <Vahana kind={kind} reduce={reduce} />

        {/* name, in the puppeteer's hand-lettered way */}
        <text
          y="56"
          textAnchor="middle"
          className="bangla-display"
          fontSize="11"
          fill={C.gold}
          opacity="0.75"
        >
          {k.bangla}
        </text>
      </motion.g>
    </motion.g>
  );
}

function GaneshHead({ reduce, delay }: { reduce: boolean; delay: number }) {
  return (
    <g>
      <circle cx="0" cy="-30" r="12" fill={C.skinPink} />
      {/* ears */}
      <ellipse cx="-13" cy="-31" rx="6" ry="9" fill={C.skinPink} />
      <ellipse cx="13" cy="-31" rx="6" ry="9" fill={C.skinPink} />
      <ellipse cx="-13" cy="-31" rx="3.4" ry="5.6" fill={C.alta} opacity="0.35" />
      <ellipse cx="13" cy="-31" rx="3.4" ry="5.6" fill={C.alta} opacity="0.35" />
      {/* trunk, curling and swaying */}
      <motion.path
        d="M0,-26 q-1.5,9 -5,13 q-4,4 -1,7"
        stroke={C.skinPink}
        strokeWidth="4.4"
        strokeLinecap="round"
        fill="none"
        animate={reduce ? undefined : { rotate: [-4, 4, -4] }}
        transition={{ duration: 3, repeat: Infinity, delay }}
        style={{ transformBox: "fill-box", transformOrigin: "50% 0%" }}
      />
      {/* tusks */}
      <path d="M-6,-22 l-3,4" stroke={C.cream} strokeWidth="1.8" strokeLinecap="round" />
      <path d="M6,-22 l3,4" stroke={C.cream} strokeWidth="1.8" strokeLinecap="round" />
      <Eyes cx={0} cy={-31} gap={6} r={2.7} reduce={reduce} delay={delay} />
      <circle cx="0" cy="-39" r="1.4" fill={C.sindoor} />
      <path d="M-8,-40 L-5,-48 L-2,-42 L0,-51 L2,-42 L5,-48 L8,-40 Z" fill={C.gold} />
    </g>
  );
}

function Vahana({ kind, reduce }: { kind: Kind; reduce: boolean }) {
  const common = { opacity: 0.95 };
  if (kind === "lakshmi")
    return (
      <g transform="translate(-17 36)" {...common}>
        <ellipse cx="0" cy="0" rx="6" ry="5" fill="#b08a55" />
        <circle cx="0" cy="-4" r="4.4" fill="#c9a06a" />
        <circle cx="-1.6" cy="-4.6" r="1.1" fill={C.hair} />
        <circle cx="1.6" cy="-4.6" r="1.1" fill={C.hair} />
        <path d="M-1,-2.6 L1,-2.6 L0,-1 Z" fill={C.gold} />
      </g>
    );
  if (kind === "saraswati")
    return (
      <g transform="translate(-18 36)" {...common}>
        <ellipse cx="0" cy="0" rx="7" ry="4.4" fill={C.cream} />
        <path d="M2,-3 q4,-6 -1,-8 q-4,-1 -2,3 q1,3 1,5 Z" fill={C.cream} />
        <circle cx="-0.6" cy="-9.4" r="0.9" fill={C.hair} />
        <path d="M-2.4,-9.6 l-2.6,1.2 l2.6,1.2 Z" fill={C.lamp} />
      </g>
    );
  if (kind === "kartik")
    return (
      <g transform="translate(16 34)" {...common}>
        <ellipse cx="0" cy="2" rx="6" ry="4" fill={C.blue} />
        <path d="M4,0 q10,-4 12,-14 q-2,12 -10,17 Z" fill={C.green} />
        <circle cx="-3" cy="-3" r="3.4" fill={C.blue} />
        <path d="M-3,-7 l0,-3" stroke={C.green} strokeWidth="1" />
        <circle cx="-4.2" cy="-3.4" r="0.8" fill={C.cream} />
      </g>
    );
  return (
    <g transform="translate(16 38)" {...common}>
      <ellipse cx="0" cy="0" rx="6" ry="3.6" fill="#8a7a6a" />
      <circle cx="-5" cy="-1.6" r="2.8" fill="#8a7a6a" />
      <circle cx="-6" cy="-3.6" r="1.6" fill="#a4948a" />
      <motion.path
        d="M6,0 q7,1 8,-5"
        stroke="#8a7a6a"
        strokeWidth="1.2"
        fill="none"
        animate={reduce ? undefined : { rotate: [-8, 8, -8] }}
        transition={{ duration: 2.2, repeat: Infinity }}
        style={{ transformBox: "fill-box", transformOrigin: "0% 100%" }}
      />
      <circle cx="-6.4" cy="-1.8" r="0.8" fill={C.hair} />
    </g>
  );
}

/* ---------------- Durga herself ---------------- */

function Durga({
  x,
  y,
  delay,
  strike,
  reduce,
  dance,
}: {
  x: number;
  y: number;
  delay: number;
  strike: boolean;
  reduce: boolean;
  dance: boolean;
}) {
  /* ten arms, fanned, the trishul arm last on the right */
  const leftArms = [22, 42, 62, 82, 102];
  const rightArms = [-22, -42, -62, -82, -102];

  return (
    <motion.g
      initial={{ y: -180, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 1, delay, ease: SPRING }}
    >
      <motion.g
        transform={`translate(${x} ${y}) scale(0.95)`}
        animate={reduce ? undefined : { y: dance ? [0, -6, 0] : [0, -2.6, 0] }}
        transition={{
          duration: dance ? 0.62 : 2.8,
          repeat: Infinity,
          repeatType: "mirror",
          ease: "easeInOut",
        }}
      >
        <Rod height={190} />

        {/* halo */}
        <motion.g
          animate={reduce ? undefined : { rotate: 360 }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: "0px -34px" }}
        >
          <circle
            cx="0"
            cy="-34"
            r="34"
            fill="none"
            stroke={C.gold}
            strokeWidth="0.8"
            strokeDasharray="2 6"
            opacity="0.6"
          />
        </motion.g>

        {/* the ten arms, behind the body */}
        {[...leftArms, ...rightArms].map((a, i) => (
          <Arm
            key={a}
            x={a > 0 ? -9 : 9}
            y={-18}
            length={19}
            angle={a}
            swing={reduce ? undefined : [a - 5, a + 5]}
            colour={C.skinDurga}
            reduce={reduce}
            delay={i * 0.07}
            width={3}
          />
        ))}

        {/* trishul, in the topmost right hand */}
        <motion.g
          transform="translate(9 -18)"
          initial={{ rotate: -102 }}
          animate={
            strike && !reduce
              ? { rotate: [-102, -150, -30, -102] }
              : { rotate: -102 }
          }
          transition={{ duration: 0.9, times: [0, 0.3, 0.52, 1], ease: EASE }}
          style={{ transformOrigin: "0px 0px" }}
        >
          <line x1="0" y1="0" x2="0" y2="34" stroke={C.wood} strokeWidth="1.8" />
          <path
            d="M-4,34 L-4,42 M0,34 L0,45 M4,34 L4,42"
            stroke={C.gold}
            strokeWidth="1.6"
            fill="none"
            strokeLinecap="round"
          />
          <line x1="-5" y1="34" x2="5" y2="34" stroke={C.gold} strokeWidth="1.4" />
        </motion.g>

        {/* skirt and torso */}
        <path d="M-18,48 L18,48 L13,0 L-13,0 Z" fill="url(#sari)" />
        <path d="M-18,48 L-5,48 L-7,0 L-13,0 Z" fill="#000" opacity="0.12" />
        <rect x="-18" y="43" width="36" height="5" fill={C.gold} />
        <path d="M-11,2 L11,2 L9,-20 L-9,-20 Z" fill="url(#sari)" />
        <rect x="-10" y="-21" width="20" height="3.4" fill={C.gold} />

        {/* head */}
        <circle cx="0" cy="-34" r="13" fill={C.skinDurga} />
        <path
          d="M-13,-35 a13,13 0 0 1 26,0 q-5,-8 -13,-8 q-8,0 -13,8 Z"
          fill={C.hair}
        />
        <path
          d="M-12.5,-32 q-5,12 -1,20 q3,-10 2.5,-20 Z M12.5,-32 q5,12 1,20 q-3,-10 -2.5,-20 Z"
          fill={C.hair}
        />
        <Eyes cx={0} cy={-33} gap={6} r={3.4} reduce={reduce} />
        {/* the third eye */}
        <motion.ellipse
          cx="0"
          cy="-40"
          rx="1.5"
          ry="3"
          fill={C.sindoor}
          animate={reduce ? undefined : { opacity: [0.65, 1, 0.65] }}
          transition={{ duration: 1.6, repeat: Infinity }}
        />
        <path
          d="M-3.4,-27 q3.4,3 6.8,0"
          stroke={C.alta}
          strokeWidth="1"
          fill="none"
          strokeLinecap="round"
        />
        {/* mukut */}
        <path
          d="M-11,-44 L-7,-57 L-3.5,-48 L0,-62 L3.5,-48 L7,-57 L11,-44 Z"
          fill={C.gold}
        />
        <circle cx="0" cy="-62" r="2" fill={C.sindoor} />

        {/* the lion, small and cross at her feet */}
        <g transform="translate(-26 40)">
          <ellipse cx="0" cy="0" rx="11" ry="6.4" fill="#c68a3c" />
          <circle cx="-9" cy="-3" r="6.6" fill={C.gold} />
          <circle cx="-9" cy="-3" r="3.8" fill="#c68a3c" />
          <circle cx="-10.6" cy="-3.6" r="0.9" fill={C.hair} />
          <circle cx="-7.4" cy="-3.6" r="0.9" fill={C.hair} />
          <path d="M-10,-1.6 L-8,-1.6 L-9,-0.4 Z" fill={C.alta} />
        </g>

        <text
          y="62"
          textAnchor="middle"
          className="bangla-display"
          fontSize="13"
          fill={C.lamp}
        >
          দুর্গা
        </text>
      </motion.g>
    </motion.g>
  );
}

/* ---------------- the asura ---------------- */

function Asura({ reduce }: { reduce: boolean }) {
  const shards = Array.from({ length: 16 }, (_, i) => {
    const a = (i / 16) * Math.PI * 2;
    return { x: Math.cos(a) * (26 + (i % 4) * 8), y: Math.sin(a) * 16 };
  });

  return (
    <motion.g
      initial={{ y: 70, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.55, ease: EASE }}
    >
      <motion.g
        transform="translate(252 208)"
        animate={
          reduce
            ? undefined
            : { rotate: [0, 0, 74], y: [0, 0, 26], opacity: [1, 1, 0] }
        }
        transition={{ duration: 1.5, times: [0, 0.55, 1], ease: EASE, delay: 0.5 }}
        style={{ transformOrigin: "0px 18px" }}
      >
        <Rod height={150} />
        {/* body */}
        <path d="M-11,18 L11,18 L8,-8 L-8,-8 Z" fill={C.asura} />
        {/* buffalo head */}
        <ellipse cx="0" cy="-16" rx="9.5" ry="8" fill="#3a322c" />
        <path
          d="M-9,-20 q-9,-3 -11,-11 q7,1 11,6 Z M9,-20 q9,-3 11,-11 q-7,1 -11,6 Z"
          fill="#d8cfc2"
        />
        <ellipse cx="-3.4" cy="-15" rx="1.7" ry="2" fill={C.sindoor} />
        <ellipse cx="3.4" cy="-15" rx="1.7" ry="2" fill={C.sindoor} />
        <path d="M-3,-10 q3,2 6,0" stroke="#d8cfc2" strokeWidth="0.9" fill="none" />
        <circle cx="0" cy="18" r="1.6" fill={C.wood} />
      </motion.g>

      {/* the strike: speed lines, then a flash and shards */}
      {!reduce && (
        <>
          {[0, 1, 2, 3].map((i) => (
            <motion.line
              key={i}
              x1={236 + i * 9}
              y1={120}
              x2={236 + i * 9}
              y2={186}
              stroke={C.cream}
              strokeWidth="1.4"
              initial={{ opacity: 0, pathLength: 0 }}
              animate={{ opacity: [0, 0.85, 0], pathLength: [0, 1, 1] }}
              transition={{ duration: 0.4, delay: 0.42 + i * 0.03 }}
            />
          ))}
          <motion.circle
            cx="252"
            cy="196"
            r="6"
            fill="none"
            stroke={C.cream}
            strokeWidth="2.4"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 6], opacity: [0, 0.9, 0] }}
            transition={{ duration: 0.6, delay: 0.55, ease: "easeOut" }}
            style={{ transformBox: "fill-box", transformOrigin: "50% 50%" }}
          />
          {shards.map((s, i) => (
            <motion.circle
              key={i}
              cx="252"
              cy="196"
              r={i % 3 === 0 ? 2.2 : 1.4}
              fill={i % 2 === 0 ? C.lamp : C.sindoor}
              initial={{ opacity: 0, x: 0, y: 0 }}
              animate={{ opacity: [0, 1, 0], x: s.x, y: s.y }}
              transition={{ duration: 0.85, delay: 0.56, ease: "easeOut" }}
            />
          ))}
        </>
      )}
    </motion.g>
  );
}

/* ================================================================
   Words
   ================================================================ */

function Caption({ index }: { index: number }) {
  const line = ARRIVAL_LINES[index % ARRIVAL_LINES.length];
  return (
    <>
      <p
        className="bangla-display text-[1.15rem] sm:text-[1.35rem]"
        style={{ color: C.cream }}
      >
        {line.bn}
      </p>
      <p
        className="mt-1.5 text-[0.68rem] italic"
        style={{ color: "rgba(246,234,210,0.45)" }}
      >
        {line.en}
      </p>
    </>
  );
}

function Ticker({ facts, act }: { facts: typeof FACTS; act: number }) {
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
          className="text-[0.7rem] leading-relaxed"
          style={{ color: "rgba(246,234,210,0.6)" }}
        >
          <span style={{ color: C.lamp }}>
            {f.year ? `${f.year} — ` : ""}
            {f.title}.{" "}
          </span>
          {f.fact}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}
