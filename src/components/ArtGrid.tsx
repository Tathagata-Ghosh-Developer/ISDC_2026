"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import type { ArtForm } from "@/lib/content/artforms";

/* ================================================================
   Twenty-four crafts, as cards.

   Each card lifts off the page when the pointer is on it, and the
   whole card is the link. The shadow is warm rather than grey,
   because a neutral shadow on a paper-coloured page reads as dirt.

   The card no longer expands in place. It used to, and the result was
   a column that jumped under the reader's thumb every time somebody
   pressed More. Each form has its own page now, which is also where
   the long history, the stories and the pictures live.
   ================================================================ */

const EASE = [0.22, 1, 0.36, 1] as const;

const STATUS_COLOUR: Record<ArtForm["status"], string> = {
  Thriving: "text-leaf",
  Evolving: "text-indigo",
  Endangered: "text-sindoor",
};

export default function ArtGrid({
  arts,
  categories,
  images = {},
  detailed = {},
}: {
  arts: ArtForm[];
  categories: string[];
  /** A photograph for the card, where one honestly shows the form. */
  images?: Record<string, string>;
  /** Which forms have their long page written. */
  detailed?: Record<string, boolean>;
}) {
  const [filter, setFilter] = useState("all");

  const shown =
    filter === "all" ? arts : arts.filter((a) => a.category === filter);

  return (
    <LayoutGroup>
      <div className="sticky top-[3.6rem] z-30 -mx-5 mb-8 border-y border-line bg-paper/90 px-5 py-2.5 backdrop-blur-xl md:-mx-8 md:px-8">
        <div className="flex gap-1 overflow-x-auto">
          {["all", ...categories].map((c) => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={`shrink-0 whitespace-nowrap px-3 py-1.5 text-[0.72rem] uppercase tracking-[0.16em] transition-colors ${
                filter === c ? "text-sindoor" : "text-ink-faint hover:text-ink"
              }`}
            >
              {c === "all" ? "Everything" : c}
              {filter === c && (
                <motion.span
                  layoutId="art-filter"
                  className="mt-1 block h-px w-full bg-sindoor"
                />
              )}
            </button>
          ))}
        </div>
      </div>

      <motion.div
        layout
        className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
      >
        <AnimatePresence mode="popLayout">
          {shown.map((a) => {
            const img = images[a.id];
            return (
              <motion.article
                key={a.id}
                id={a.id}
                layout
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.45, ease: EASE }}
                className="art-card scroll-mt-32"
              >
                <Link
                  href={`/shilpa/${a.id}`}
                  className="group flex h-full flex-col overflow-hidden border border-line bg-paper transition-colors duration-500 hover:border-gold"
                >
                  {img ? (
                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-ink">
                      <Image
                        src={img}
                        alt={a.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 32vw"
                        className="object-cover transition-transform duration-[1400ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06]"
                      />
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/55 via-transparent to-transparent" />
                      <span className="absolute left-4 top-4 bg-paper/90 px-2 py-0.5 text-[0.55rem] uppercase tracking-[0.2em] text-ink">
                        {a.category}
                      </span>
                    </div>
                  ) : (
                    <div className="border-b border-line px-5 pt-5">
                      <span className="text-[0.58rem] uppercase tracking-[0.24em] text-gold">
                        {a.category}
                      </span>
                    </div>
                  )}

                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex items-start justify-between gap-3">
                      <h2 className="bangla-display text-[1.35rem] leading-tight text-ink transition-colors group-hover:text-sindoor">
                        {a.bangla}
                      </h2>
                      <span
                        className={`shrink-0 pt-1 text-[0.55rem] uppercase tracking-[0.2em] ${STATUS_COLOUR[a.status]}`}
                      >
                        {a.status}
                      </span>
                    </div>

                    <p className="font-display text-[0.98rem] leading-snug text-ink-soft">
                      {a.name}
                    </p>

                    <p className="mt-3 flex-1 text-[0.82rem] leading-relaxed text-ink-soft">
                      {a.blurb.slice(0, 150).trimEnd()}…
                    </p>

                    <span className="mt-5 inline-flex items-center gap-2 text-[0.62rem] uppercase tracking-[0.2em] text-ink-faint transition-colors group-hover:text-gold">
                      {detailed[a.id] ? "The whole story" : "Read more"}
                      <ArrowRight
                        size={12}
                        className="transition-transform duration-500 group-hover:translate-x-1"
                      />
                    </span>
                  </div>
                </Link>
              </motion.article>
            );
          })}
        </AnimatePresence>
      </motion.div>
    </LayoutGroup>
  );
}
