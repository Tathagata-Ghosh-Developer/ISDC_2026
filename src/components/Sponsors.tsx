import Image from "next/image";
import { PARTNERS, TITLE_SPONSOR } from "@/lib/site";

/* ================================================================
   The title sponsor, everywhere it appears.

   No "use client" and nothing server-only in here, deliberately. The
   hero and the masthead are client components; the footer and the
   sponsors pages are not; and all of them show the same mark from the
   same file. Everything below reads from TITLE_SPONSOR and nothing
   else, so a change there is a change everywhere.

   The site is "Powered by" the title sponsor's group, the umbrella
   over the four companies whose marks are shown, in the committee's
   order. The first mark's brand guidelines hold it to rules the other
   three are not:

   - never narrower than 150 px, at any width of screen. Where that
     does not fit, the name goes in as text and the mark stays out;
   - clear space on every side at least the height of its "G". The
     files carry that space inside them, so a tile around the mark
     needs no padding of its own, and nothing else may sit inside it;
   - the full-colour version only on a light ground (the tiles stay
     light on the night theme too);
   - never a filter, a shadow, a tilt or a fade on the mark itself.
   ================================================================ */

/**
 * The tiles keep this colour on the night theme too. Two of the four
 * wordmarks are black or dark blue on nothing, and a mark you cannot
 * see is worse than a tile that is the wrong colour for the page. It is
 * a literal rather than a token because the tokens follow the theme and
 * this must not. It is also why the first mark may stay in full colour
 * on its tile at night, as its guidelines require: the ground under it
 * is still light.
 */
const TILE_BACKGROUND = "#fbf6ea";

/**
 * The narrowest the first mark's tile may ever be. Its artwork is 62.5
 * per cent of the tile's width, so 250 px of tile, less a pixel of
 * border each side, is 153 px of artwork: over the 150 px floor.
 */
const LEAD_MIN_WIDTH = "min-w-[250px]";

/** The copy for the level that is no longer on offer. */
export const TITLE_TAKEN = `Taken for ${TITLE_SPONSOR.year} by ${TITLE_SPONSOR.name}`;

/**
 * "Powered by" and the group's name, in words. The group is the umbrella
 * over all four companies whose marks follow, so the line names the
 * group and no single mark stands in for it. `lg` is the size for the
 * hero and the phone menu; the default is the masthead's.
 */
export function PoweredBy({
  size = "sm",
  className = "",
}: {
  size?: "sm" | "lg";
  className?: string;
}) {
  const lg = size === "lg";
  return (
    <span
      className={`inline-flex flex-wrap items-baseline gap-x-2.5 ${lg ? "gap-x-3" : "whitespace-nowrap"} ${className}`}
    >
      <span
        className={`font-medium uppercase text-gold ${
          lg ? "text-[0.66rem] tracking-[0.28em]" : "text-[0.56rem] tracking-[0.24em]"
        }`}
      >
        Powered by
      </span>
      <span className={`font-display text-ink ${lg ? "text-[1.618rem] leading-tight" : "text-[0.95rem]"}`}>
        {TITLE_SPONSOR.name}
      </span>
    </span>
  );
}

/**
 * One mark on a light card. A link when the company has a site we have
 * checked, a plain tile when it does not. The url is never guessed.
 * `lead` is the first mark: no padding, because its clear space is in
 * the file, and a floor on its width.
 */
export function LogoTile({
  name,
  logo,
  url = "",
  compact = false,
  lead = false,
  sizes,
  className = "",
}: {
  name: string;
  logo: string;
  url?: string;
  compact?: boolean;
  lead?: boolean;
  /** What next/image should plan for; defaults to the strip's grid. */
  sizes?: string;
  className?: string;
}) {
  const shape = `grid aspect-[5/2] border border-line ${
    lead ? LEAD_MIN_WIDTH : compact ? "p-2" : "p-3 sm:p-4"
  } ${className}`;

  const mark = (
    <span className="relative block">
      <Image
        src={logo}
        alt={name}
        fill
        sizes={
          sizes ??
          (lead
            ? "(max-width: 1023px) 30rem, 27rem"
            : compact
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
      rel="noopener noreferrer"
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
 * footer, where it is a band and sits beside its own title on a wide
 * screen rather than under it.
 *
 * The first mark leads at twice the width of the other three, because
 * at a quarter of the row it would fall under its 150 px floor on
 * anything narrower than a wide laptop. Below a laptop it takes a row
 * of its own and the other three sit two and one beneath it, which
 * also keeps those three at a size that can be read.
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
        compact ? "xl:flex xl:items-center xl:justify-between xl:gap-[2.618rem]" : ""
      }
    >
      <div className={compact ? "xl:shrink-0" : ""}>
        {heading && <p className="eyebrow">শিরোনাম পৃষ্ঠপোষক Title sponsor</p>}
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
        className={`grid max-w-[30rem] grid-cols-4 lg:grid-cols-[2fr_1fr_1fr_1fr] lg:items-center ${
          compact
            ? "mt-5 gap-2 lg:max-w-[48rem] xl:mt-0 xl:w-full"
            : "mt-8 gap-3 lg:max-w-none"
        }`}
      >
        {TITLE_SPONSOR.logos.map((l, i) => (
          <li
            key={l.id}
            className={
              i === 0
                ? "col-span-4 lg:col-span-1"
                : // the last of the three is centred under the two on a phone
                  `col-span-2 lg:col-span-1 ${i === 3 ? "col-start-2 lg:col-start-auto" : ""}`
            }
          >
            <LogoTile
              name={l.name}
              logo={l.logo}
              url={l.url}
              compact={compact}
              lead={i === 0}
            />
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

/**
 * The partners after the title sponsor, each given room by what they
 * put in: the ₹15,000 partners take a full cell each, and the partner
 * in kind is drawn smaller. A partnership of two organisations (the
 * food partner and its NGO) shares one cell, mark beside mark, because
 * it was one payment. Every mark keeps the ground it was drawn on,
 * light or dark, on either theme, for the same reason the title tiles
 * stay light.
 */
export function PartnerStrip({
  compact = false,
  heading = false,
}: {
  compact?: boolean;
  heading?: boolean;
}) {
  const ground = (t: "light" | "dark") => (t === "light" ? TILE_BACKGROUND : "#000000");
  const mark = (m: { name: string; logo: string; tile: "light" | "dark" }) => (
    <span
      className={`relative block h-full w-full ${compact ? "p-1.5" : "p-2 sm:p-3"}`}
      style={{ background: ground(m.tile) }}
    >
      <span className="relative block h-full w-full">
        <Image
          src={m.logo}
          alt={m.name}
          fill
          sizes={compact ? "(max-width: 640px) 45vw, 12rem" : "(max-width: 640px) 50vw, (max-width: 1023px) 45vw, 20rem"}
          className="object-contain"
        />
      </span>
    </span>
  );

  return (
    <div>
      {heading && <p className="eyebrow">সহযোগী Partners</p>}
      <ul
        className={`grid grid-cols-2 lg:grid-cols-3 ${
          compact ? "max-w-[40rem] gap-2" : `max-w-[60rem] gap-3 ${heading ? "mt-5" : ""}`
        }`}
      >
        {PARTNERS.map((p) => {
          const pair = p.with;
          const label = pair ? `${p.name}, ${p.role}, with ${pair.name}, ${pair.role}` : `${p.name}, ${p.role}`;
          const shape = `grid aspect-[5/2] overflow-hidden border border-line ${pair ? "grid-cols-2 gap-px bg-line" : ""}`;
          const tile = pair ? (
            <>
              {mark(p)}
              {mark(pair)}
            </>
          ) : (
            mark(p)
          );
          return (
            <li
              key={p.id}
              className={`${pair ? "col-span-2 lg:col-span-1" : ""} ${p.contribution === 0 ? "w-3/4" : ""}`}
            >
              {p.url ? (
                <a
                  href={p.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={label}
                  className={`${shape} transition-all duration-500 hover:-translate-y-1 hover:border-gold`}
                >
                  {tile}
                </a>
              ) : (
                <div className={shape} role="img" aria-label={label}>
                  {tile}
                </div>
              )}
              <p className={`mt-2 uppercase text-ink-soft ${compact ? "text-[0.56rem] tracking-[0.18em]" : "text-[0.62rem] tracking-[0.22em]"}`}>
                {p.role}
                {pair && ` · ${pair.role}`}
                {!compact && (
                  <span className="bangla ml-1.5 normal-case tracking-normal text-gold">
                    {p.bangla}
                    {pair && ` · ${pair.bangla}`}
                  </span>
                )}
              </p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
