import Image from "next/image";
import { TITLE_SPONSOR } from "@/lib/site";

/* ================================================================
   The title sponsor, everywhere it appears.

   No "use client" and nothing server-only in here, deliberately. The
   hero and the masthead are client components; the footer and the
   sponsors pages are not; and all of them show the same mark from the
   same file. Everything below reads from TITLE_SPONSOR and nothing
   else, so a change there is a change everywhere.
   ================================================================ */

/**
 * The tiles keep this colour on the night theme too. Two of the four
 * wordmarks are black or dark blue on nothing, and a mark you cannot
 * see is worse than a tile that is the wrong colour for the page. It is
 * a literal rather than a token because the tokens follow the theme and
 * this must not.
 */
const TILE_BACKGROUND = "#fbf6ea";

/** The copy for the level that is no longer on offer. */
export const TITLE_TAKEN = `Taken for ${TITLE_SPONSOR.year} by ${TITLE_SPONSOR.name}`;

/** The mark the site is "Powered by": the first of the four. */
const MARK = TITLE_SPONSOR.logos[0];

/**
 * The inline lockup: "Powered by" and the mark, for the title block on
 * the home page and the masthead. It sits straight on the page; the
 * mark is blue and red and reads on both themes.
 */
export function PoweredBy({
  size = "md",
  className = "",
}: {
  size?: "md" | "sm";
  className?: string;
}) {
  // The source is 1200 by 480, so the width is always two and a half
  // times the height: 100 by 40, or 65 by 26.
  const height = size === "md" ? 40 : 26;
  const width = height * 2.5;

  return (
    <span className={`inline-flex items-center ${className}`}>
      {/* One sentence for a screen reader, instead of a label and then
          a picture of the same name; the visible pair is hidden from it. */}
      <span className="sr-only">{TITLE_SPONSOR.line}</span>
      <span
        aria-hidden
        className={`flex items-center ${size === "md" ? "gap-3" : "gap-2.5"}`}
      >
        <span
          className={`whitespace-nowrap font-medium uppercase text-gold ${
            size === "md"
              ? "text-[0.66rem] tracking-[0.28em]"
              : "text-[0.56rem] tracking-[0.24em]"
          }`}
        >
          Powered by
        </span>
        <Image
          src={MARK.logo}
          alt={MARK.name}
          width={width}
          height={height}
          className="w-auto shrink-0"
          style={{ height }}
        />
      </span>
    </span>
  );
}

/**
 * One mark on a light card. A link when the company has a site we have
 * checked, a plain tile when it does not. The url is never guessed.
 */
export function LogoTile({
  name,
  logo,
  url = "",
  compact = false,
  sizes,
  className = "",
}: {
  name: string;
  logo: string;
  url?: string;
  compact?: boolean;
  /** What next/image should plan for; defaults to the four-up grid. */
  sizes?: string;
  className?: string;
}) {
  const shape = `grid aspect-[5/2] border border-line ${
    compact ? "p-2" : "p-3 sm:p-4"
  } ${className}`;

  const mark = (
    <span className="relative block">
      <Image
        src={logo}
        alt={name}
        fill
        sizes={
          sizes ??
          (compact
            ? "(max-width: 640px) 50vw, 11rem"
            : "(max-width: 640px) 50vw, (max-width: 1180px) 25vw, 280px")
        }
        className="object-contain"
      />
    </span>
  );

  if (url === "") {
    return (
      <div className={shape} style={{ background: TILE_BACKGROUND }}>
        {mark}
      </div>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer noopener"
      aria-label={name}
      className={`${shape} transition-all duration-500 hover:-translate-y-1 hover:border-gold`}
      style={{ background: TILE_BACKGROUND }}
    >
      {mark}
    </a>
  );
}

/**
 * The line and the four marks. `heading` adds the eyebrow, for the
 * pages where the strip is a section of its own. `compact` is the
 * footer, where it is a band and sits beside its own title on a
 * laptop rather than under it.
 */
export function TitleSponsorStrip({
  compact = false,
  heading = false,
}: {
  compact?: boolean;
  heading?: boolean;
}) {
  const Line = heading ? "h2" : "p";

  return (
    <div
      className={
        compact ? "lg:flex lg:items-center lg:justify-between lg:gap-[2.618rem]" : ""
      }
    >
      <div className={compact ? "lg:shrink-0" : ""}>
        {heading && <p className="eyebrow">শিরোনাম পৃষ্ঠপোষক Title sponsors</p>}
        <Line
          className={`font-display font-normal text-ink ${heading ? "mt-3" : ""} ${
            compact
              ? "text-[1.1rem]"
              : "text-[1.618rem] leading-[1.15] sm:text-[2.058rem]"
          }`}
        >
          {TITLE_SPONSOR.line}
        </Line>
        <p
          className={`bangla-display text-gold ${
            compact ? "text-[0.95rem]" : "mt-1 text-[1.272rem]"
          }`}
        >
          {TITLE_SPONSOR.lineBangla}
        </p>
      </div>

      <ul
        className={`grid grid-cols-2 sm:grid-cols-4 ${
          compact ? "mt-5 gap-2 lg:mt-0 lg:w-full lg:max-w-[44rem]" : "mt-8 gap-3"
        }`}
      >
        {TITLE_SPONSOR.logos.map((l) => (
          <li key={l.id}>
            <LogoTile {...l} compact={compact} />
          </li>
        ))}
      </ul>
    </div>
  );
}

/** The badge that stands where the title level's price used to. */
export function TakenBadge({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-block border border-gold px-2 py-1 text-[0.62rem] uppercase tracking-[0.24em] text-gold ${className}`}
    >
      {`Taken for ${TITLE_SPONSOR.year}`}
    </span>
  );
}
