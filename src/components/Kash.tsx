"use client";

import { useEffect, useState } from "react";

type Petal = {
  left: number;
  delay: number;
  duration: number;
  scale: number;
  drift: number;
  hue: number;
};

/**
 * Kash phool and shiuli drifting up through the hero, autumn in Bengal,
 * the signal that Ma is on her way. Pure CSS transforms, so it stays
 * on the compositor and never touches layout.
 */
export default function Kash({ count = 18 }: { count?: number }) {
  const [petals, setPetals] = useState<Petal[]>([]);

  /**
   * Random values, on the client only, once.
   *
   * Two React rules meet here and only one of them can be satisfied.
   * Deriving the petals during render calls Math.random() during
   * render, which is impure and would disagree with the server at
   * hydration. Generating them in an effect sets state once on mount,
   * which renders an empty sky for one frame. The empty frame is
   * invisible and a hydration mismatch is not, so the effect stays and
   * the rule is silenced here deliberately rather than worked around.
   */
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const small = window.matchMedia("(max-width: 640px)").matches;
    const n = small ? Math.round(count * 0.55) : count;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPetals(
      Array.from({ length: n }, () => ({
        left: Math.random() * 100,
        delay: -Math.random() * 26,
        duration: 22 + Math.random() * 20,
        scale: 0.5 + Math.random() * 0.9,
        drift: (Math.random() - 0.5) * 16,
        hue: Math.random(),
      })),
    );
  }, [count]);

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden
    >
      {petals.map((p, i) => (
        <span
          key={i}
          className="absolute bottom-0 block"
          style={{
            left: `${p.left}%`,
            ["--dx" as string]: `${p.drift}vw`,
            animation: `drift-up ${p.duration}s linear ${p.delay}s infinite`,
            willChange: "transform, opacity",
          }}
        >
          <svg
            width={14 * p.scale}
            height={14 * p.scale}
            viewBox="0 0 14 14"
            fill="none"
          >
            {/* shiuli: white petals, saffron stem */}
            <g opacity={p.hue > 0.35 ? 0.9 : 0.55}>
              {[0, 72, 144, 216, 288].map((a) => (
                <ellipse
                  key={a}
                  cx="7"
                  cy="4"
                  rx="1.7"
                  ry="3"
                  transform={`rotate(${a} 7 7)`}
                  fill={p.hue > 0.35 ? "#fbf3e4" : "#f0dcc0"}
                />
              ))}
              <circle cx="7" cy="7" r="1.5" fill="#e08a2c" />
            </g>
          </svg>
        </span>
      ))}
    </div>
  );
}
