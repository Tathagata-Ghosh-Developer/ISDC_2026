import Link from "next/link";
import { ArrowUpRight, Plus } from "lucide-react";
import type { Faq } from "@/lib/faq";

/**
 * The questions people ask, as plain disclosure rows. No script: a
 * <details> opens on its own, prints open, and is read whole by every
 * crawler and assistant that never runs JavaScript.
 */
export default function FaqList({ items }: { items: Faq[] }) {
  return (
    <div className="divide-y divide-line border-y border-line">
      {items.map((f) => (
        <details key={f.q} className="group py-1">
          <summary className="flex cursor-pointer list-none items-start justify-between gap-4 py-4 text-left [&::-webkit-details-marker]:hidden">
            <h3 className="font-display text-[1.05rem] font-normal leading-snug text-ink sm:text-[1.15rem]">
              {f.q}
            </h3>
            <Plus
              size={16}
              className="mt-1 shrink-0 text-gold transition-transform duration-300 group-open:rotate-45"
              aria-hidden
            />
          </summary>
          <div className="pb-5 pr-8">
            <p className="max-w-[68ch] text-[0.9rem] leading-relaxed text-ink-soft">{f.a}</p>
            {f.href && (
              <Link
                href={f.href}
                className="mt-3 inline-flex items-center gap-1 text-[0.78rem] text-gold underline-offset-4 hover:text-sindoor hover:underline"
              >
                {f.cta ?? "More"} <ArrowUpRight size={12} />
              </Link>
            )}
          </div>
        </details>
      ))}
    </div>
  );
}
