/**
 * The installed app: the manifest and the files it names, the service
 * worker's rules, the install button's decisions and the offline page.
 *
 * The service worker is plain JavaScript in public/sw.js. It is loaded
 * here into a VM context with a small in-memory Cache Storage and a
 * fetch the test controls, and driven with fetch events the way a
 * browser would drive it. This site takes donations, so the rules that
 * matter most are the ones about what it must never touch or serve
 * stale: the API, the console, receipts and the donation page.
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import manifest from "@/app/manifest";
import { GET as offlineRoute } from "@/app/offline/route";
import { installGuide, offerInstallOn, updateDue, SW_UPDATE_EVERY_MS } from "@/lib/install";
import nextConfig from "../next.config";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const pub = (p: string) => join(ROOT, "public", p.replace(/^\//, ""));

/* ---------------------------------------------------------------- */
/* image headers, without an image library                           */

function pngInfo(file: string) {
  const b = readFileSync(file);
  expect(b.subarray(1, 4).toString("ascii"), file).toBe("PNG");
  expect(b.subarray(12, 16).toString("ascii"), file).toBe("IHDR");
  const colourType = b[25];
  return {
    width: b.readUInt32BE(16),
    height: b.readUInt32BE(20),
    // 4 and 6 carry an alpha channel; a palette image is transparent
    // only if it has a tRNS chunk.
    opaque: (colourType === 2 || colourType === 3 || colourType === 0) && !b.includes(Buffer.from("tRNS")),
  };
}

function webpInfo(file: string) {
  const b = readFileSync(file);
  expect(b.subarray(0, 4).toString("ascii"), file).toBe("RIFF");
  expect(b.subarray(8, 12).toString("ascii"), file).toBe("WEBP");
  const chunk = b.subarray(12, 16).toString("ascii");
  if (chunk === "VP8 ") return { width: b.readUInt16LE(26) & 0x3fff, height: b.readUInt16LE(28) & 0x3fff };
  if (chunk === "VP8L") {
    const bits = b.readUInt32LE(21);
    return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
  }
  if (chunk === "VP8X") return { width: b.readUIntLE(24, 3) + 1, height: b.readUIntLE(27, 3) + 1 };
  throw new Error(`${file}: unknown WebP chunk ${chunk}`);
}

function sizeOf(file: string) {
  return file.endsWith(".webp") ? webpInfo(file) : pngInfo(file);
}

/** A route exists if the App Router has a page or a handler for it. */
function routeExists(url: string) {
  const dir = join(ROOT, "src", "app", ...url.split("/").filter(Boolean));
  return existsSync(join(dir, "page.tsx")) || existsSync(join(dir, "route.ts"));
}

/* ================================================================ */

describe("the web app manifest", () => {
  const m = manifest();

  it("is one app, scoped to the whole site, opening standalone", () => {
    expect(m.id).toBe("/");
    expect(m.scope).toBe("/");
    expect(m.start_url).toBe("/");
    expect(m.display).toBe("standalone");
    expect(m.display_override).toEqual(["standalone", "minimal-ui"]);
    expect(m.orientation).toBe("any");
    expect(m.short_name!.length).toBeLessThanOrEqual(12);
  });

  it("uses the site's own night paper for the splash and the title bar", () => {
    const css = readFileSync(join(ROOT, "src", "app", "globals.css"), "utf8");
    expect(css).toContain(`--c-paper: ${m.background_color}`);
    expect(m.theme_color).toBe(m.background_color);
  });

  it("names icons that exist, at the sizes it claims", () => {
    for (const icon of m.icons!) {
      expect(existsSync(pub(icon.src)), icon.src).toBe(true);
      const { width, height } = sizeOf(pub(icon.src));
      expect(`${width}x${height}`, icon.src).toBe(icon.sizes);
    }
    const any = m.icons!.filter((i) => i.purpose === "any").map((i) => i.sizes);
    expect(any).toEqual(expect.arrayContaining(["192x192", "512x512"]));
  });

  it("has real maskable icons: square, opaque and full size, not the old 180 px apple icon", () => {
    const maskable = m.icons!.filter((i) => i.purpose === "maskable");
    expect(maskable.map((i) => i.sizes).sort()).toEqual(["192x192", "512x512"]);
    for (const icon of maskable) {
      expect(icon.src).not.toContain("apple");
      expect(pngInfo(pub(icon.src)).opaque, `${icon.src} must be full bleed`).toBe(true);
    }
  });

  it("offers the four shortcuts, each to a page that exists, each with a 96 px icon", () => {
    const urls = m.shortcuts!.map((s) => s.url);
    expect(urls).toEqual(["/daan", "/utsab", "/merch", "/thikana"]);
    for (const s of m.shortcuts!) {
      expect(routeExists(s.url), s.url).toBe(true);
      expect(s.icons!.length, s.url).toBeGreaterThan(0);
      for (const icon of s.icons!) {
        expect(existsSync(pub(icon.src)), icon.src).toBe(true);
        expect(icon.sizes).toBe("96x96");
        const { width, height } = pngInfo(pub(icon.src));
        expect([width, height], icon.src).toEqual([96, 96]);
      }
    }
  });

  it("carries a phone and a desktop screenshot of the right shape, and small", () => {
    const narrow = m.screenshots!.filter((s) => s.form_factor === "narrow");
    const wide = m.screenshots!.filter((s) => s.form_factor === "wide");
    expect(narrow.length).toBeGreaterThan(0);
    expect(wide.length).toBeGreaterThan(0);
    for (const s of m.screenshots!) {
      const file = pub(s.src);
      expect(existsSync(file), s.src).toBe(true);
      const { width, height } = sizeOf(file);
      expect(`${width}x${height}`, s.src).toBe(s.sizes);
      // Chrome's rules for the richer install sheet.
      expect(Math.max(width, height) / Math.min(width, height)).toBeLessThanOrEqual(2.3);
      expect(Math.min(width, height)).toBeGreaterThanOrEqual(320);
      expect(readFileSync(file).length, s.src).toBeLessThan(400_000);
      expect(s.label, s.src).toBeTruthy();
    }
    for (const s of narrow) expect(sizeOf(pub(s.src)).height).toBeGreaterThan(sizeOf(pub(s.src)).width);
    for (const s of wide) expect(sizeOf(pub(s.src)).width).toBeGreaterThan(sizeOf(pub(s.src)).height);
  });
});

describe("the Apple touch icon", () => {
  it("is 180 by 180 and opaque, which is what iOS wants", () => {
    const info = pngInfo(join(ROOT, "src", "app", "apple-icon.png"));
    expect([info.width, info.height]).toEqual([180, 180]);
    expect(info.opaque).toBe(true);
  });
});

describe("the headers the app depends on", () => {
  it("lets the worker and the manifest load under the Content Security Policy", async () => {
    const rules = await nextConfig.headers!();
    const csp = rules
      .find((r) => r.source === "/:path*")!
      .headers.find((h) => h.key === "Content-Security-Policy")!.value;
    expect(csp).toContain("worker-src 'self'");
    expect(csp).toContain("manifest-src 'self'");
  });

  it("serves /sw.js so every update check reaches the server", async () => {
    const rules = await nextConfig.headers!();
    const sw = rules.find((r) => r.source === "/sw.js")!;
    expect(sw.headers.find((h) => h.key === "Cache-Control")!.value).toBe("no-cache");
  });
});

/* ================================================================ */
/* the service worker                                                */

const ORIGIN = "https://iiscsharodiyadurgotsab.example";

class MockCache {
  map = new Map<string, Response>();
  private key(r: string | { url: string }) {
    return typeof r === "string" ? new URL(r, ORIGIN).href : r.url;
  }
  async match(r: string | { url: string }, opts?: { ignoreSearch?: boolean }) {
    let key = this.key(r);
    if (opts?.ignoreSearch) key = key.split("?")[0];
    return this.map.get(key)?.clone();
  }
  async put(r: string | { url: string }, res: Response) {
    this.map.set(this.key(r), res);
  }
  async keys() {
    return [...this.map.keys()].map((url) => ({ url }));
  }
  async delete(r: string | { url: string }) {
    return this.map.delete(this.key(r));
  }
}

class MockCacheStorage {
  stores = new Map<string, MockCache>();
  async open(name: string) {
    if (!this.stores.has(name)) this.stores.set(name, new MockCache());
    return this.stores.get(name)!;
  }
  async keys() {
    return [...this.stores.keys()];
  }
  async delete(name: string) {
    return this.stores.delete(name);
  }
  /** Every saved URL, across caches. */
  all() {
    return [...this.stores.values()].flatMap((c) => [...c.map.keys()]);
  }
  cacheNamed(prefix: string) {
    const name = [...this.stores.keys()].find((k) => k.startsWith(prefix));
    return name ? this.stores.get(name)! : undefined;
  }
}

type Req = { url: string; method: string; mode: string; headers: Headers };
type Listener = (event: unknown) => void;

function html(body: string, headers: Record<string, string> = {}) {
  return new Response(`<!doctype html><html><body>${body}</body></html>`, {
    status: 200,
    headers: { "content-type": "text/html; charset=utf-8", date: "Tue, 13 Oct 2026 10:00:00 GMT", ...headers },
  });
}

function nav(path: string): Req {
  return { url: ORIGIN + path, method: "GET", mode: "navigate", headers: new Headers() };
}

function sub(path: string, init: Partial<Omit<Req, "headers">> & { headers?: Record<string, string> } = {}): Req {
  return {
    url: path.startsWith("http") ? path : ORIGIN + path,
    method: init.method ?? "GET",
    mode: init.mode ?? "no-cors",
    headers: new Headers(init.headers ?? {}),
  };
}

function loadWorker() {
  const listeners: Record<string, Listener> = {};
  const caches = new MockCacheStorage();
  const network = vi.fn<(r: Req | Request | string) => Promise<Response>>();
  const sandbox = {
    self: {
      addEventListener: (type: string, fn: Listener) => (listeners[type] = fn),
      location: { origin: ORIGIN },
      skipWaiting: vi.fn(),
      clients: { claim: vi.fn(async () => {}) },
    },
    caches,
    fetch: (r: Req | Request | string) => network(r),
    Request,
    Response,
    Headers,
    URL,
    setTimeout: (fn: () => void, ms: number) => setTimeout(fn, ms),
    console,
  };
  vm.createContext(sandbox);
  vm.runInContext(readFileSync(pub("/sw.js"), "utf8"), sandbox, { filename: "sw.js" });
  const classify = (sandbox as unknown as { classify: (r: Req, o: string) => string }).classify;

  /** Dispatches a fetch event; `responded` is undefined when the worker stays out of it. */
  function fire(request: Req) {
    let responded: Promise<Response> | undefined;
    const waits: Promise<unknown>[] = [];
    listeners.fetch({
      request,
      respondWith: (p: Promise<Response>) => (responded = Promise.resolve(p)),
      waitUntil: (p: Promise<unknown>) => waits.push(p),
    });
    // waitUntil can be called again while earlier work settles (the
    // copy is saved after the response arrives), so wait until it stops.
    const settled = async () => {
      await responded?.catch(() => {});
      let seen = -1;
      while (seen !== waits.length) {
        seen = waits.length;
        await Promise.allSettled(waits);
      }
    };
    return { responded, settled };
  }

  async function lifecycle(type: "install" | "activate") {
    const waits: Promise<unknown>[] = [];
    listeners[type]({ waitUntil: (p: Promise<unknown>) => waits.push(p) });
    await Promise.all(waits);
  }

  return { classify, caches, network, fire, lifecycle, self: sandbox.self };
}

describe("the service worker's rules", () => {
  const { classify } = loadWorker();
  const k = (r: Req) => classify(r, ORIGIN);

  it("never touches the API, the console, receipts or the old data routes", () => {
    for (const p of [
      "/api/donations",
      "/api/admin/export?x=1",
      "/api",
      "/admin",
      "/admin/content",
      "/receipt/abc123",
      "/receipt",
      "/_next/data/build/admin.json",
    ]) {
      expect(k(nav(p)), p).toBe("bypass");
      expect(k(sub(p)), p).toBe("bypass");
    }
  });

  it("matches whole path segments, not prefixes of words", () => {
    expect(k(nav("/administration"))).toBe("page");
    expect(k(nav("/apiary"))).toBe("page");
    expect(k(nav("/daanx"))).toBe("page");
  });

  it("leaves anything but a same-origin http GET alone", () => {
    expect(k(sub("/", { method: "POST", mode: "navigate" }))).toBe("bypass");
    expect(k(sub("/utsab", { method: "HEAD", mode: "navigate" }))).toBe("bypass");
    expect(k(sub("https://www.memetheory.in/product/x", { mode: "navigate" }))).toBe("bypass");
    expect(k(sub("https://fonts.gstatic.com/s/a.woff2"))).toBe("bypass");
    expect(k(sub("https://www.youtube-nocookie.com/embed/x", { mode: "navigate" }))).toBe("bypass");
    expect(k(sub("upi://pay?pa=iiscsdc@sbi", { mode: "navigate" }))).toBe("bypass");
    expect(k(sub("not a url"))).toBe("bypass");
  });

  it("leaves the router's own data requests, ranged media and unknown files to the network", () => {
    expect(k(sub("/utsab?_rsc=abc"))).toBe("bypass");
    expect(k(sub("/utsab", { headers: { RSC: "1" } }))).toBe("bypass");
    expect(k(sub("/utsab", { headers: { "Next-Router-Prefetch": "1" } }))).toBe("bypass");
    expect(k(sub("/media/audio/dhak.mp3", { headers: { Range: "bytes=0-" } }))).toBe("bypass");
    expect(k(sub("/media/magazine/probash.pdf"))).toBe("bypass");
    expect(k(sub("/media/merch/tee.glb"))).toBe("bypass");
    expect(k(sub("/manifest.webmanifest"))).toBe("bypass");
    expect(k(sub("/sw.js"))).toBe("bypass");
  });

  it("keeps hashed build files and published images cache-first", () => {
    expect(k(sub("/_next/static/chunks/abc123.js"))).toBe("static");
    expect(k(sub("/_next/static/media/bodoni.woff2"))).toBe("static");
    expect(k(sub("/_next/static/css/app.css?dpl=dpl_x"))).toBe("static");
    expect(k(sub("/_next/image?url=%2Fmedia%2Fpuja%2Fpuja-1.jpg&w=828&q=75"))).toBe("image");
    expect(k(sub("/media/brand/icon-192.png"))).toBe("image");
    expect(k(sub("/media/puja/puja-1.JPG"))).toBe("image");
  });

  it("sends the donation page to the network every time", () => {
    expect(k(nav("/daan"))).toBe("network-only-page");
    expect(k(nav("/daan/board"))).toBe("network-only-page");
    expect(k(nav("/daan?amount=501"))).toBe("network-only-page");
  });

  it("treats other page loads as pages", () => {
    for (const p of ["/", "/utsab", "/thikana", "/merch", "/offline", "/gaan?shelf=agomoni"]) {
      expect(k(nav(p)), p).toBe("page");
    }
  });
});

describe("the service worker at work", () => {
  let w: ReturnType<typeof loadWorker>;
  beforeEach(() => {
    w = loadWorker();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  /** The worker's own page cache, whatever this version calls it. */
  async function pagesCache() {
    w.network.mockResolvedValueOnce(html("UTSAB"));
    await w.fire(nav("/utsab")).settled();
    const cache = w.caches.cacheNamed("isdc-pages-")!;
    expect(cache).toBeDefined();
    return cache;
  }

  it("does not answer for the API, the console or a receipt: no respondWith at all", async () => {
    for (const r of [sub("/api/donations", { method: "POST" }), sub("/api/now"), nav("/admin"), nav("/receipt/t0k3n")]) {
      expect(w.fire(r).responded, r.url).toBeUndefined();
    }
    expect(w.network).not.toHaveBeenCalled();
  });

  it("fetches a page from the network first and saves it under its path", async () => {
    w.network.mockResolvedValueOnce(html("FRESH UTSAB"));
    const { responded, settled } = w.fire(nav("/utsab?utm_source=qr"));
    expect(await (await responded!).text()).toContain("FRESH UTSAB");
    await settled();
    expect(w.caches.all()).toContain(ORIGIN + "/utsab");
  });

  it("offline, serves the saved copy of a page it has seen", async () => {
    w.network.mockResolvedValueOnce(html("SAVED UTSAB"));
    await w.fire(nav("/utsab")).settled();
    w.network.mockRejectedValueOnce(new TypeError("Failed to fetch"));
    const res = await w.fire(nav("/utsab")).responded!;
    expect(await res.text()).toContain("SAVED UTSAB");
  });

  it("offline, serves the offline page for a page it has never seen", async () => {
    // install saves /offline
    w.network.mockImplementation(async (r) => {
      const url = typeof r === "string" ? r : r.url;
      return url.endsWith("/offline") ? html("OFFLINE PAGE") : html("page");
    });
    await w.lifecycle("install");
    w.network.mockReset();
    w.network.mockRejectedValue(new TypeError("Failed to fetch"));
    const res = await w.fire(nav("/gaan")).responded!;
    expect(await res.text()).toContain("OFFLINE PAGE");
  });

  it("offline with nothing saved at all, still answers in words rather than an error", async () => {
    w.network.mockRejectedValue(new TypeError("Failed to fetch"));
    const res = await w.fire(nav("/gaan")).responded!;
    expect(res.status).toBe(200);
    expect(await res.text()).toContain("You are offline");
  });

  it("never saves the donation page, and never serves it from a cache", async () => {
    const pages = await pagesCache();
    await pages.put(ORIGIN + "/offline", html("OFFLINE PAGE"));

    w.network.mockResolvedValueOnce(html("LIVE BANK DETAILS"));
    const online = w.fire(nav("/daan"));
    expect(await (await online.responded!).text()).toContain("LIVE BANK DETAILS");
    await online.settled();
    expect(w.caches.all().some((u) => u.includes("/daan"))).toBe(false);

    // Even if a stale copy were somehow in the page cache, offline it is
    // not used: the offline page is, which says donating needs a signal.
    await pages.put(ORIGIN + "/daan", html("STALE BANK DETAILS"));
    w.network.mockRejectedValueOnce(new TypeError("Failed to fetch"));
    const body = await (await w.fire(nav("/daan")).responded!).text();
    expect(body).not.toContain("STALE BANK DETAILS");
    expect(body).toContain("OFFLINE PAGE");
  });

  it("waits for a slow network rather than show the donation page from anywhere else", async () => {
    vi.useFakeTimers();
    let resolve!: (r: Response) => void;
    w.network.mockReturnValueOnce(new Promise((r) => (resolve = r)));
    const { responded } = w.fire(nav("/daan"));
    await vi.advanceTimersByTimeAsync(30_000);
    resolve(html("LIVE AFTER A WHILE"));
    expect(await (await responded!).text()).toContain("LIVE AFTER A WHILE");
  });

  it("on a slow network shows the saved copy after a few seconds, and refreshes it behind", async () => {
    w.network.mockResolvedValueOnce(html("OLD COPY"));
    await w.fire(nav("/thikana")).settled();

    vi.useFakeTimers();
    let resolve!: (r: Response) => void;
    w.network.mockReturnValueOnce(new Promise((r) => (resolve = r)));
    const { responded, settled } = w.fire(nav("/thikana"));
    await vi.advanceTimersByTimeAsync(4_100);
    expect(await (await responded!).text()).toContain("OLD COPY");

    resolve(html("NEW COPY"));
    await settled();
    vi.useRealTimers();
    w.network.mockRejectedValueOnce(new TypeError("offline"));
    expect(await (await w.fire(nav("/thikana")).responded!).text()).toContain("NEW COPY");
  });

  it("with no saved copy keeps waiting for a slow network instead of claiming to be offline", async () => {
    vi.useFakeTimers();
    let resolve!: (r: Response) => void;
    w.network.mockReturnValueOnce(new Promise((r) => (resolve = r)));
    const { responded } = w.fire(nav("/jogdan"));
    await vi.advanceTimersByTimeAsync(10_000);
    resolve(html("JOGDAN"));
    expect(await (await responded!).text()).toContain("JOGDAN");
  });

  it("does not save what the server says not to store, or anything that is not a page", async () => {
    w.network.mockResolvedValueOnce(html("board", { "cache-control": "private, no-cache, no-store, max-age=0" }));
    await w.fire(nav("/sponsors")).settled();
    w.network.mockResolvedValueOnce(new Response("BEGIN:VCALENDAR", { headers: { "content-type": "text/calendar" } }));
    await w.fire(nav("/calendar.ics")).settled();
    w.network.mockResolvedValueOnce(new Response("nope", { status: 404, headers: { "content-type": "text/html" } }));
    await w.fire(nav("/nowhere")).settled();
    expect(w.caches.all()).toEqual([]);
  });

  it("serves hashed build files from the cache after the first fetch", async () => {
    w.network.mockResolvedValue(new Response("console.log(1)", { headers: { "content-type": "text/javascript" } }));
    const url = "/_next/static/chunks/abc.js";
    await w.fire(sub(url)).settled();
    const second = await w.fire(sub(url)).responded!;
    expect(await second.text()).toBe("console.log(1)");
    expect(w.network).toHaveBeenCalledTimes(1);
  });

  it("on install saves the offline page, home, the schedule and the venue, with their build files, and not /daan", async () => {
    const asked: string[] = [];
    w.network.mockImplementation(async (r) => {
      const url = typeof r === "string" ? r : r.url;
      asked.push(url);
      if (url.includes("/_next/static/")) return new Response("asset");
      if (url.includes("/media/")) return new Response("png");
      return html(
        `<link rel="stylesheet" href="/_next/static/css/app.css"/>` +
          `<script src="/_next/static/chunks/main.js?dpl=dpl_1" async=""></script>` +
          `<script>self.__next_f.push([1,"\\"/_next/static/chunks/page.js\\""])</script>`,
      );
    });
    await w.lifecycle("install");
    const saved = w.caches.all();
    for (const p of ["/offline", "/", "/utsab", "/thikana"]) expect(saved, p).toContain(ORIGIN + p);
    expect(saved).toContain(ORIGIN + "/_next/static/css/app.css");
    expect(saved).toContain(ORIGIN + "/_next/static/chunks/main.js?dpl=dpl_1");
    expect(saved).toContain(ORIGIN + "/_next/static/chunks/page.js");
    expect(saved).toContain(ORIGIN + "/media/brand/icon-192.png");
    expect(asked.some((u) => u.includes("/daan"))).toBe(false);
    expect(w.self.skipWaiting).toHaveBeenCalled();
  });

  it("installs even when the network is down", async () => {
    w.network.mockRejectedValue(new TypeError("offline"));
    await expect(w.lifecycle("install")).resolves.toBeUndefined();
  });

  it("on activate deletes its own old caches, leaves anyone else's, and takes over open pages", async () => {
    await w.caches.open("isdc-pages-2020-01-01.1");
    await w.caches.open("isdc-static-2020-01-01.1");
    await w.caches.open("someone-elses-cache");
    w.network.mockResolvedValue(html("x"));
    await w.lifecycle("install");
    await w.lifecycle("activate");
    const names = await w.caches.keys();
    expect(names).not.toContain("isdc-pages-2020-01-01.1");
    expect(names).not.toContain("isdc-static-2020-01-01.1");
    expect(names).toContain("someone-elses-cache");
    expect(names.some((n) => n.startsWith("isdc-pages-"))).toBe(true);
    expect(w.self.clients.claim).toHaveBeenCalled();
  });
});

/* ================================================================ */

const UA = {
  iphoneSafari:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1",
  iphoneChrome:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/140.0.7339.122 Mobile/15E148 Safari/604.1",
  iphoneInstagram:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 400.0.0.0.0 (iPhone15,2; iOS 18_6; en_IN)",
  ipadDesktop:
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Safari/605.1.15",
  macSafari17:
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15",
  macSafari16:
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Safari/605.1.15",
  macChrome:
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36",
  androidChrome:
    "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Mobile Safari/537.36",
  windowsEdge:
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36 Edg/140.0.0.0",
  firefox: "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:143.0) Gecko/20100101 Firefox/143.0",
};

describe("the install button's decisions", () => {
  it("guides iPhone and iPad users through Share, including an iPad that says it is a Mac", () => {
    expect(installGuide(UA.iphoneSafari, 5)).toBe("ios");
    expect(installGuide(UA.iphoneChrome, 5)).toBe("ios");
    expect(installGuide(UA.ipadDesktop, 5)).toBe("ios");
  });

  it("sends people in an in-app browser to Safari first", () => {
    expect(installGuide(UA.iphoneInstagram, 5)).toBe("ios-in-app");
  });

  it("guides Safari 17 and later on a Mac to Add to Dock, and no earlier Safari", () => {
    expect(installGuide(UA.macSafari17, 0)).toBe("mac-safari");
    expect(installGuide(UA.ipadDesktop, 0)).toBe("mac-safari");
    expect(installGuide(UA.macSafari16, 0)).toBeNull();
  });

  it("writes no guide where the browser's own prompt is used or there is no way to install", () => {
    for (const ua of [UA.macChrome, UA.androidChrome, UA.windowsEdge, UA.firefox]) {
      expect(installGuide(ua, 0), ua).toBeNull();
    }
    expect(installGuide(UA.androidChrome, 5)).toBeNull();
  });

  it("is never offered on the console", () => {
    expect(offerInstallOn("/admin")).toBe(false);
    expect(offerInstallOn("/admin/content")).toBe(false);
    expect(offerInstallOn(null)).toBe(false);
    expect(offerInstallOn("/")).toBe(true);
    expect(offerInstallOn("/daan")).toBe(true);
    expect(offerInstallOn("/administration")).toBe(true);
  });

  it("asks for a new worker at most every ten minutes", () => {
    expect(updateDue(0, SW_UPDATE_EVERY_MS)).toBe(true);
    expect(updateDue(1_000, 1_000 + SW_UPDATE_EVERY_MS - 1)).toBe(false);
    expect(SW_UPDATE_EVERY_MS).toBe(600_000);
  });
});

describe("the offline page", () => {
  it("is a whole document in both languages, linking to the saved schedule and venue", async () => {
    const res = offlineRoute();
    expect(res.headers.get("content-type")).toContain("text/html");
    expect(res.headers.get("x-robots-tag")).toBe("noindex");
    const body = await res.text();
    expect(body).toMatch(/^<!doctype html>/);
    expect(body).toContain("You are offline");
    expect(body).toContain("আপনি এখন অফলাইন");
    expect(body).toContain('href="/utsab"');
    expect(body).toContain('href="/thikana"');
    // Donating is explained, never linked: /daan is not saved.
    expect(body).not.toContain('href="/daan"');
    // Nothing it needs comes from anywhere but this origin.
    expect(body).not.toMatch(/(src|href)="https?:/);
  });
});
