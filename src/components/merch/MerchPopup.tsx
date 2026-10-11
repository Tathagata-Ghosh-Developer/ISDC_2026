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

   Native <dialog>: Escape, focus and the backdrop are the browser's.
   It waits for the arrival sequence to finish (Arrival dispatches
   "isdc-arrived"), and gives up waiting after nine seconds in case
   the sequence never played on this page. Pages where someone is
   paying, reading a receipt or working the console are left alone.
   ================================================================ */

const SEEN = "isdc-merch-seen";
const ARRIVED = "isdc-arrived-putul";
const PARTNER = PARTNERS.find((p) => p.id === "merchandise");

/**
 * The off switch: NEXT_PUBLIC_MERCH_POPUP=off in Vercel, then redeploy.
 * For the night the request budget runs short; the merchandise page
 * and the home section stay up either way.
 */
const ENABLED = process.env.NEXT_PUBLIC_MERCH_POPUP !== "off";

export default function MerchPopup({ waitForArrival = true }: { waitForArrival?: boolean }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

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
      className="m-auto w-[min(96vw,1040px)] max-w-none overflow-hidden border border-line bg-paper p-0 text-ink shadow-2xl backdrop:bg-[#0b0709]/70 backdrop:backdrop-blur-sm"
    >
      {/* First in the dialog, so it is what the browser focuses on
          open: focusing the Buy link instead scrolled a phone past the
          title and price. */}
      <button
        type="button"
        onClick={() => setOpen(false)}
        aria-label="Close"
        className="absolute right-3 top-3 z-10 grid h-10 w-10 place-items-center rounded-full bg-black/35 text-white backdrop-blur-sm transition-colors hover:bg-black/55"
      >
        <X size={18} />
      </button>
      <div className="flex max-h-[92dvh] flex-col overflow-y-auto lg:grid lg:grid-cols-[1.3fr_1fr]">
        <MerchStage eager className="aspect-square w-full shrink-0 sm:aspect-[4/3] lg:aspect-auto lg:min-h-[580px]" />

        <div className="flex flex-col p-6 sm:p-8">
          <p className="eyebrow">শারদ সম্ভার Official merchandise</p>
          <h2 id="merch-popup-title" className="font-display mt-3 text-[2.058rem] font-normal leading-[1.1] text-ink">
            {MERCH.title}
          </h2>
          <p className="bangla-display mt-1 text-[1.272rem] text-sindoor">{MERCH.lineBangla}</p>
          <p className="mt-4 text-[0.92rem] leading-relaxed text-ink-soft">
            {MERCH.line}, in {MERCH.colour.toLowerCase()}, is on sale now. Durga in alpona on the front, দেবী in
            gold on the back.
          </p>

          <dl className="mt-5 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-[0.82rem]">
            <dt className="text-ink-faint">Price</dt>
            <dd className="font-display text-[1.1rem] text-ink">₹{MERCH.price}</dd>
            <dt className="text-ink-faint">Fit</dt>
            <dd className="text-ink-soft">{MERCH.fits.join(" or ")}</dd>
            <dt className="text-ink-faint">Sizes</dt>
            <dd className="text-ink-soft">{MERCH.sizes.join(", ")}</dd>
          </dl>
          <p className="mt-4 border-l-2 border-gold pl-3 text-[0.78rem] leading-relaxed text-ink-soft">
            {MERCH.delivery}
          </p>

          <div className="mt-6 flex flex-col gap-2.5">
            <a href={MERCH.url} target="_blank" rel="noopener noreferrer" className="btn btn-primary w-full">
              Buy on Meme Theory <ArrowUpRight size={14} />
            </a>
            <Link href="/merch" onClick={() => setOpen(false)} className="btn btn-ghost w-full">
              See it up close
            </Link>
          </div>

          {PARTNER && (
            <div className="mt-auto flex items-center gap-3 border-t border-line pt-5 text-[0.7rem] leading-relaxed text-ink-faint">
              <Image src={PARTNER.logo} alt="" width={36} height={36} className="shrink-0 rounded-full" />
              <p>
                Made, sold and delivered by our merchandise partner, {PARTNER.name}, under their{" "}
                <a href={MERCH.terms} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-gold">
                  terms
                </a>{" "}
                and{" "}
                <a href={MERCH.refunds} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-gold">
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
