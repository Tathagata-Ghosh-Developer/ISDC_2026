import { GUIDE } from "@/lib/guide";

/**
 * Dhaki-da, the site's AI guide: a dhak with a kash-flower plume and two
 * ink eyes. A drum, never a drawn drummer, so the character borrows the
 * best-loved sound of the Puja without making a cartoon of the men who
 * play it.
 *
 * The circle is its own paper, so it reads the same on a dark page. The
 * drumstick is left out below 32 px, where it only adds noise.
 */
export default function DhakiDa({
  size = 40,
  title = GUIDE.alt,
}: {
  size?: number;
  title?: string | null;
}) {
  const ink = "#2a1a10";
  const paper = "#f7f1e4";
  const vermilion = "#c0271a";
  const gold = "#b0892f";
  const white = "#fffdf7";
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      role={title ? "img" : undefined}
      aria-label={title ?? undefined}
      aria-hidden={title ? undefined : true}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {title && <title>{title}</title>}
      <circle cx="32" cy="32" r="31" fill={paper} stroke={ink} strokeWidth="2" />
      {/* the plume, tipped with kash flowers */}
      <path d="M32 24 L25 12 M32 24 L32 9 M32 24 L39 12" stroke={gold} strokeWidth="2.4" fill="none" />
      <circle cx="25" cy="11.5" r="2.6" fill={white} stroke={gold} strokeWidth="1.2" />
      <circle cx="32" cy="8.5" r="2.8" fill={white} stroke={gold} strokeWidth="1.2" />
      <circle cx="39" cy="11.5" r="2.6" fill={white} stroke={gold} strokeWidth="1.2" />
      {/* the drum */}
      <rect x="14" y="24" width="36" height="22" rx="9" fill={vermilion} stroke={ink} strokeWidth="2" />
      <path d="M21 25 V45 M43 25 V45" stroke={gold} strokeWidth="1.6" />
      <ellipse cx="14" cy="35" rx="4" ry="11" fill={paper} stroke={ink} strokeWidth="2" />
      <ellipse cx="50" cy="35" rx="4" ry="11" fill={paper} stroke={ink} strokeWidth="2" />
      {/* the face: white eyes, so it still reads at 40 px on the vermilion */}
      <ellipse cx="27" cy="33" rx="3.3" ry="3.8" fill={white} />
      <ellipse cx="37" cy="33" rx="3.3" ry="3.8" fill={white} />
      <circle cx="27.6" cy="33.8" r="1.9" fill={ink} />
      <circle cx="37.6" cy="33.8" r="1.9" fill={ink} />
      <path d="M28.6 39.6 Q32 42.6 35.4 39.6" stroke={white} strokeWidth="1.7" fill="none" />
      {size >= 32 && <path d="M47 52 L57 42" stroke={ink} strokeWidth="2.5" />}
    </svg>
  );
}
