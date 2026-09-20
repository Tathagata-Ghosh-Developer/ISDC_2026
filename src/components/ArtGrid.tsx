"use client";

import { useState } from "react";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { Plus, Minus } from "lucide-react";
import type { ArtForm } from "@/lib/content/artforms";

const EASE = [0.22, 1, 0.36, 1] as const;

const STATUS_COLOUR: Record<ArtForm["status"], string> = {
  Thriving: "text-leaf",
  Evolving: "text-indigo",
  Endangered: "text-sindoor",
};

export default function ArtGrid({
  arts,
  categories,
}: {
  arts: ArtForm[];
  categories: string[];
}) {
  const [filter, setFilter] = useState("all");
  const [open, setOpen] = useState<string | null>(null);

  const shown = filter === "all" ? arts : arts.filter((a) => a.category === filter);

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

      <motion.div layout className="grid gap-4 md:grid-cols-2">
        <AnimatePresence mode="popLayout">
          {shown.map((a) => {
            const isOpen = open === a.id;
            return (
              <motion.article
                key={a.id}
                id={a.id}
                layout
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.45, ease: EASE }}
                className="surface flex flex-col p-6 scroll-mt-32"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-[0.6rem] uppercase tracking-[0.24em] text-gold">
                      {a.category}
                    </p>
                    <h2 className="bangla-display mt-2 text-[1.4rem] leading-tight text-ink">
                      {a.bangla}
                    </h2>
                    <p className="font-display text-[1.05rem] text-ink-soft">
                      {a.name}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 text-[0.58rem] uppercase tracking-[0.2em] ${STATUS_COLOUR[a.status]}`}
                  >
                    {a.status}
                  </span>
                </div>

                <p className="mt-3 text-[0.7rem] uppercase tracking-[0.14em] text-ink-faint">
                  {a.origin}
                </p>

                <p className="mt-4 flex-1 text-[0.86rem] leading-relaxed text-ink-soft">
                  {isOpen ? a.blurb : a.blurb.slice(0, 190).trimEnd() + "…"}
                </p>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.45, ease: EASE }}
                      className="overflow-hidden"
                    >
                      <div className="mt-5 space-y-4 border-t border-line pt-5">
                        <Detail label="How it is made" value={a.technique} />
                        <Detail label="Did you know" value={a.didYouKnow} />
                        <Detail label="Still practised by" value={a.practitioner} gold />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <button
                  onClick={() => setOpen(isOpen ? null : a.id)}
                  className="mt-5 inline-flex items-center gap-2 self-start text-[0.65rem] uppercase tracking-[0.2em] text-ink-faint transition-colors hover:text-gold"
                  aria-expanded={isOpen}
                >
                  {isOpen ? <Minus size={12} /> : <Plus size={12} />}
                  {isOpen ? "Less" : "More"}
                </button>
              </motion.article>
            );
          })}
        </AnimatePresence>
      </motion.div>
    </LayoutGroup>
  );
}

function Detail({
  label,
  value,
  gold = false,
}: {
  label: string;
  value: string;
  gold?: boolean;
}) {
  return (
    <div>
      <p className="text-[0.58rem] uppercase tracking-[0.22em] text-ink-faint">
        {label}
      </p>
      <p
        className={`mt-1.5 text-[0.85rem] leading-relaxed ${gold ? "text-gold" : "text-ink-soft"}`}
      >
        {value}
      </p>
    </div>
  );
}
