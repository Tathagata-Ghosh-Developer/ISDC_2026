import Image from "next/image";
import { SITE } from "@/lib/site";

/**
 * The committee crest, used everywhere the mark appears so the header,
 * the footer, the receipt and the browser tab never drift apart.
 * The artwork is the one printed on the committee's own receipt book.
 */
export default function Logo({
  size = 40,
  mono = false,
  className = "",
  priority = false,
}: {
  size?: number;
  mono?: boolean;
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src={mono ? SITE.logoMono : SITE.logo}
      alt={`${SITE.name} crest`}
      width={size}
      height={size}
      priority={priority}
      className={`h-auto w-auto object-contain ${className}`}
      // design pixels: the size given, growing with the type on a big screen
      style={{ width: `calc(${size} * var(--px, 1px))`, height: "auto" }}
    />
  );
}

/** The wordmark as it should always be set, crest plus two lines. */
export function Wordmark({
  size = 40,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  /* On the folded cover screen of a foldable (under 300px) the crest
     stands alone and the name is left to the page and to the crest's
     alt text; on the narrowest phones the name steps down a size so
     it sets in two lines rather than running under the buttons. */
  return (
    <span className={`flex items-center gap-2.5 min-[360px]:gap-3 ${className}`}>
      <Logo size={size} priority />
      <span className="leading-none max-[300px]:sr-only">
        <span className="block font-display text-[0.95rem] font-semibold tracking-tight text-ink min-[360px]:text-[1.05rem]">
          Sharodiya Durgotsab
        </span>
        <span className="bangla-display block text-[0.78rem] tracking-[0.1em] text-gold min-[360px]:tracking-[0.18em]">
          আইআইএসসি {SITE.year}
        </span>
      </span>
    </span>
  );
}
