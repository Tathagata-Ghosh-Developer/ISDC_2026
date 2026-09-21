"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Download, Footprints, Navigation } from "lucide-react";
import {
  CAMPUS_MAP,
  LANDMARKS,
  MAP_GATES,
  VENUE_MARKER,
  VENUE_POINT,
  mapsLink,
  routeMetres,
  walkMinutes,
  type MapGate,
} from "@/lib/content/campusmap";
import { SITE } from "@/lib/site";

/* ================================================================
   The Institute's own map, with the pandal put on it.

   The map is the one the Institute publishes, unaltered underneath.
   Everything drawn over it is in an SVG laid on top in the same
   fractional coordinates, so it stays correct at any width, prints
   correctly, and can be checked against a paper copy by the numbers.

   Pick a gate and its route draws itself. The numbers next to it are
   measured off the traced path using the map's own scale bar, not
   guessed, which is why they are odd numbers rather than round ones.
   ================================================================ */

const ASPECT = CAMPUS_MAP.height / CAMPUS_MAP.width;

function path(points: [number, number][]): string {
  return points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${(p[0] * 100).toFixed(3)} ${(p[1] * 100 * ASPECT).toFixed(3)}`)
    .join(" ");
}

export default function CampusMap() {
  const [active, setActive] = useState<string | null>("main-gate");

  const gate: MapGate | undefined = MAP_GATES.find((g) => g.id === active);
  const metres = gate ? routeMetres(gate.route) : 0;

  return (
    <div className="grid gap-px bg-line lg:grid-cols-[1.618fr_1fr]">
      {/* ---------------- the map ---------------- */}
      <div className="relative bg-paper">
        <div className="relative">
          <Image
            src={CAMPUS_MAP.src}
            alt="The Indian Institute of Science campus map, with the pandal marked at the Tata Memorial Club ground"
            width={CAMPUS_MAP.width}
            height={CAMPUS_MAP.height}
            sizes="(max-width: 1024px) 100vw, 60vw"
            className="w-full"
            priority={false}
          />

          <svg
            viewBox={`0 0 100 ${100 * ASPECT}`}
            className="pointer-events-none absolute inset-0 h-full w-full"
            aria-hidden="true"
          >
            {/* every other route, faint, so the shape of the campus reads */}
            {MAP_GATES.filter((g) => g.id !== active).map((g) => (
              <path
                key={g.id}
                d={path(g.route)}
                fill="none"
                stroke="var(--c-ink)"
                strokeOpacity={0.12}
                strokeWidth={0.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="1.4 1.4"
              />
            ))}

            {/* the chosen one */}
            <AnimatePresence mode="wait">
              {gate && (
                <motion.path
                  key={gate.id}
                  d={path(gate.route)}
                  fill="none"
                  stroke="var(--c-sindoor)"
                  strokeWidth={1.1}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
                />
              )}
            </AnimatePresence>

            {/* the gates */}
            {MAP_GATES.map((g) => {
              const on = g.id === active;
              return (
                <g key={g.id}>
                  <circle
                    cx={g.at[0] * 100}
                    cy={g.at[1] * 100 * ASPECT}
                    r={on ? 1.5 : 1}
                    fill={on ? "var(--c-sindoor)" : "var(--c-ink)"}
                    fillOpacity={on ? 1 : 0.55}
                    stroke="var(--c-paper-3)"
                    strokeWidth={0.35}
                  />
                </g>
              );
            })}

            {/* the landmarks the venue is described against */}
            {LANDMARKS.map((l) => (
              <circle
                key={l.marker}
                cx={l.at[0] * 100}
                cy={l.at[1] * 100 * ASPECT}
                r={0.8}
                fill="var(--c-gold)"
                stroke="var(--c-paper-3)"
                strokeWidth={0.28}
              />
            ))}

            {/* the pandal */}
            <g>
              <motion.circle
                cx={VENUE_POINT[0] * 100}
                cy={VENUE_POINT[1] * 100 * ASPECT}
                r={3.2}
                fill="var(--c-sindoor)"
                fillOpacity={0.18}
                animate={{ r: [2.6, 4.2, 2.6], opacity: [0.28, 0, 0.28] }}
                transition={{ duration: 3.2, repeat: Infinity, ease: "easeOut" }}
              />
              <circle
                cx={VENUE_POINT[0] * 100}
                cy={VENUE_POINT[1] * 100 * ASPECT}
                r={1.9}
                fill="var(--c-sindoor)"
                stroke="var(--c-paper-3)"
                strokeWidth={0.45}
              />
              <text
                x={VENUE_POINT[0] * 100}
                y={VENUE_POINT[1] * 100 * ASPECT + 0.55}
                textAnchor="middle"
                fontSize={1.6}
                fill="var(--c-paper-3)"
                fontWeight="600"
              >
                {VENUE_MARKER}
              </text>
            </g>
          </svg>
        </div>

        <p className="border-t border-line px-4 py-2.5 text-[0.62rem] leading-relaxed text-ink-faint">
          {CAMPUS_MAP.credit} The pandal, the gates and the routes are drawn
          over it by the committee.
        </p>
      </div>

      {/* ---------------- the gates ---------------- */}
      <div className="bg-paper p-6">
        <h3 className="eyebrow">Coming in from</h3>
        <p className="mt-2 text-[0.8rem] leading-relaxed text-ink-soft">
          Seven gates open onto this campus and they are a long way apart. Pick
          the one you will actually arrive at and the walk draws itself.
        </p>

        <ul className="mt-5 space-y-px bg-line">
          {MAP_GATES.map((g) => {
            const on = g.id === active;
            const m = routeMetres(g.route);
            return (
              <li key={g.id}>
                <button
                  onClick={() => setActive(g.id)}
                  className={`flex w-full items-baseline justify-between gap-3 px-4 py-3 text-left transition-colors ${
                    on ? "bg-sindoor text-paper-3" : "bg-paper hover:bg-paper-2/70"
                  }`}
                >
                  <span className="min-w-0">
                    <span className="block text-[0.88rem] leading-tight">
                      {g.name}
                    </span>
                    <span
                      className={`bangla-display block text-[0.95rem] leading-tight ${
                        on ? "text-paper-3/80" : "text-gold"
                      }`}
                    >
                      {g.bangla}
                    </span>
                  </span>
                  <span
                    className={`shrink-0 text-right text-[0.62rem] uppercase tracking-[0.14em] ${
                      on ? "text-paper-3/80" : "text-ink-faint"
                    }`}
                  >
                    <span className="block tabular-nums">
                      {Math.round(m / 10) * 10} m
                    </span>
                    <span className="block">
                      {walkMinutes(m)} min walk
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        <AnimatePresence mode="wait">
          {gate && (
            <motion.div
              key={gate.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.35 }}
              className="mt-6"
            >
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <h4 className="font-display text-[1.1rem] text-ink">
                  {gate.name}
                </h4>
                <span className="text-[0.6rem] uppercase tracking-[0.18em] text-gold">
                  marker {gate.marker} · grid {gate.grid}
                </span>
              </div>

              <p className="mt-2 text-[0.84rem] leading-relaxed text-ink-soft">
                {gate.note}
              </p>

              <div className="mt-4 flex items-center gap-4 text-[0.75rem] text-ink-faint">
                <span className="flex items-center gap-1.5">
                  <Footprints size={13} /> {Math.round(metres / 10) * 10} metres
                </span>
                <span>about {walkMinutes(metres)} minutes</span>
              </div>

              <a
                href={mapsLink(gate.origin, SITE.venue)}
                target="_blank"
                rel="noreferrer noopener"
                className="btn btn-ghost mt-5 w-full"
              >
                <Navigation size={13} /> Open this walk in Maps
              </a>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-6 border-t border-line pt-5">
          <p className="text-[0.78rem] leading-relaxed text-ink-soft">
            The pandal is marker{" "}
            <span className="text-sindoor">{VENUE_MARKER}</span>, the Tata
            Memorial Club ground, grid F3. Marker 139 next to it is the State
            Bank branch the venue is always described against. If you are
            already inside the campus, walk towards the bank.
          </p>
          <a
            href={CAMPUS_MAP.pdf}
            target="_blank"
            rel="noreferrer noopener"
            className="btn btn-ghost mt-4 w-full"
          >
            <Download size={13} /> The Institute&apos;s map as a PDF
          </a>
        </div>
      </div>
    </div>
  );
}
