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
      style={{ width: size, height: "auto" }}
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
  return (
    <span className={`flex items-center gap-3 ${className}`}>
      <Logo size={size} priority />
      <span className="leading-none">
        <span className="block font-display text-[1.05rem] font-semibold tracking-tight text-ink">
          Sharodiya Durgotsab
        </span>
        <span className="bangla-display block text-[0.78rem] tracking-[0.18em] text-gold">
          আইআইএসসি {SITE.year}
        </span>
      </span>
    </span>
  );
}
