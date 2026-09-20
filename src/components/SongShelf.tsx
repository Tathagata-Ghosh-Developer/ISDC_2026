"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Play } from "lucide-react";
import type { Collection } from "@/lib/content/music";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * The songs are embedded from the rights holder's own upload, never
 * hosted here. Nothing loads from YouTube until a visitor presses play
 * on a specific track, so the page costs no third-party requests and
 * sets no cookies just by being opened.
 */
export default function SongShelf({
  collections,
  onPlayingChange,
}: {
  collections: Collection[];
  /** So the sound desk can step back while a song is on. */
  onPlayingChange?: (playing: boolean) => void;
}) {
  const [active, setActive] = useState(collections[0]?.id ?? "");
  const [playing, setPlaying] = useState<string | null>(null);

  function play(id: string | null) {
    setPlaying(id);
    onPlayingChange?.(id !== null);
  }

  const collection =
    collections.find((c) => c.id === active) ?? collections[0];

  if (!collection) return null;

  return (
    <div>
      {/* ---- the shelves ---- */}
      <div className="sticky top-[3.6rem] z-30 -mx-5 mb-8 border-y border-line bg-paper/90 px-5 py-2.5 backdrop-blur-xl md:-mx-8 md:px-8">
        <div className="flex gap-1 overflow-x-auto">
          {collections.map((c) => (
            <button
              key={c.id}
              onClick={() => {
                setActive(c.id);
                play(null);
              }}
              className={`relative shrink-0 whitespace-nowrap px-3 py-2 text-left transition-colors ${
                c.id === active ? "text-sindoor" : "text-ink-faint hover:text-ink"
              }`}
            >
              <span className="bangla-display block text-[1.05rem]">
                {c.bangla}
              </span>
              <span className="block text-[0.58rem] uppercase tracking-[0.16em]">
                {c.tracks.length} songs
              </span>
              {c.id === active && (
                <motion.span
                  layoutId="shelf-underline"
                  className="absolute inset-x-3 -bottom-0.5 h-0.5 bg-sindoor"
                />
              )}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={collection.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.4, ease: EASE }}
        >
          <p className="lede mb-7 max-w-[68ch] text-[0.95rem]">
            {collection.blurb}
          </p>

          <ul className="grid gap-4 lg:grid-cols-2">
            {collection.tracks.map((t) => {
              const open = playing === t.youtubeId;
              return (
                <li key={t.youtubeId} className="surface overflow-hidden">
                  {open ? (
                    <div className="relative aspect-video w-full bg-ink">
                      <iframe
                        src={`https://www.youtube-nocookie.com/embed/${t.youtubeId}?autoplay=1&rel=0`}
                        title={`${t.titleRoman} by ${t.artist}`}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        loading="lazy"
                        className="absolute inset-0 h-full w-full border-0"
                      />
                    </div>
                  ) : (
                    <button
                      onClick={() => play(t.youtubeId)}
                      className="group flex w-full items-start gap-4 p-5 text-left"
                    >
                      <span className="mt-1 grid h-10 w-10 shrink-0 place-items-center rounded-full border border-line text-gold transition-colors group-hover:border-gold group-hover:bg-gold group-hover:text-paper-3">
                        <Play size={14} />
                      </span>
                      <span className="min-w-0">
                        <span className="bangla-display block text-[1.15rem] leading-snug text-ink">
                          {t.titleBangla}
                        </span>
                        <span className="block text-[0.85rem] text-ink-soft">
                          {t.titleRoman}
                        </span>
                        <span className="mt-1 block text-[0.72rem] uppercase tracking-[0.14em] text-gold">
                          {t.artist}
                          {t.year ? `, ${t.year}` : ""}
                        </span>
                        <span className="mt-2.5 block text-[0.8rem] leading-relaxed text-ink-soft">
                          {t.note}
                        </span>
                      </span>
                    </button>
                  )}

                  <p className="border-t border-line px-5 py-2.5 text-[0.62rem] uppercase tracking-[0.16em] text-ink-faint">
                    {t.channel}
                  </p>
                </li>
              );
            })}
          </ul>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
