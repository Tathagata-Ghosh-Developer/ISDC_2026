/* ================================================================
   The service worker, for the installed app.

   It exists so that the schedule and the way to the pandal still open
   on a phone with one bar of signal in a crowd, and so that the app
   says "you are offline" in its own words rather than a browser's.
   It is deliberately plain. This site takes donations, and a cache
   that served yesterday's page as today's would be worse than none.

   The rules, in the order classify() applies them:

     Left entirely alone (the browser fetches as if this file did not
     exist): anything that is not a GET; anything on another origin;
     anything that is not http(s); /api/*, /admin*, /receipt*,
     /_next/data/*; requests carrying a Range header (audio, video,
     the magazines); the client router's own data requests (RSC); and
     everything not named below, such as the manifest and robots.txt.

     /_next/static/*   cache first. The names carry a content hash, so
                       a name never points at different bytes. Fonts
                       live here too.
     /_next/image and
     /media/* images   cache first, kept to a bounded number. Published
                       media never changes (see next.config.ts).
     /daan, /daan/*    network only. Never cached and never served from
                       a cache: bank details can be edited from the
                       console, and an old copy must never be shown as
                       if it were current. Offline, the offline page.
     other pages       network first. If the network has not answered
                       in a few seconds and a copy is saved, the copy;
                       otherwise keep waiting for the network; if the
                       network fails and nothing is saved, the offline
                       page. Every good answer replaces the saved copy,
                       so a new deploy is what the next visit shows.

   Updating: change VERSION. Every cache name carries it, the old
   caches are deleted when the new worker activates, and the new worker
   takes over open pages at once (skipWaiting and clients.claim). It
   never reloads a page, because a page may hold a half-filled form.

   Removing: replace this file with one that, on activate, deletes
   every cache and calls self.registration.unregister(). Browsers check
   this file on every visit, so that reaches everyone within a day.
   ================================================================ */

const VERSION = "2026-10-13.2";
const PAGES = `isdc-pages-${VERSION}`;
const STATIC = `isdc-static-${VERSION}`;
const IMAGES = `isdc-images-${VERSION}`;

const OFFLINE_URL = "/offline";
/** Saved on install, best effort: the offline page and what it links to. */
const PRECACHE_PAGES = [OFFLINE_URL, "/", "/utsab", "/thikana"];
const PRECACHE_IMAGES = ["/media/brand/icon-192.png"];

/** How long a page request may take before a saved copy is shown instead. */
const NAV_TIMEOUT_MS = 4000;
const STATIC_LIMIT = 400;
const IMAGE_LIMIT = 120;

/** Paths whose requests this worker never touches. Whole segments only. */
const NEVER = ["/api", "/admin", "/receipt", "/_next/data"];
/** Pages fetched from the network every time and never saved. */
const NETWORK_ONLY_PAGES = ["/daan"];

const IMAGE_EXT = /\.(?:png|jpe?g|webp|avif|gif|svg|ico)$/i;

function under(pathname, prefix) {
  return pathname === prefix || pathname.startsWith(prefix + "/");
}

/**
 * What to do with a request. Pure, so the tests can hold it still.
 *
 * @param {{ url: string, method: string, mode?: string, headers: { get(name: string): string | null } }} request
 * @param {string} origin this worker's origin
 * @returns {"bypass" | "static" | "image" | "page" | "network-only-page"}
 */
function classify(request, origin) {
  if (request.method !== "GET") return "bypass";

  let url;
  try {
    url = new URL(request.url);
  } catch {
    return "bypass";
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return "bypass";
  if (url.origin !== origin) return "bypass";

  const path = url.pathname;
  if (NEVER.some((p) => under(path, p))) return "bypass";
  if (request.headers.get("range")) return "bypass";
  // The App Router's own fetches for a client-side navigation. They
  // vary on headers a cache key cannot see, so they go to the network,
  // and when that fails the router falls back to a full page load,
  // which is handled below.
  if (
    request.headers.get("rsc") ||
    request.headers.get("next-router-prefetch") ||
    url.searchParams.has("_rsc")
  ) {
    return "bypass";
  }

  if (path.startsWith("/_next/static/")) return "static";
  if (path === "/_next/image") return "image";
  if (path.startsWith("/media/") && IMAGE_EXT.test(path)) return "image";

  if (request.mode === "navigate") {
    if (NETWORK_ONLY_PAGES.some((p) => under(path, p))) return "network-only-page";
    return "page";
  }
  return "bypass";
}

/** The key a page is saved under: the path, without the query or hash. */
function pageKey(href) {
  const url = new URL(href);
  return url.origin + url.pathname;
}

/** Only a complete, ordinary, storable HTML page is worth keeping. */
function savablePage(response) {
  if (!response || response.status !== 200 || response.redirected) return false;
  const type = response.headers.get("content-type") || "";
  const control = response.headers.get("cache-control") || "";
  return type.includes("text/html") && !/no-store|private/i.test(control);
}

function savableAsset(response) {
  return Boolean(response) && response.status === 200 && !response.redirected;
}

async function trim(cacheName, limit) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  // keys() is in insertion order, so the oldest go first.
  for (const request of keys.slice(0, Math.max(0, keys.length - limit))) {
    await cache.delete(request);
  }
}

/** Last resort when even the offline page was never saved. */
function bareOffline() {
  return new Response(
    '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
      "<title>Offline</title>" +
      '<body style="font-family:Georgia,serif;background:#f2e7d2;color:#17110c;padding:2rem;line-height:1.6">' +
      "<p>আপনি এখন অফলাইন</p><h1>You are offline</h1>" +
      '<p>Reconnect and <a href="" style="color:#c0271a">try again</a>.</p>',
    { status: 200, headers: { "content-type": "text/html; charset=utf-8" } },
  );
}

async function offlinePage() {
  const cache = await caches.open(PAGES);
  return (await cache.match(pageKey(new URL(OFFLINE_URL, self.location.origin).href))) || bareOffline();
}

function timeout(ms) {
  return new Promise((resolve) => setTimeout(() => resolve(null), ms));
}

/** Network first, a saved copy if the network is slow or gone, then the offline page. */
async function page(event) {
  const request = event.request;
  const key = pageKey(request.url);
  const cache = await caches.open(PAGES);

  const network = fetch(request).then((response) => {
    if (savablePage(response)) {
      event.waitUntil(cache.put(key, response.clone()));
    }
    return response;
  });
  // Swallowed here only so a late failure is not reported as unhandled;
  // the awaits below still see it.
  network.catch(() => {});

  try {
    const first = await Promise.race([network, timeout(NAV_TIMEOUT_MS)]);
    if (first) return first;
  } catch {
    // The network failed outright. Fall through to the saved copy.
  }

  const saved = await cache.match(key);
  if (saved) {
    // Let the slow request finish in the background and refresh the copy.
    event.waitUntil(network.catch(() => {}));
    return saved;
  }
  try {
    return await network;
  } catch {
    return offlinePage();
  }
}

/**
 * The donation page: the network, or the offline page. Never a saved
 * copy, neither this worker's nor the browser's own HTTP cache, which
 * would otherwise answer from a copy kept a minute earlier when the
 * network is gone. A redirect is handed back for the browser to follow.
 */
async function networkOnlyPage(event) {
  try {
    return await fetch(event.request.url, {
      cache: "no-store",
      credentials: "same-origin",
      redirect: "manual",
    });
  } catch {
    return offlinePage();
  }
}

async function cacheFirst(event, cacheName, limit) {
  const request = event.request;
  const cache = await caches.open(cacheName);
  const hit = await cache.match(request);
  if (hit) return hit;
  const response = await fetch(request);
  if (savableAsset(response)) {
    event.waitUntil(cache.put(request, response.clone()).then(() => trim(cacheName, limit)));
  }
  return response;
}

/** Saves the offline page and the pages it links to, with what they need to render. */
async function precache() {
  const origin = self.location.origin;
  const pages = await caches.open(PAGES);
  const assets = new Set();

  await Promise.allSettled(
    PRECACHE_PAGES.map(async (path) => {
      const url = new URL(path, origin).href;
      const response = await fetch(url, { credentials: "same-origin" });
      if (!savablePage(response)) return;
      const html = await response.clone().text();
      for (const match of html.matchAll(/\/_next\/static\/[^"'\s\\()<>]+/g)) {
        assets.add(match[0]);
      }
      await pages.put(pageKey(url), response);
    }),
  );

  // Mostly already in the browser's own cache from the page that
  // registered this worker, so these rarely touch the network.
  const fill = async (cacheName, path) => {
    const url = new URL(path, origin).href;
    const cache = await caches.open(cacheName);
    if (await cache.match(url)) return;
    const response = await fetch(url);
    if (savableAsset(response)) await cache.put(url, response);
  };
  await Promise.allSettled([
    ...[...assets].map((url) => fill(STATIC, url)),
    ...PRECACHE_IMAGES.map((url) => fill(IMAGES, url)),
  ]);
}

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(precache().catch(() => {}));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keep = new Set([PAGES, STATIC, IMAGES]);
      for (const name of await caches.keys()) {
        if (name.startsWith("isdc-") && !keep.has(name)) await caches.delete(name);
      }
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const kind = classify(event.request, self.location.origin);
  switch (kind) {
    case "static":
      event.respondWith(cacheFirst(event, STATIC, STATIC_LIMIT));
      return;
    case "image":
      event.respondWith(cacheFirst(event, IMAGES, IMAGE_LIMIT));
      return;
    case "page":
      event.respondWith(page(event));
      return;
    case "network-only-page":
      event.respondWith(networkOnlyPage(event));
      return;
    default:
      // "bypass": no respondWith, so the browser handles it untouched.
      return;
  }
});
