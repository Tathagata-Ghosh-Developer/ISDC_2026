"use client";

import { useState } from "react";
import Desk from "./Desk";
import Wireless from "./Wireless";
import type { AmbienceLayer, Collection } from "@/lib/content/music";

/**
 * Holds the desk and the wireless together, because the one thing the
 * reference site gets wrong is letting both play at full level into
 * the same pair of speakers. Here a song ducks the room, not the room
 * the song.
 */
export default function ListeningRoom({
  layers,
  collections,
}: {
  layers: (AmbienceLayer & { src: string; local: boolean })[];
  collections: Collection[];
}) {
  const [started, setStarted] = useState(false);
  const [songPlaying, setSongPlaying] = useState(false);

  return (
    <>
      <div id="wireless">
        <Wireless collections={collections} onPlayingChange={setSongPlaying} />
      </div>

      <div id="desk" className="mt-[4.236rem]">
        <div className="mb-6 flex flex-wrap items-baseline justify-between gap-3 border-b border-line pb-4">
          <div>
            <h2 className="bangla-display text-[1.618rem] text-ink">আবহ</h2>
            <p className="font-display text-[1.05rem] text-ink-soft">
              The sound desk
            </p>
          </div>
          <p className="max-w-[52ch] text-[0.78rem] leading-relaxed text-ink-faint">
            Underneath the songs, the room itself. Twelve recordings on twelve
            faders. Nothing plays until you press the disc.
          </p>
        </div>

        <Desk
          layers={layers}
          started={started}
          onStarted={() => setStarted(true)}
          ducked={songPlaying}
        />
      </div>
    </>
  );
}
