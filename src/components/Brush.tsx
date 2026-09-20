/**
 * Brush marks, after the hand-drawn rules and underscores on Satyajit
 * Ray's title cards and Sandesh covers. Drawn as paths rather than
 * images so they take the current colour and stay sharp at any size.
 */

export function BrushRule({
  className = "",
  width = 180,
}: {
  className?: string;
  width?: number;
}) {
  return (
    <svg
      viewBox="0 0 180 12"
      width={width}
      height={(12 / 180) * width}
      className={className}
      fill="currentColor"
      aria-hidden
      preserveAspectRatio="none"
    >
      {/* one loaded stroke: thick at the start, dry at the tail */}
      <path d="M2,7.4 C26,3.1 54,2.2 86,3.4 C118,4.6 146,6.2 176,4.1 C150,8.4 120,9.6 88,8.5 C58,7.5 30,7.1 2,7.4 Z" />
      <path d="M8,10.2 C40,9.1 74,9.4 108,10.1 C122,10.4 136,10.2 150,9.6 C130,11.6 106,11.9 82,11.5 C58,11.1 32,10.9 8,10.2 Z" opacity="0.55" />
    </svg>
  );
}

/** A short, fat brush underscore for sitting beneath a heading. */
export function BrushUnderline({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 14"
      className={className}
      fill="currentColor"
      aria-hidden
    >
      <path d="M3,6.5 C22,2.4 44,1.6 68,2.8 C84,3.6 100,5.2 117,3.6 C99,9.2 78,10.8 56,9.9 C38,9.2 20,8.2 3,6.5 Z" />
    </svg>
  );
}

/** A heavy tick, the kind Ray drew as a bullet or a corner mark. */
export function BrushTick({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className} fill="currentColor" aria-hidden>
      <path d="M1.6,8.6 C3.4,7.4 4.6,8.2 5.8,9.6 C6.6,10.5 7,11 7.4,11.8 C8.8,8.4 11,4.8 14.4,1.8 C14.9,2.6 15.1,3.2 15,3.9 C11.7,7.4 9.4,11 7.9,14.6 C6.9,14.9 6.2,14.6 5.7,13.8 C4.6,12 3.2,10.2 1.6,8.6 Z" />
    </svg>
  );
}
