"use client";

import { motion } from "framer-motion";

/* ================================================================
   The same radio, built out of blocks.

   Drawn on a strict 16 pixel grid with a four tone palette per
   material, the way a Minecraft texture is: a base, a light face, a
   dark face and a speckle. No curves anywhere, no anti-aliasing that
   is not the browser's own, and the dial pointer moves in whole
   blocks rather than smoothly, because that is the joke.

   It drives exactly the same state as the wooden one, so the aerial
   still tunes and the magic eye still closes.
   ================================================================ */

const P = {
  woodDark: "#4a2d16",
  wood: "#6b4423",
  woodLight: "#8a5a2c",
  woodSpeck: "#5c3a1c",
  glass: "#e8c65a",
  glassLit: "#f7e6a8",
  glassDim: "#7a6428",
  ink: "#1a1109",
  cloth: "#8a6a2c",
  clothDark: "#6b4f1d",
  metal: "#b9a184",
  metalDark: "#7d6a52",
  eye: "#5fbf7a",
  eyeDim: "#2c5c39",
  red: "#c0271a",
  pole: "#9a7b4a",
} as const;

const U = 8; // one block

function Block({
  x,
  y,
  w = 1,
  h = 1,
  fill,
  opacity = 1,
}: {
  x: number;
  y: number;
  w?: number;
  h?: number;
  fill: string;
  opacity?: number;
}) {
  return (
    <rect
      x={x * U}
      y={y * U}
      width={w * U}
      height={h * U}
      fill={fill}
      opacity={opacity}
      shapeRendering="crispEdges"
    />
  );
}

export default function VoxelRadio({
  signal,
  tune,
  aerial,
  onAerialDown,
  svgRef,
}: {
  signal: number;
  tune: number;
  aerial: number;
  onAerialDown: (e: React.PointerEvent) => void;
  svgRef: React.RefObject<SVGSVGElement | null>;
}) {
  /* the pointer snaps to whole blocks, because of course it does */
  const pointerBlock = 9 + Math.round(tune * 26);
  const lit = signal > 0.8;

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 400 260"
      className="mx-auto w-full max-w-[30rem] touch-none select-none"
      role="img"
      aria-label="The same radio, built out of blocks"
      shapeRendering="crispEdges"
    >
      {/* ---- the aerial, a stack of blocks on a pole ---- */}
      <motion.g
        style={{ transformOrigin: `${37 * U}px ${16 * U}px` }}
        animate={{ rotate: aerial + 76 }}
        transition={{ type: "spring", stiffness: 200, damping: 22 }}
      >
        {Array.from({ length: 14 }).map((_, i) => (
          <Block
            key={i}
            x={36.5}
            y={2 + i}
            w={1}
            fill={i % 3 === 0 ? P.metalDark : P.pole}
          />
        ))}
        <g
          className="cursor-grab active:cursor-grabbing"
          onPointerDown={onAerialDown}
        >
          <Block x={35.5} y={0.5} w={3} h={2} fill={lit ? "#e8a020" : P.metalDark} />
          <Block x={36} y={1} w={2} h={1} fill={lit ? "#f7e6a8" : P.metal} />
        </g>
      </motion.g>

      {/* the wire, as a staircase of blocks */}
      {Array.from({ length: 10 }).map((_, i) => (
        <Block
          key={i}
          x={36 - i * 1.4}
          y={3 + i * 1.05 + (1 - signal) * 2}
          w={1}
          h={0.5}
          fill={P.metal}
          opacity={0.75}
        />
      ))}

      {/* ---- the cabinet ---- */}
      <Block x={3} y={13} w={44} h={18} fill={P.wood} />
      <Block x={3} y={13} w={44} h={1} fill={P.woodLight} />
      <Block x={3} y={30} w={44} h={1} fill={P.woodDark} />
      <Block x={3} y={13} w={1} h={18} fill={P.woodLight} />
      <Block x={46} y={13} w={1} h={18} fill={P.woodDark} />
      {/* speckle, so the wood reads as a texture */}
      {[
        [7, 16], [12, 19], [18, 15], [24, 21], [31, 17], [38, 20], [42, 26],
        [9, 28], [16, 27], [27, 28], [35, 25],
      ].map(([x, y]) => (
        <Block key={`${x}-${y}`} x={x} y={y} fill={P.woodSpeck} />
      ))}

      {/* ---- the dial ---- */}
      <Block x={7} y={15} w={34} h={6} fill={P.ink} />
      <Block x={8} y={16} w={32} h={4} fill={signal > 0.1 ? P.glass : P.glassDim} />
      {lit && <Block x={8} y={16} w={32} h={1} fill={P.glassLit} />}

      {/* tick blocks along the scale */}
      {Array.from({ length: 16 }).map((_, i) => (
        <Block key={i} x={9 + i * 2} y={19} w={0.5} h={1} fill={P.ink} opacity={0.6} />
      ))}

      {/* the pointer, snapping block by block */}
      <motion.g
        animate={{ x: (pointerBlock - 9) * U }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
      >
        <Block x={9} y={16} w={0.5} h={4} fill={P.red} />
      </motion.g>

      {/* ---- the magic eye ---- */}
      <Block x={42} y={16} w={4} h={4} fill={P.ink} />
      <motion.g animate={{ opacity: 0.35 + signal * 0.6 }}>
        <Block
          x={44 - (1 - signal) * 1.5}
          y={17}
          w={Math.max(0.5, signal * 3)}
          h={2}
          fill={P.eye}
        />
      </motion.g>
      <Block x={42} y={16} w={4} h={0.5} fill={P.eyeDim} />

      {/* ---- the speaker cloth ---- */}
      <Block x={7} y={22} w={20} h={7} fill={P.clothDark} />
      {Array.from({ length: 10 }).map((_, row) =>
        Array.from({ length: 10 }).map((_, col) => (
          <Block
            key={`${row}-${col}`}
            x={7.5 + col * 2}
            y={22.5 + row * 0.65}
            w={1}
            h={0.35}
            fill={P.cloth}
          />
        )),
      )}

      {/* ---- the knobs, square because everything is ---- */}
      {[
        { x: 30, label: "VOL", angle: 40 },
        { x: 38, label: "TUNE", angle: tune * 250 - 125 },
      ].map((k) => (
        <g key={k.label}>
          <Block x={k.x} y={23} w={5} h={5} fill={P.ink} />
          <Block x={k.x + 0.5} y={23.5} w={4} h={4} fill={P.woodDark} />
          <Block x={k.x + 1} y={24} w={3} h={3} fill={P.wood} />
          <motion.g
            style={{
              transformOrigin: `${(k.x + 2.5) * U}px ${25.5 * U}px`,
            }}
            animate={{ rotate: Math.round(k.angle / 45) * 45 }}
            transition={{ type: "spring", stiffness: 300, damping: 26 }}
          >
            <Block x={k.x + 2} y={24} w={1} h={1.5} fill={P.metal} />
          </motion.g>
        </g>
      ))}

      {/* the badge, spelled in blocks */}
      <g>
        {Array.from({ length: 6 }).map((_, i) => (
          <Block key={i} x={9 + i * 1.6} y={29.5} w={1.1} h={0.8} fill={P.metal} opacity={0.75} />
        ))}
      </g>
    </svg>
  );
}
