/* ================================================================
   Installing the site as an app: the decisions, kept free of React and
   of the browser so the tests can hold them still.

   Chrome, Edge and Samsung Internet on Android and on the desktop can
   be asked to install directly (the beforeinstallprompt event). Safari
   cannot: on an iPhone or iPad it is Share, then Add to Home Screen,
   and on a Mac it is File, then Add to Dock. For those the button opens
   a short guide instead. Everywhere else there is no button at all.
   ================================================================ */

/** The written guide a browser needs, when it cannot be asked directly. */
export type InstallGuide = "ios" | "ios-in-app" | "mac-safari";

/**
 * In-app browsers on iOS (Instagram, Facebook and the like) have no
 * Add to Home Screen. The page has to be opened in Safari first.
 */
const IOS_IN_APP = /FBAN|FBAV|Instagram|LinkedInApp|Snapchat|\bLine\//;

/** Desktop and Android browsers that are not Safari, whatever their UA claims. */
const NOT_SAFARI = /Chrome|Chromium|CriOS|Edg|OPR|Firefox|FxiOS|SamsungBrowser|Android/;

/**
 * Which guide to show, from the user agent and the touch-point count.
 * iPadOS reports itself as a Mac, and is told apart by its touch screen.
 */
export function installGuide(userAgent: string, maxTouchPoints: number): InstallGuide | null {
  const ios =
    /iPhone|iPad|iPod/.test(userAgent) ||
    (/Macintosh/.test(userAgent) && maxTouchPoints > 1);
  if (ios) return IOS_IN_APP.test(userAgent) ? "ios-in-app" : "ios";

  if (/Macintosh/.test(userAgent) && /Safari\//.test(userAgent) && !NOT_SAFARI.test(userAgent)) {
    // Add to Dock arrived with Safari 17 (macOS Sonoma).
    const version = Number(userAgent.match(/Version\/(\d+)/)?.[1] ?? 0);
    if (version >= 17) return "mac-safari";
  }
  return null;
}

/** The console is a tool, not something to put on a home screen. */
export function offerInstallOn(pathname: string | null): boolean {
  if (!pathname) return false;
  return !(pathname === "/admin" || pathname.startsWith("/admin/"));
}

/** Dispatched on window whenever the answer to "can this install?" may have changed. */
export const INSTALL_CHANGED = "isdc-installable";

/**
 * For <head>, before anything else runs. Chrome hands over its install
 * prompt once, in an event that can fire before React has hydrated;
 * this parks it on window.__isdcInstall for the button to use. Calling
 * preventDefault also stops Chrome showing its own install bar on
 * Android: the offer is the button and nothing else.
 */
export const INSTALL_BOOT = `(function(){window.addEventListener('beforeinstallprompt',function(e){e.preventDefault();window.__isdcInstall=e;window.dispatchEvent(new Event('${INSTALL_CHANGED}'))});window.addEventListener('appinstalled',function(){window.__isdcInstall=null;window.__isdcInstalled=true;window.dispatchEvent(new Event('${INSTALL_CHANGED}'))})})()`;

/** Display modes in which the site is already running as an installed app. */
export const APP_DISPLAY_MODES = ["standalone", "minimal-ui", "fullscreen", "window-controls-overlay"] as const;

/**
 * How often, at most, an open page asks the browser to look for a new
 * service worker. Pages are fetched from the network first anyway, so
 * this only matters for a change to the worker itself.
 */
export const SW_UPDATE_EVERY_MS = 10 * 60 * 1000;

export function updateDue(lastCheck: number, now: number): boolean {
  return now - lastCheck >= SW_UPDATE_EVERY_MS;
}
