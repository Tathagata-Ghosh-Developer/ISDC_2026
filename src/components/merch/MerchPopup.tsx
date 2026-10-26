"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowUpRight, X } from "lucide-react";
import { MERCH, PARTNERS } from "@/lib/site";
import { shouldOffer } from "@/lib/merch";
import MerchStage from "./MerchStage";

/* ================================================================
   The official T-shirt, once per visit, just after the arrival.

   A dark product card on either theme: the floating-shirt film in a
   rounded frame, the sizes as chips that say their chest, and one
   way to buy. Native <dialog>: Escape, focus and the backdrop are the
   browser's. It waits for the arrival sequence (Arrival dispatches
   "isdc-arrived") and gives up waiting after nine seconds. Pages where
   someone is paying, reading a receipt or working the console are
   left alone.
   ================================================================ */

const SEEN = "isdc-merch-seen";
const ARRIVED = "isdc-arrived-putul";
const PARTNER = PARTNERS.find((p) => p.id === "merchandise");
/** The partner's post-Puja sale, a line under the price while it lasts. */
const SALE = MERCH.sale;

/**
 * The off switch: NEXT_PUBLIC_MERCH_POPUP=off in Vercel, then redeploy.
 * The merchandise page and the home section stay up either way.
 */
const ENABLED = process.env.NEXT_PUBLIC_MERCH_POPUP !== "off";

export default function MerchPopup({ waitForArrival = true }: { waitForArrival?: boolean }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [size, setSize] = useState<string>("M");

  useEffect(() => {
    if (!ENABLED) return;
    let seen = false;
    let arrived = !waitForArrival;
    try {
      seen = sessionStorage.getItem(SEEN) === "1";
      arrived ||= sessionStorage.getItem(ARRIVED) === "1";
    } catch {
      /* private window: offer it once per page load */
    }
    if (!shouldOffer(pathname, seen)) return;

    let timer = 0;
    const show = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setOpen(true), 700);
    };
    if (arrived) {
      show();
      return () => window.clearTimeout(timer);
    }
    window.addEventListener("isdc-arrived", show, { once: true });
    const fallback = window.setTimeout(show, 9000);
    return () => {
      window.removeEventListener("isdc-arrived", show);
      window.clearTimeout(fallback);
      window.clearTimeout(timer);
    };
  }, [pathname, waitForArrival]);

  useEffect(() => {
    if (!open) return;
    try {
      sessionStorage.setItem(SEEN, "1");
    } catch {
      /* ignore */
    }
    const root = document.documentElement;
    const before = root.style.overflow;
    root.style.overflow = "hidden";
    return () => {
      root.style.overflow = before;
    };
  }, [open]);

  if (!open) return null;
  const chest = MERCH.chart.find((c) => c.size === size)?.chest;

  return (
    <dialog
      ref={(d) => {
        if (d && !d.open) d.showModal();
      }}
      onClose={() => setOpen(false)}
      onClick={(e) => {
        if (e.target === e.currentTarget) setOpen(false);
      }}
      aria-labelledby="merch-popup-title"
      className="m-auto max-h-[calc(100dvh-1rem)] w-[min(96vw,calc(1060*var(--px)))] max-w-none overflow-hidden rounded-[28px] border border-white/10 bg-[#0d0b0c] p-0 text-[#f2e5d0] shadow-[0_40px_120px_rgba(0,0,0,0.6)] backdrop:bg-[#05070a]/75 backdrop:backdrop-blur-sm short:rounded-[20px]"
    >
      {/* First in the dialog, so it is what the browser focuses on open:
          focusing the Buy link instead scrolled a phone past the title. */}
      <button
        type="button"
        onClick={() => setOpen(false)}
        aria-label="Close"
        className="absolute right-4 top-4 z-10 grid size-10 place-items-center rounded-full bg-black/45 pointer-coarse:size-[44px] text-white backdrop-blur-sm transition-colors hover:bg-black/70"
      >
        <X size={18} />
      </button>

      {/* Side by side from a laptop up, and on a landscape phone too,
          where a square film stacked over the details was taller than
          the whole screen and the title started below it. */}
      <div className="flex max-h-[min(92dvh,calc(100dvh-1rem))] flex-col overflow-y-auto overscroll-contain p-3 sm:p-4 short:grid short:grid-cols-[minmax(0,0.8fr)_1fr] short:gap-2 short:p-2 lg:grid lg:grid-cols-[1.15fr_1fr] lg:gap-2">
        <MerchStage eager className="aspect-square w-full shrink-0 short:sticky short:top-0 short:self-start lg:self-center" />

        <div className="flex flex-col px-3 pb-3 pt-5 short:pt-3 sm:px-5 lg:py-6">
          <p className="text-[0.62rem] font-medium uppercase tracking-[0.26em] text-[#d8b45e] short:pr-12 lg:pr-12">
            Official merch · ISDC × Meme Theory
          </p>
          <h2 id="merch-popup-title" className="font-display mt-3 text-[2.3rem] font-normal leading-[1.05] sm:text-[2.6rem] short:!text-[1.9rem]">
            {MERCH.title}
          </h2>
          <p className="bangla-display mt-1 text-[1.3rem] text-[#e35b43]">{MERCH.lineBangla}</p>
          <p className="mt-4 text-[0.92rem] leading-relaxed text-[#c9b295]">
            Durga in white alpona on the front, দেবী in gold on the back, in {MERCH.colour.toLowerCase()}. Wear
            the Puja home, and keep it till next year.
          </p>

          <div className="mt-6 flex items-baseline gap-3">
            <span className="font-display text-[2rem] leading-none">₹{MERCH.price}</span>
            <span className="text-[0.75rem] text-[#93806c]">{MERCH.fits.join(" or ")} fit</span>
          </div>
          {SALE && (
            <p className="mt-3 flex flex-wrap items-baseline gap-x-2 rounded-xl border border-[#d8b45e]/40 bg-[#d8b45e]/[0.08] px-3 py-1.5 text-[0.75rem] leading-snug text-[#d8b45e]">
              <span className="bangla font-medium">{SALE.lineBangla}</span>
              <span>{SALE.line}</span>
            </p>
          )}

          <div className="mt-5">
            <p className="text-[0.62rem] uppercase tracking-[0.22em] text-[#93806c]">Size guide</p>
            <div className="mt-2 flex flex-wrap gap-2" role="radiogroup" aria-label="Size guide">
              {MERCH.chart.map((c) => (
                <button
                  key={c.size}
                  type="button"
                  role="radio"
                  aria-checked={size === c.size}
                  onClick={() => setSize(c.size)}
                  className={`min-w-[3rem] rounded-full border px-3 py-1.5 text-[0.8rem] transition-colors ${
                    size === c.size
                      ? "border-[#d8b45e] bg-[#d8b45e] text-[#0d0b0c]"
                      : "border-white/25 text-[#f2e5d0] hover:border-[#d8b45e]/70"
                  }`}
                >
                  {c.size}
                </button>
              ))}
            </div>
            <p className="mt-2 text-[0.75rem] text-[#c9b295]" aria-live="polite">
              {size}: {chest} inch chest, regular fit. You pick the size on Meme Theory.
            </p>
          </div>

          <p className="mt-5 rounded-2xl border border-white/15 bg-white/[0.04] px-4 py-3 text-[0.78rem] leading-relaxed text-[#c9b295]">
            {MERCH.delivery}
          </p>

          <div className="mt-6 flex flex-col gap-2.5">
            <a
              href={MERCH.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#e35b43] px-6 py-3.5 text-[0.78rem] font-semibold uppercase tracking-[0.2em] text-white transition-colors hover:bg-[#cf4a33]"
            >
              Buy on Meme Theory <ArrowUpRight size={15} />
            </a>
            <Link
              href="/merch"
              onClick={() => setOpen(false)}
              className="inline-flex items-center justify-center rounded-full border border-white/15 px-6 py-3 text-[0.74rem] uppercase tracking-[0.2em] text-[#f2e5d0] transition-colors hover:border-[#d8b45e]"
            >
              See it in 3D
            </Link>
          </div>

          {PARTNER && (
            <div className="mt-6 flex items-center gap-3 border-t border-white/10 pt-5 text-[0.7rem] leading-relaxed text-[#93806c]">
              <Image src={PARTNER.logo} alt="" width={36} height={36} className="shrink-0 rounded-full" />
              <p>
                Made, sold and delivered by our merchandise partner, {PARTNER.name}, under their{" "}
                <a href={MERCH.terms} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-[#d8b45e]">
                  terms
                </a>{" "}
                and{" "}
                <a href={MERCH.refunds} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-[#d8b45e]">
                  refund policy
                </a>
                . The committee takes no orders and no payment.
              </p>
            </div>
          )}
        </div>
      </div>
    </dialog>
  );
}
