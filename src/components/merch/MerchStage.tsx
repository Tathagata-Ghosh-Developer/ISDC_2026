"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/lib/browser";

// three.js is a few hundred kilobytes; it loads only once a stage is
// on screen, and never on the server.
const ShirtViewer = dynamic(() => import("./ShirtViewer"), { ssr: false });

/* ================================================================
   The stage the shirt floats on: an October sky over a bank of kash.

   Kash is the tall grass whose white plumes cover the riverbanks of
   Bengal in autumn, the first sign that the Puja is coming. It is
   drawn here, not photographed: each stalk is a stem and a plume
   built from a seeded random walk, so the server and the browser
   draw the same field and nothing jumps at hydration.
   ================================================================ */

function rng(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Stalk = { stem: string; plume: string; blades: string; delay: number; dur: number; sway: number };

/** A field of stalks on a 1000 by 320 box, the ground at the bottom. */
function field(seed: number, count: number, tall: [number, number], spread: number): Stalk[] {
  const r = rng(seed);
  const f = (n: number) => n.toFixed(1);
  return Array.from({ length: count }, (_, i) => {
    const x0 = (i + 0.2 + r() * 0.6) * (1000 / count);
    const h = tall[0] + r() * (tall[1] - tall[0]);
    const lean = (r() - 0.5) * 0.5;
    const x1 = x0 + lean * h;
    const y1 = 320 - h;
    const cx = x0 + lean * h * 0.3;
    const cy = 320 - h * 0.55;
    const at = (t: number) => {
      const u = 1 - t;
      return [u * u * x0 + 2 * u * t * cx + t * t * x1, u * u * 330 + 2 * u * t * cy + t * t * y1];
    };
    let plume = "";
    const strands = 26;
    for (let k = 0; k < strands; k++) {
      const t = 0.6 + (0.4 * k) / strands;
      const [px, py] = at(t);
      const [qx, qy] = at(Math.min(1, t + 0.01));
      const tx = qx - px;
      const ty = qy - py;
      const tl = Math.hypot(tx, ty) || 1;
      const nx = -ty / tl;
      const ny = tx / tl;
      const len = spread * Math.sin(Math.PI * ((t - 0.6) / 0.4) * 0.9 + 0.15) * (0.7 + r() * 0.5);
      for (const side of [-1, 1]) {
        const dx = (nx * side * 0.9 + (tx / tl) * 0.55) * len;
        const dy = (ny * side * 0.9 + (ty / tl) * 0.55) * len;
        const droop = len * 0.35;
        plume += `M${f(px)} ${f(py)}q${f(dx * 0.5)} ${f(dy * 0.5 - droop * 0.2)} ${f(dx)} ${f(dy + droop)}`;
      }
    }
    let blades = "";
    for (let b = 0; b < 3; b++) {
      const bh = h * (0.25 + r() * 0.3);
      const bl = (r() - 0.5) * 70;
      blades += `M${f(x0)} 330Q${f(x0 + bl * 0.3)} ${f(330 - bh * 0.6)} ${f(x0 + bl)} ${f(330 - bh)}`;
    }
    return {
      stem: `M${f(x0)} 330Q${f(cx)} ${f(cy)} ${f(x1)} ${f(y1)}`,
      plume,
      blades,
      delay: -r() * 6,
      dur: 4.5 + r() * 3.5,
      sway: 1.6 + r() * 2.4,
    };
  });
}

const BACK = field(11, 34, [110, 190], 13);
const FRONT = field(29, 16, [170, 290], 19);

function Kash({ stalks, front }: { stalks: Stalk[]; front: boolean }) {
  return (
    <svg
      viewBox="0 0 1000 330"
      preserveAspectRatio="xMidYMax slice"
      className={`pointer-events-none absolute inset-x-0 bottom-0 w-full ${front ? "h-[22%]" : "h-[30%] opacity-80"}`}
      aria-hidden
    >
      {stalks.map((s, i) => (
        <g
          key={i}
          className="kash-stalk"
          style={{
            animationDuration: `${s.dur}s`,
            animationDelay: `${s.delay}s`,
            ["--sway" as string]: `${s.sway}deg`,
          }}
        >
          <path d={s.blades} fill="none" stroke={front ? "#6f8f55" : "#9db596"} strokeWidth={front ? 2.2 : 1.6} strokeLinecap="round" />
          <path d={s.stem} fill="none" stroke={front ? "#c2b07f" : "#c9c7ae"} strokeWidth={front ? 2 : 1.4} strokeLinecap="round" />
          <path d={s.plume} fill="none" stroke="#ffffff" strokeOpacity={front ? 0.9 : 0.75} strokeWidth={front ? 1.3 : 1} strokeLinecap="round" />
        </g>
      ))}
    </svg>
  );
}

const CLOUDS = [
  { top: "9%", left: "-6%", w: 34, dur: 95, delay: -20 },
  { top: "22%", left: "58%", w: 26, dur: 120, delay: -60 },
  { top: "4%", left: "70%", w: 20, dur: 80, delay: -5 },
  { top: "36%", left: "8%", w: 18, dur: 140, delay: -90 },
];

/**
 * The sky, the kash and the shirt. `eager` loads the 3D at once (the
 * popup); otherwise it waits until the stage scrolls into view.
 */
export default function MerchStage({
  eager = false,
  className = "",
}: {
  eager?: boolean;
  className?: string;
}) {
  const box = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const [near, setNear] = useState(eager);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (near || !box.current) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setNear(true);
          io.disconnect();
        }
      },
      { rootMargin: "200px" },
    );
    io.observe(box.current);
    return () => io.disconnect();
  }, [near]);

  return (
    <div
      ref={box}
      className={`merch-sky relative isolate overflow-hidden ${className}`}
      style={{
        background:
          "radial-gradient(ellipse 60% 45% at 78% 12%, rgba(255,250,225,0.85), transparent 60%), linear-gradient(180deg, #3d8ad6 0%, #6fb1ec 38%, #b9dcf8 72%, #eaf5fd 100%)",
      }}
    >
      {CLOUDS.map((c, i) => (
        <span
          key={i}
          className="merch-cloud pointer-events-none absolute block rounded-full"
          style={{
            top: c.top,
            left: c.left,
            width: `${c.w}%`,
            aspectRatio: "3 / 1",
            animationDuration: `${c.dur}s`,
            animationDelay: `${c.delay}s`,
          }}
          aria-hidden
        />
      ))}

      <Kash stalks={BACK} front={false} />

      {/* The flat mockup holds the place until the 3D is ready, at the
          same size, so the swap reads as the shirt coming to life. */}
      <div
        className={`pointer-events-none absolute inset-0 grid place-items-center transition-opacity duration-700 ${
          ready && !failed ? "opacity-0" : "opacity-100"
        }`}
      >
        <div className="relative h-[72%] w-[72%]">
          <Image
            src="/media/merch/flat-front.webp"
            alt="The official IISc Sharodiya Durgotsab T-shirt, front"
            fill
            sizes="(max-width: 1024px) 80vw, 560px"
            className="object-contain drop-shadow-[0_18px_24px_rgba(20,50,90,0.35)]"
            priority={eager}
          />
        </div>
      </div>

      {near && !failed && (
        <div className={`absolute inset-0 transition-opacity duration-700 ${ready ? "opacity-100" : "opacity-0"}`}>
          <ShirtViewer still={reduce} onReady={() => setReady(true)} onFail={() => setFailed(true)} />
        </div>
      )}

      <Kash stalks={FRONT} front />

      {ready && !failed && (
        <p className="pointer-events-none absolute bottom-3 right-4 rounded-full bg-black/25 px-3 py-1 text-[0.62rem] uppercase tracking-[0.2em] text-white backdrop-blur-sm">
          Drag to turn
        </p>
      )}
    </div>
  );
}
