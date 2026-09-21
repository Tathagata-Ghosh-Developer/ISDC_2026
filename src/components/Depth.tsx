"use client";

import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { useRef, type ReactNode } from "react";

/* ================================================================
   Depth.

   Three primitives, used sparingly. The rule they all obey: motion
   here is a response to something the reader is already doing, never
   a performance staged at them. Scrolling moves the planes because
   scrolling moves your head. The pointer tilts a card because your
   hand is on it.

   Every one of them switches itself off entirely when the reader has
   asked for reduced motion. Not damped, off. Somebody who sets that
   flag is often telling you that this kind of thing makes them ill.

   None of them animate layout properties. Transforms and opacity
   only, so the compositor does the work and the main thread stays
   free for the audio scheduler, which is the one thing on this site
   that genuinely cannot afford to be interrupted.
   ================================================================ */

const SPRING = { stiffness: 120, damping: 24, mass: 0.6 } as const;

/**
 * Moves a block against the scroll, so the things behind it travel
 * slower than the things in front. `depth` is how far, in pixels of
 * travel across the whole time the block is on screen.
 */
export function Parallax({
  children,
  depth = 60,
  className,
}: {
  children: ReactNode;
  depth?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const raw = useTransform(scrollYProgress, [0, 1], [depth, -depth]);
  const y = useSpring(raw, SPRING);

  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div ref={ref} className={className}>
      <motion.div style={{ y }} className="will-change-transform">
        {children}
      </motion.div>
    </div>
  );
}

/**
 * A card that turns very slightly towards the pointer.
 *
 * The maximum is six degrees. Anything more and it stops reading as a
 * card on a table and starts reading as a toy, which is the failure
 * mode of every tilt effect on the internet.
 */
export function Tilt({
  children,
  className,
  max = 6,
  glare = true,
}: {
  children: ReactNode;
  className?: string;
  max?: number;
  glare?: boolean;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);

  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const active = useMotionValue(0);

  const rx = useSpring(useTransform(py, [0, 1], [max, -max]), SPRING);
  const ry = useSpring(useTransform(px, [0, 1], [-max, max]), SPRING);
  const lift = useSpring(useTransform(active, [0, 1], [0, -6]), SPRING);

  const gx = useTransform(px, (v) => `${v * 100}%`);
  const gy = useTransform(py, (v) => `${v * 100}%`);
  const gOpacity = useSpring(useTransform(active, [0, 1], [0, 0.16]), SPRING);
  const gBackground = useMotionTemplate`radial-gradient(circle at ${gx} ${gy}, var(--c-gold), transparent 55%)`;

  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  function onMove(e: React.PointerEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width);
    py.set((e.clientY - r.top) / r.height);
  }

  return (
    <div className={className} style={{ perspective: 900 }}>
      <motion.div
        ref={ref}
        onPointerMove={onMove}
        onPointerEnter={() => active.set(1)}
        onPointerLeave={() => {
          active.set(0);
          px.set(0.5);
          py.set(0.5);
        }}
        style={{
          rotateX: rx,
          rotateY: ry,
          y: lift,
          transformStyle: "preserve-3d",
        }}
        className="relative h-full will-change-transform"
      >
        {children}
        {glare && (
          <motion.span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 mix-blend-soft-light"
            style={{ background: gBackground, opacity: gOpacity }}
          />
        )}
      </motion.div>
    </div>
  );
}

/**
 * Scales and fades a block as it crosses the middle of the screen, so
 * a long page reads as a stack of cards rather than a scroll of
 * paper. Deliberately small: 4 per cent, not 20.
 */
export function Approach({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const scale = useSpring(
    useTransform(scrollYProgress, [0, 0.5, 1], [0.96, 1, 0.98]),
    SPRING,
  );
  const opacity = useTransform(scrollYProgress, [0, 0.18, 0.85, 1], [0, 1, 1, 0.5]);

  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      style={{ scale, opacity }}
      className={`will-change-transform ${className ?? ""}`}
    >
      {children}
    </motion.div>
  );
}
