"use client";

import { useEffect, useState, useSyncExternalStore, type CSSProperties, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { Share, Smartphone, SquarePlus, X } from "lucide-react";
import {
  APP_DISPLAY_MODES,
  INSTALL_CHANGED as CHANGED,
  installGuide,
  offerInstallOn,
  updateDue,
  type InstallGuide,
} from "@/lib/install";

/* ================================================================
   The installed app: registering the service worker, and the one
   quiet button that offers to install.

   There is no popup and no banner. The button sits in the footer and
   in the phone menu, appears only where installing is actually
   possible, and is gone inside the installed app and on the console.

   Chrome hands over its install prompt once, in an event that can fire
   before React has hydrated, so the layout catches it with a few lines
   in <head> (INSTALL_BOOT, in src/lib/install.ts) and parks it on
   window.__isdcInstall. This file reads it from there.
   ================================================================ */

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

declare global {
  interface Window {
    __isdcInstall?: InstallPromptEvent | null;
  }
}

type Mode = "none" | "prompt" | InstallGuide;

function runningAsApp(): boolean {
  if ((navigator as Navigator & { standalone?: boolean }).standalone === true) return true;
  return APP_DISPLAY_MODES.some((m) => window.matchMedia(`(display-mode: ${m})`).matches);
}

function currentMode(): Mode {
  const w = window as Window & { __isdcInstalled?: boolean };
  if (w.__isdcInstalled || runningAsApp()) return "none";
  if (w.__isdcInstall) return "prompt";
  return installGuide(navigator.userAgent, navigator.maxTouchPoints) ?? "none";
}

function subscribe(onChange: () => void) {
  const standalone = window.matchMedia("(display-mode: standalone)");
  window.addEventListener(CHANGED, onChange);
  standalone.addEventListener("change", onChange);
  return () => {
    window.removeEventListener(CHANGED, onChange);
    standalone.removeEventListener("change", onChange);
  };
}

function useInstallMode(): Mode {
  return useSyncExternalStore(subscribe, currentMode, () => "none");
}

/* ---------------------------------------------------------------- */

let lastUpdateCheck = 0;

function checkForUpdate() {
  const now = Date.now();
  if (!updateDue(lastUpdateCheck, now)) return;
  lastUpdateCheck = now;
  navigator.serviceWorker
    .getRegistration()
    .then((r) => r?.update())
    .catch(() => {});
}

/**
 * Registers /sw.js in production. In development it removes any worker
 * a production build left on localhost, so a stale cache can never
 * stand between a developer and their own changes.
 */
export function ServiceWorkerRegistration() {
  const pathname = usePathname();

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    if (process.env.NODE_ENV !== "production") {
      navigator.serviceWorker
        .getRegistrations()
        .then((all) => all.forEach((r) => r.unregister()))
        .catch(() => {});
      return;
    }
    const register = () => {
      lastUpdateCheck = Date.now();
      navigator.serviceWorker
        .register("/sw.js", { scope: "/", updateViaCache: "none" })
        .catch(() => {});
    };
    // After the page has loaded, so the worker's first downloads never
    // compete with the page the visitor is waiting for.
    if (document.readyState === "complete") register();
    else window.addEventListener("load", register, { once: true });

    // An installed app can stay open for days. Coming back to it is
    // the natural moment to look for a new worker.
    const onVisible = () => {
      if (document.visibilityState === "visible") checkForUpdate();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.removeEventListener("load", register);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  // In-app navigation never reloads the page, so the browser's own
  // update check never runs. Ask on route changes, at most every ten
  // minutes.
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    checkForUpdate();
  }, [pathname]);

  return null;
}

/* ---------------------------------------------------------------- */

/**
 * "Install the app". Renders nothing unless this browser can install
 * the site, nothing inside the installed app, and nothing on /admin.
 */
export function InstallAppButton({
  variant,
  style,
}: {
  variant: "footer" | "drawer";
  style?: CSSProperties;
}) {
  const pathname = usePathname();
  const mode = useInstallMode();
  const [guide, setGuide] = useState<InstallGuide | null>(null);

  if (mode === "none" || !offerInstallOn(pathname)) return null;

  async function onClick() {
    if (mode !== "prompt") {
      setGuide(mode as InstallGuide);
      return;
    }
    const prompt = window.__isdcInstall;
    if (!prompt) return;
    // The event can be used once. Whatever the answer, the button goes,
    // and comes back only if Chrome offers again on a later visit.
    window.__isdcInstall = null;
    try {
      await prompt.prompt();
      await prompt.userChoice;
    } catch {
      /* already used, or the browser withdrew it */
    }
    window.dispatchEvent(new Event(CHANGED));
  }

  const button =
    variant === "drawer" ? (
      <button type="button" onClick={onClick} className="btn btn-ghost mt-3 w-full" style={style}>
        <Smartphone size={15} aria-hidden /> Install the app
      </button>
    ) : (
      <div className="mt-8" style={style}>
        <button type="button" onClick={onClick} className="btn btn-ghost !px-4 !py-2.5 !text-[0.66rem]">
          <Smartphone size={14} aria-hidden /> Install the app
        </button>
        <p className="mt-2 max-w-[36ch] text-[0.72rem] leading-relaxed text-ink-faint">
          Opens from its own icon, and keeps the schedule and the map for a weak signal at the pandal.
        </p>
      </div>
    );

  return (
    <>
      {button}
      {guide && <GuideSheet guide={guide} onClose={() => setGuide(null)} />}
    </>
  );
}

/* ---------------------------------------------------------------- */

function Step({ n, icon, children }: { n: number; icon?: ReactNode; children: ReactNode }) {
  return (
    <li className="flex items-start gap-4">
      <span className="font-display mt-0.5 w-4 shrink-0 text-[1.1rem] leading-none text-gold">{n}</span>
      <span className="flex-1 text-[0.92rem] leading-relaxed text-ink-soft">{children}</span>
      {icon && (
        <span
          className="grid h-10 w-10 shrink-0 place-items-center border border-line bg-paper text-indigo"
          aria-hidden
        >
          {icon}
        </span>
      )}
    </li>
  );
}

/**
 * The written guide for Safari, which has no install prompt to call.
 * A native <dialog>: Escape, focus and the backdrop are the browser's.
 * Portalled to <body> so the phone menu's fading never reaches it.
 */
function GuideSheet({ guide, onClose }: { guide: InstallGuide; onClose: () => void }) {
  const mac = guide === "mac-safari";

  return createPortal(
    <dialog
      ref={(d) => {
        if (d && !d.open) d.showModal();
      }}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      aria-labelledby="install-guide-title"
      className="mx-auto mb-0 mt-auto w-full max-w-[30rem] border-0 border-t-2 bg-paper-3 p-0 text-ink backdrop:bg-[#120d10]/60 backdrop:backdrop-blur-sm sm:mb-auto sm:border-2"
      // Inline, because the unlayered "* { border-color }" in globals.css
      // outranks Tailwind's border-colour utilities.
      style={{ borderColor: "var(--c-gold)" }}
    >
      <div className="relative px-6 pb-[max(1.75rem,env(safe-area-inset-bottom))] pt-6">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full border border-line text-ink-soft transition-colors hover:border-gold hover:text-gold"
        >
          <X size={16} />
        </button>

        <p className="bangla-display pr-12 text-[1.25rem] leading-tight text-sindoor" lang="bn">
          {mac ? "ডকে রাখুন" : "হোম স্ক্রিনে রাখুন"}
        </p>
        <h2 id="install-guide-title" className="font-display mt-1 pr-12 text-[1.5rem] leading-tight text-ink">
          {mac ? "Keep it in your Dock" : "Add it to your Home Screen"}
        </h2>

        <ol className="mt-6 space-y-5">
          {guide === "ios-in-app" && (
            <Step n={1}>
              Open this page in <strong className="font-medium text-ink">Safari</strong> first: tap the{" "}
              <strong className="font-medium text-ink">⋯</strong> menu, then{" "}
              <strong className="font-medium text-ink">Open in browser</strong>.
            </Step>
          )}
          {mac ? (
            <>
              <Step n={1}>
                In the menu bar, open <strong className="font-medium text-ink">File</strong>.
              </Step>
              <Step n={2} icon={<SquarePlus size={18} strokeWidth={1.75} />}>
                Choose <strong className="font-medium text-ink">Add to Dock</strong>, then{" "}
                <strong className="font-medium text-ink">Add</strong>. The Puja opens in its own window from then on.
              </Step>
            </>
          ) : (
            <>
              <Step n={guide === "ios-in-app" ? 2 : 1} icon={<Share size={18} strokeWidth={1.75} />}>
                Tap <strong className="font-medium text-ink">Share</strong>. In Safari it is in the bar at the
                bottom (at the top on an iPad); in Chrome, beside the address.
              </Step>
              <Step n={guide === "ios-in-app" ? 3 : 2} icon={<SquarePlus size={18} strokeWidth={1.75} />}>
                Scroll down and choose <strong className="font-medium text-ink">Add to Home Screen</strong>.
              </Step>
              <Step n={guide === "ios-in-app" ? 4 : 3}>
                Tap <strong className="font-medium text-ink">Add</strong>. The Puja then opens from its own icon,
                without the browser around it.
              </Step>
            </>
          )}
        </ol>
      </div>
    </dialog>,
    document.body,
  );
}
