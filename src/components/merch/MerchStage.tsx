"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { Box, Film } from "lucide-react";
import { useReducedMotion } from "@/lib/browser";

// three.js loads only when someone asks to turn the shirt.
const ShirtViewer = dynamic(() => import("./ShirtViewer"), { ssr: false });

/* ================================================================
   The official T-shirt, floating over kash and an October sky.

   By default a six-second loop rendered in Blender at 60 frames a
   second: the shirt was sewn and draped in a cloth solver, so the
   print folds with the fabric, and the loop has no seam. Phones get
   a 720p, 30-frame cut of the same film. With `interactive`, a button
   swaps the film for the real 3D garment to drag round.
   ================================================================ */

const M = "/media/merch/";

export default function MerchStage({
  eager = false,
  interactive = false,
  className = "",
}: {
  /** Load the film straight away (the popup); otherwise when it scrolls near. */
  eager?: boolean;
  /** Offer the drag-to-turn 3D model. */
  interactive?: boolean;
  className?: string;
}) {
  const box = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const [near, setNear] = useState(eager);
  const [mode, setMode] = useState<"film" | "3d">("film");
  const [ready3d, setReady3d] = useState(false);
  const [failed3d, setFailed3d] = useState(false);

  useEffect(() => {
    if (near || !box.current) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setNear(true);
          io.disconnect();
        }
      },
      { rootMargin: "300px" },
    );
    io.observe(box.current);
    return () => io.disconnect();
  }, [near]);

  const show3d = mode === "3d" && !failed3d;

  return (
    <div ref={box} className={`relative isolate overflow-hidden rounded-[22px] bg-[#0f2a3d] ${className}`}>
      {/* the film, or its first frame until it is wanted */}
      {near && !reduce ? (
        <video
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${show3d && ready3d ? "opacity-0" : "opacity-100"}`}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster={`${M}tee-poster-720.webp`}
          aria-label="The official T-shirt floating over a field of kash, turning gently"
        >
          <source src={`${M}tee-loop-720p30.webm`} type="video/webm" media="(max-width: 640px)" />
          <source src={`${M}tee-loop-720p30.mp4`} type="video/mp4" media="(max-width: 640px)" />
          <source src={`${M}tee-loop-1080p60.webm`} type="video/webm" />
          <source src={`${M}tee-loop-1080p60.mp4`} type="video/mp4" />
        </video>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element -- a poster frame, already sized and compressed
        <img
          src={`${M}tee-poster-720.webp`}
          alt="The official T-shirt floating over a field of kash"
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}

      {/* the real garment, over the same photograph, softened as the lens softens it */}
      {show3d && (
        <div className={`absolute inset-0 transition-opacity duration-500 ${ready3d ? "opacity-100" : "opacity-0"}`}>
          <div
            className="absolute -inset-4 bg-cover bg-center blur-[5px]"
            style={{ backgroundImage: `url(${M}kash-sky.webp)` }}
            aria-hidden
          />
          <ShirtViewer still={reduce} onReady={() => setReady3d(true)} onFail={() => setFailed3d(true)} />
        </div>
      )}

      {/* soft vignette at the edges, as in the film */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ boxShadow: "inset 0 0 90px 10px rgba(5, 12, 20, 0.45)" }}
        aria-hidden
      />

      {interactive && !failed3d && (
        <button
          type="button"
          onClick={() => setMode((m) => (m === "film" ? "3d" : "film"))}
          className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-black/45 px-3.5 py-1.5 text-[0.64rem] uppercase tracking-[0.18em] text-white backdrop-blur-sm transition-colors hover:bg-black/65"
        >
          {mode === "film" ? (
            <>
              <Box size={13} /> Turn it in 3D
            </>
          ) : (
            <>
              <Film size={13} /> {ready3d ? "Drag to turn · back to film" : "Loading the 3D shirt"}
            </>
          )}
        </button>
      )}
    </div>
  );
}
