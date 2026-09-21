"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Loader2,
  Pause,
  Play,
  Shuffle,
  SkipBack,
  SkipForward,
} from "lucide-react";
import { loadYouTubeApi, type YTPlayer } from "@/lib/youtube";
import type { Collection, Track } from "@/lib/content/music";

/* ================================================================
   এখন বাজছে, the part that plays by itself.

   A shelf is chosen by the clock in Kolkata, the way a barbershop
   radio is: the pre dawn recitation at four, Agomoni through the
   morning, the riverbank in the afternoon, the city in the evening,
   and the funny ones once the adda starts. You press one button and
   it keeps going, which is the whole idea. Skip, shuffle, or pick a
   shelf yourself if you would rather.

   Nothing is hosted here. Every track plays from the rights holder's
   own upload through their player, which is also the only way the
   artists see any of it.
   ================================================================ */


/** The hour in Kolkata, whatever clock the visitor is on. */
function kolkataHour(): number {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    hour: "numeric",
    minute: "numeric",
    hour12: false,
  }).formatToParts(new Date());
  const h = Number(parts.find((p) => p.type === "hour")?.value ?? 12);
  const m = Number(parts.find((p) => p.type === "minute")?.value ?? 0);
  return h + m / 60;
}

const SLOTS: { from: number; to: number; shelf: string; label: string; bangla: string }[] =
  [
    { from: 3.5, to: 6, shelf: "mahalaya", label: "Before dawn", bangla: "ভোরবেলা" },
    { from: 6, to: 11, shelf: "agomoni-bijoya", label: "Morning", bangla: "সকাল" },
    { from: 11, to: 16, shelf: "village", label: "Afternoon by the river", bangla: "দুপুর" },
    { from: 16, to: 20, shelf: "city", label: "Evening in the city", bangla: "সন্ধ্যা" },
    { from: 20, to: 22.5, shelf: "funny", label: "Adda hours", bangla: "আড্ডার সময়" },
    { from: 22.5, to: 23.99, shelf: "adhunik", label: "Late, and quieter", bangla: "রাতের গান" },
  ];

function slotNow() {
  const h = kolkataHour();
  return (
    SLOTS.find((s) => h >= s.from && h < s.to) ?? {
      from: 23.5,
      to: 3.5,
      shelf: "adhunik",
      label: "Late night",
      bangla: "গভীর রাত",
    }
  );
}

export default function Wireless({
  collections,
  onPlayingChange,
}: {
  collections: Collection[];
  onPlayingChange?: (playing: boolean) => void;
}) {
  const [slot, setSlot] = useState(() => slotNow());
  const [shelfId, setShelfId] = useState<string>(() => slotNow().shelf);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [booting, setBooting] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [auto, setAuto] = useState(true);

  const player = useRef<YTPlayer | null>(null);
  const mount = useRef<HTMLDivElement>(null);

  const shelf = useMemo(
    () => collections.find((c) => c.id === shelfId) ?? collections[0],
    [collections, shelfId],
  );
  const track: Track | undefined = shelf?.tracks[index];

  /* ---- the clock moves, and so does the shelf, until you choose ---- */
  useEffect(() => {
    const id = setInterval(() => {
      const next = slotNow();
      setSlot(next);
      if (auto) setShelfId((cur) => (cur === next.shelf ? cur : next.shelf));
    }, 60_000);
    return () => clearInterval(id);
  }, [auto]);

  useEffect(() => {
    onPlayingChange?.(playing);
  }, [playing, onPlayingChange]);

  const advance = useCallback(
    (by: number) => {
      if (!shelf) return;
      const n = shelf.tracks.length;
      setIndex((i) =>
        shuffle ? Math.floor(Math.random() * n) : (i + by + n) % n,
      );
    },
    [shelf, shuffle],
  );

  /* ---- load the track whenever it changes ---- */
  useEffect(() => {
    if (!player.current || !track) return;
    player.current.loadVideoById({ videoId: track.youtubeId });
  }, [track]);

  async function start(at?: number) {
    if (typeof at === "number") setIndex(at);
    if (player.current) {
      player.current.playVideo();
      setPlaying(true);
      return;
    }

    setBooting(true);
    await loadYouTubeApi();
    const first = shelf?.tracks[typeof at === "number" ? at : index];
    if (!window.YT?.Player || !mount.current || !first) {
      setBooting(false);
      return;
    }

    player.current = new window.YT.Player(mount.current, {
      videoId: first.youtubeId,
      playerVars: { rel: 0, playsinline: 1 },
      events: {
        onReady: (e: { target: YTPlayer }) => {
          e.target.playVideo();
          setPlaying(true);
          setBooting(false);
        },
        onStateChange: (e: { data: number }) => {
          const S = window.YT?.PlayerState;
          if (S && e.data === S.ENDED) advance(1);
          if (S && e.data === S.PLAYING) setPlaying(true);
          if (S && e.data === S.PAUSED) setPlaying(false);
        },
        onError: () => advance(1),
      },
    });
  }

  function toggle() {
    if (!player.current) return void start();
    if (playing) {
      player.current.pauseVideo();
      setPlaying(false);
    } else {
      player.current.playVideo();
      setPlaying(true);
    }
  }

  useEffect(
    () => () => {
      player.current?.destroy();
    },
    [],
  );

  if (!shelf) return null;

  return (
    <div className="surface overflow-hidden">
      {/* ---------- now playing ---------- */}
      <div className="grid gap-px bg-line md:grid-cols-[1.618fr_1fr]">
        <div className="bg-paper p-6 sm:p-8">
          <p className="eyebrow">এখন বাজছে Now playing</p>

          <div className="mt-2 flex flex-wrap items-baseline gap-x-3">
            <span className="bangla-display text-[1.272rem] text-sindoor">
              {slot.bangla}
            </span>
            <span className="text-[0.68rem] uppercase tracking-[0.2em] text-ink-faint">
              {slot.label} in Kolkata
            </span>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={track?.youtubeId ?? "none"}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35 }}
              className="mt-5"
            >
              <h3 className="bangla-display text-[1.618rem] leading-tight text-ink sm:text-[2.058rem]">
                {track?.titleBangla}
              </h3>
              <p className="font-display mt-1 text-[1.1rem] text-ink-soft">
                {track?.titleRoman}
              </p>
              <p className="mt-2 text-[0.75rem] uppercase tracking-[0.16em] text-gold">
                {track?.artist}
                {track?.year ? `, ${track.year}` : ""}
              </p>
              <p className="mt-3 max-w-[52ch] text-[0.85rem] leading-relaxed text-ink-soft">
                {track?.note}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* the transport, deliberately large */}
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <button
              onClick={() => advance(-1)}
              aria-label="Previous"
              className="grid h-11 w-11 place-items-center border border-line text-ink-soft transition-colors hover:border-gold hover:text-gold"
            >
              <SkipBack size={16} />
            </button>

            <button
              onClick={toggle}
              aria-label={playing ? "Pause" : "Play"}
              className="grid h-16 w-16 place-items-center rounded-full bg-sindoor text-paper-3 transition-transform duration-300 hover:scale-105"
            >
              {booting ? (
                <Loader2 size={22} className="animate-spin" />
              ) : playing ? (
                <Pause size={22} />
              ) : (
                <Play size={22} />
              )}
            </button>

            <button
              onClick={() => advance(1)}
              aria-label="Next"
              className="grid h-11 w-11 place-items-center border border-line text-ink-soft transition-colors hover:border-gold hover:text-gold"
            >
              <SkipForward size={16} />
            </button>

            <button
              onClick={() => setShuffle((s) => !s)}
              className={`btn btn-ghost !py-2 !text-[0.62rem] ${shuffle ? "!border-gold !text-gold" : ""}`}
            >
              <Shuffle size={12} /> {shuffle ? "Shuffling" : "In order"}
            </button>
          </div>

          <p className="mt-4 text-[0.68rem] leading-relaxed text-ink-faint">
            Press once and it keeps going. Track {index + 1} of{" "}
            {shelf.tracks.length} on this shelf.
            {auto && " The shelf follows the clock in Kolkata until you pick one yourself."}
          </p>
        </div>

        {/* the player, visible as the API requires */}
        <div className="bg-[#0f0b09] p-4">
          <div className="aspect-video w-full">
            <div ref={mount} className="h-full w-full" />
          </div>
          <p className="mt-3 text-center text-[0.6rem] uppercase tracking-[0.18em] text-ink-faint">
            {track?.channel}
          </p>
        </div>
      </div>

      {/* ---------- the shelves ---------- */}
      <div className="flex gap-1 overflow-x-auto border-t border-line px-4 py-3">
        {collections.map((c) => {
          const on = c.id === shelfId;
          const isNow = c.id === slot.shelf;
          return (
            <button
              key={c.id}
              onClick={() => {
                setShelfId(c.id);
                setIndex(0);
                setAuto(false);
              }}
              className={`relative shrink-0 px-3 py-2 text-left transition-colors ${
                on ? "text-sindoor" : "text-ink-faint hover:text-ink"
              }`}
            >
              <span className="bangla-display block text-[1.05rem] leading-tight">
                {c.bangla}
              </span>
              <span className="block text-[0.56rem] uppercase tracking-[0.14em]">
                {isNow ? "on now" : `${c.tracks.length} songs`}
              </span>
              {on && (
                <motion.span
                  layoutId="wireless-underline"
                  className="absolute inset-x-3 bottom-0.5 h-0.5 bg-sindoor"
                />
              )}
            </button>
          );
        })}
      </div>

      {/* ---------- the tracks on this shelf ---------- */}
      <ol className="max-h-[22rem] divide-y divide-line overflow-y-auto border-t border-line">
        {shelf.tracks.map((t, i) => (
          <li key={t.youtubeId}>
            <button
              onClick={() => start(i)}
              className={`flex w-full items-baseline gap-4 px-5 py-3 text-left transition-colors hover:bg-paper-2/60 ${
                i === index ? "bg-paper-2/70" : ""
              }`}
            >
              <span
                className={`w-6 shrink-0 text-right font-display text-[0.85rem] tabular-nums ${
                  i === index ? "text-sindoor" : "text-ink-faint"
                }`}
              >
                {i + 1}
              </span>
              <span className="min-w-0 flex-1">
                <span className="bangla-display block truncate text-[1rem] text-ink">
                  {t.titleBangla}
                </span>
                <span className="block truncate text-[0.72rem] text-ink-faint">
                  {t.titleRoman}
                </span>
              </span>
              <span className="shrink-0 text-[0.65rem] uppercase tracking-[0.12em] text-ink-faint">
                {t.artist.split(",")[0]}
              </span>
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}
