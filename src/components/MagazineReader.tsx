"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Loader2,
  Maximize2,
  Minimize2,
} from "lucide-react";

/* ================================================================
   A magazine, not a PDF viewer.

   Pages are rendered to canvas with pdf.js and turned like paper: the
   leaf rotates about the spine, catches a shadow as it lifts, and
   settles on the other side. Two pages to a spread on a wide screen,
   one on a phone.

   Only the pages either side of where you are get rendered, so a
   seventy page issue does not arrive all at once.
   ================================================================ */

type Doc = {
  numPages: number;
  getPage: (n: number) => Promise<PdfPage>;
};

type PdfPage = {
  getViewport: (o: { scale: number }) => { width: number; height: number };
  render: (o: {
    canvasContext: CanvasRenderingContext2D;
    viewport: { width: number; height: number };
  }) => { promise: Promise<void>; cancel: () => void };
};

const EASE = [0.22, 1, 0.36, 1] as const;

export default function MagazineReader({
  file,
  title,
}: {
  file: string;
  title: string;
}) {
  const [doc, setDoc] = useState<Doc | null>(null);
  const [pages, setPages] = useState(0);
  const [index, setIndex] = useState(0);
  const [spread, setSpread] = useState(false);
  const [wide, setWide] = useState(false);
  const [dir, setDir] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const reduce = useReducedMotion();
  const host = useRef<HTMLDivElement>(null);

  /* ---- load the document ---- */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const pdfjs = await import("pdfjs-dist");
        pdfjs.GlobalWorkerOptions.workerSrc = new URL(
          "pdfjs-dist/build/pdf.worker.min.mjs",
          import.meta.url,
        ).toString();

        const loaded = await pdfjs.getDocument({
          url: file,
          disableAutoFetch: true,
          disableStream: false,
        }).promise;

        if (cancelled) return;
        setDoc(loaded as unknown as Doc);
        setPages(loaded.numPages);
      } catch (err) {
        if (!cancelled) {
          console.error("[magazine]", err);
          setError(
            "The reader could not open this issue. The download link below still works.",
          );
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [file]);

  /* ---- one page or two ---- */
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 900px)");
    const sync = () => {
      setWide(mq.matches);
      setSpread(mq.matches);
    };
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const step = spread ? 2 : 1;
  const last = Math.max(0, pages - 1);

  const go = useCallback(
    (by: number) => {
      setDir(by);
      setIndex((i) => Math.min(last, Math.max(0, i + by * step)));
    },
    [last, step],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  const visible = spread
    ? [index, index + 1].filter((n) => n < pages)
    : [index];

  return (
    <div ref={host}>
      <div className="surface relative overflow-hidden">
        {/* ---- the spread ---- */}
        <div
          className="relative flex min-h-[26rem] items-center justify-center bg-[#171014] p-4 sm:min-h-[34rem] sm:p-8"
          style={{ perspective: 2000 }}
        >
          {!doc && !error && (
            <p className="flex flex-col items-center gap-3 text-[0.8rem] text-[#f0dcc0]/60">
              <Loader2 size={20} className="animate-spin" />
              Opening {title}
            </p>
          )}

          {error && (
            <p className="max-w-[40ch] text-center text-[0.85rem] leading-relaxed text-[#f0dcc0]/70">
              {error}
            </p>
          )}

          {doc && (
            <div className="flex w-full items-stretch justify-center gap-0">
              <AnimatePresence mode="popLayout" initial={false}>
                {visible.map((n) => (
                  <motion.div
                    key={n}
                    initial={
                      reduce
                        ? { opacity: 0 }
                        : { rotateY: dir > 0 ? -84 : 84, opacity: 0 }
                    }
                    animate={{ rotateY: 0, opacity: 1 }}
                    exit={
                      reduce
                        ? { opacity: 0 }
                        : { rotateY: dir > 0 ? 84 : -84, opacity: 0 }
                    }
                    transition={{ duration: 0.62, ease: EASE }}
                    style={{
                      transformStyle: "preserve-3d",
                      transformOrigin: spread
                        ? n % 2 === 0
                          ? "right center"
                          : "left center"
                        : "center center",
                    }}
                    className="relative max-w-[min(100%,34rem)] flex-1"
                  >
                    <PageCanvas doc={doc} page={n + 1} />
                    {/* the shadow that falls into the gutter */}
                    {spread && (
                      <span
                        aria-hidden
                        className="pointer-events-none absolute inset-y-0 w-10"
                        style={{
                          [n % 2 === 0 ? "right" : "left"]: 0,
                          background:
                            n % 2 === 0
                              ? "linear-gradient(90deg, transparent, rgba(0,0,0,0.38))"
                              : "linear-gradient(270deg, transparent, rgba(0,0,0,0.38))",
                        }}
                      />
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          {/* ---- turn ---- */}
          {doc && (
            <>
              <button
                onClick={() => go(-1)}
                disabled={index === 0}
                aria-label="Previous page"
                className="absolute left-1 grid h-11 w-11 place-items-center rounded-full text-[#f0dcc0]/70 transition-colors hover:text-[#efb44a] disabled:opacity-25 sm:left-3"
              >
                <ChevronLeft size={26} />
              </button>
              <button
                onClick={() => go(1)}
                disabled={index + step > last}
                aria-label="Next page"
                className="absolute right-1 grid h-11 w-11 place-items-center rounded-full text-[#f0dcc0]/70 transition-colors hover:text-[#efb44a] disabled:opacity-25 sm:right-3"
              >
                <ChevronRight size={26} />
              </button>
            </>
          )}
        </div>

        {/* ---- controls ---- */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-5 py-3.5">
          <span className="text-[0.7rem] uppercase tracking-[0.2em] text-ink-faint">
            {pages > 0
              ? `Page ${index + 1}${spread && index + 1 < pages ? ` and ${index + 2}` : ""} of ${pages}`
              : "Loading"}
          </span>

          <div className="flex flex-wrap items-center gap-2">
            {wide && (
              <button
                onClick={() => setSpread((v) => !v)}
                className="btn btn-ghost !py-1.5 !text-[0.62rem]"
              >
                {spread ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
                {spread ? "Single page" : "Two pages"}
              </button>
            )}
            <a
              href={file}
              download
              className="btn btn-ghost !py-1.5 !text-[0.62rem]"
            >
              <Download size={12} /> Download
            </a>
          </div>
        </div>

        {/* ---- the page rail ---- */}
        {pages > 0 && (
          <div className="border-t border-line px-5 py-3">
            <input
              type="range"
              min={0}
              max={last}
              step={step}
              value={index}
              onChange={(e) => {
                const next = Number(e.target.value);
                setDir(next > index ? 1 : -1);
                setIndex(next);
              }}
              aria-label="Jump to page"
              className="w-full accent-[var(--c-sindoor)]"
            />
          </div>
        )}
      </div>
    </div>
  );
}

/** Renders one page to a canvas, at the density the screen actually has. */
function PageCanvas({ doc, page }: { doc: Doc; page: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let task: { promise: Promise<void>; cancel: () => void } | null = null;
    let cancelled = false;

    (async () => {
      const p = await doc.getPage(page);
      if (cancelled) return;

      const canvas = ref.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const base = p.getViewport({ scale: 1 });
      const width = canvas.parentElement?.clientWidth ?? 600;
      const scale = (width / base.width) * dpr;
      const viewport = p.getViewport({ scale });

      canvas.width = Math.floor(viewport.width);
      canvas.height = Math.floor(viewport.height);
      canvas.style.width = "100%";
      canvas.style.height = "auto";

      task = p.render({ canvasContext: ctx, viewport });
      try {
        await task.promise;
        if (!cancelled) setReady(true);
      } catch {
        /* superseded by a newer render */
      }
    })();

    return () => {
      cancelled = true;
      task?.cancel();
    };
  }, [doc, page]);

  return (
    <div className="relative w-full bg-[#0f0b0d]">
      <canvas
        ref={ref}
        className={`block w-full transition-opacity duration-500 ${ready ? "opacity-100" : "opacity-0"}`}
      />
      {!ready && (
        <span className="absolute inset-0 grid place-items-center">
          <Loader2 size={16} className="animate-spin text-[#f0dcc0]/40" />
        </span>
      )}
    </div>
  );
}
