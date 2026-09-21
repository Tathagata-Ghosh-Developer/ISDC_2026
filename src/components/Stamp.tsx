/**
 * The committee's stamp, drawn rather than scanned.
 *
 * A real rubber stamp is never quite level, never quite fully inked,
 * and never quite the same twice. This one is tilted, has a broken
 * edge and a little missing ink, because a stamp that is perfectly
 * circular and perfectly opaque reads as a graphic and not as
 * something somebody pressed onto a page.
 *
 * It is drawn in SVG so it prints at the resolution of whatever it is
 * printed on, and so it can be recoloured for a paper or a screen
 * without anyone opening an image editor.
 */
export default function Stamp({
  year,
  className = "",
  size = 132,
}: {
  year: number;
  className?: string;
  size?: number;
}) {
  const outer = "IISc SHARODIYA DURGOTSAB COMMITTEE";

  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label={`Stamp of the IISc Sharodiya Durgotsab Committee, ${year}`}
    >
      <defs>
        {/* The path the ring of lettering runs along. */}
        <path
          id="stamp-ring"
          d="M100,100 m-72,0 a72,72 0 1,1 144,0 a72,72 0 1,1 -144,0"
          fill="none"
        />
        {/* Ink that has not taken evenly. */}
        <filter id="stamp-ink" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.9"
            numOctaves="3"
            seed="7"
            result="noise"
          />
          <feColorMatrix
            in="noise"
            type="matrix"
            values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.4 1.05"
            result="mask"
          />
          <feComposite in="SourceGraphic" in2="mask" operator="in" />
        </filter>
      </defs>

      <g
        filter="url(#stamp-ink)"
        transform="rotate(-8 100 100)"
        fill="none"
        stroke="currentColor"
        opacity="0.82"
      >
        <circle cx="100" cy="100" r="88" strokeWidth="3.5" />
        <circle cx="100" cy="100" r="80" strokeWidth="1.4" />
        <circle cx="100" cy="100" r="52" strokeWidth="1.4" />

        {/* two dots where a stamp's ring lettering starts and ends */}
        <circle cx="100" cy="176" r="2.6" fill="currentColor" stroke="none" />

        <text
          fill="currentColor"
          stroke="none"
          fontSize="13.5"
          letterSpacing="2.1"
          fontWeight="600"
        >
          <textPath href="#stamp-ring" startOffset="50%" textAnchor="middle">
            {outer}
          </textPath>
        </text>

        <text
          x="100"
          y="88"
          textAnchor="middle"
          fill="currentColor"
          stroke="none"
          fontSize="26"
          fontWeight="700"
          letterSpacing="1"
        >
          RECEIVED
        </text>
        <text
          x="100"
          y="118"
          textAnchor="middle"
          fill="currentColor"
          stroke="none"
          fontSize="30"
          fontWeight="700"
          letterSpacing="2"
        >
          {year}
        </text>
        <line x1="62" y1="128" x2="138" y2="128" strokeWidth="1.6" />
        <text
          x="100"
          y="143"
          textAnchor="middle"
          fill="currentColor"
          stroke="none"
          fontSize="11"
          letterSpacing="3"
        >
          BENGALURU
        </text>
      </g>
    </svg>
  );
}
