"use client";

import { useState } from "react";
import Desk from "./Desk";
import SongShelf from "@/components/SongShelf";
import type { AmbienceLayer, Collection } from "@/lib/content/music";

/**
 * Holds the desk and the shelves together, because the one thing the
 * reference site gets wrong is letting both play at full level into the
 * same pair of speakers. Here a song ducks the room rather than the
 * other way round.
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
      <div id="desk">
        <Desk
          layers={layers}
          started={started}
          onStarted={() => setStarted(true)}
          ducked={songPlaying}
        />
      </div>

      <div id="shelves" className="mt-[4.236rem]">
        <SongShelf
          collections={collections}
          onPlayingChange={setSongPlaying}
        />
      </div>
    </>
  );
}
