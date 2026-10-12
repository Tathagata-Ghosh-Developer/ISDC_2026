import type { ReactNode } from "react";
import Reveal from "./Reveal";
import { BrushUnderline } from "./Brush";

export function Container({
  children,
  className = "",
  wide = false,
}: {
  children: ReactNode;
  className?: string;
  wide?: boolean;
}) {
  /* The measure is 1180 (or 1440) design pixels: exactly that on every
     laptop, and growing with the type on a 1440p screen or a
     television, where it stays centred rather than stretching. The
     gutter is a little narrower on the folded cover of a foldable,
     where every pixel of a 280px screen counts. */
  return (
    <div
      className={`mx-auto w-full px-4 min-[340px]:px-5 md:px-8 ${wide ? "max-w-wide" : "max-w-page"} ${className}`}
    >
      {children}
    </div>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  bangla,
  lede,
  align = "left",
  as: Tag = "h2",
}: {
  eyebrow?: string;
  title: string;
  bangla?: string;
  lede?: string;
  align?: "left" | "center";
  /** The first heading on a page should be an h1; the rest are h2. */
  as?: "h1" | "h2";
}) {
  const centred = align === "center";
  return (
    <Reveal className={centred ? "text-center" : ""}>
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <Tag className="font-display mt-3 text-[2.058rem] font-normal leading-[1.08] tracking-tight text-ink sm:text-[2.618rem] lg:text-[3.33rem]">
        {title}
      </Tag>
      {bangla && (
        <p className="bangla-display mt-3 text-[1.618rem] text-sindoor sm:text-[2.058rem]">
          {bangla}
        </p>
      )}
      {lede && (
        <p
          className={`lede mt-5 max-w-[62ch] ${centred ? "mx-auto" : ""}`}
        >
          {lede}
        </p>
      )}
      <BrushUnderline
        className={`mt-6 h-[0.7rem] w-[5.4rem] text-gold ${centred ? "mx-auto" : ""}`}
      />
    </Reveal>
  );
}

/** Vertical rhythm is a phi step; every section uses the same one. */
export function Section({
  children,
  className = "",
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section
      id={id}
      className={`relative py-[4.236rem] sm:py-[6.854rem] ${className}`}
    >
      {children}
    </section>
  );
}
