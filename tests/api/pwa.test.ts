/**
 * The installed app, as a browser deciding whether it can install
 * sees it over HTTP from a real `next start` (see servers.ts).
 */
import { describe, expect, it } from "vitest";
import { BASE_NO_DB } from "./servers";

type Icon = { src: string; sizes?: string; type?: string; purpose?: string };
type Manifest = {
  id: string;
  start_url: string;
  scope: string;
  display: string;
  icons: Icon[];
  shortcuts: { url: string; icons?: Icon[] }[];
  screenshots: (Icon & { form_factor?: string })[];
};

async function get(path: string) {
  return fetch(BASE_NO_DB + path, { redirect: "manual" });
}

describe("the web app manifest", () => {
  it("is linked from every page and parses", async () => {
    const page = await (await get("/utsab")).text();
    expect(page).toContain('<link rel="manifest" href="/manifest.webmanifest"');

    const res = await get("/manifest.webmanifest");
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toMatch(/manifest\+json|json/);
    const m = (await res.json()) as Manifest;
    expect(m.id).toBe("/");
    expect(m.display).toBe("standalone");
  });

  it("names only files the server actually serves, as the type it claims", async () => {
    const m = (await (await get("/manifest.webmanifest")).json()) as Manifest;
    const all: Icon[] = [...m.icons, ...m.screenshots, ...m.shortcuts.flatMap((s) => s.icons ?? [])];
    for (const icon of all) {
      const res = await get(icon.src);
      expect(res.status, icon.src).toBe(200);
      expect(res.headers.get("content-type"), icon.src).toBe(icon.type);
      await res.arrayBuffer();
    }
  });

  it("sends every shortcut to a page that answers", async () => {
    const m = (await (await get("/manifest.webmanifest")).json()) as Manifest;
    for (const s of m.shortcuts) {
      const res = await get(s.url);
      expect(res.status, s.url).toBe(200);
      await res.text();
    }
  });
});

describe("the service worker and the offline page", () => {
  it("serves /sw.js as JavaScript that every update check revalidates", async () => {
    const res = await get("/sw.js");
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("javascript");
    expect(res.headers.get("cache-control")).toBe("no-cache");
    const body = await res.text();
    expect(body).toContain('addEventListener("fetch"');
  });

  it("allows the worker and the manifest in the Content Security Policy", async () => {
    const res = await get("/");
    const csp = res.headers.get("content-security-policy") ?? "";
    expect(csp).toContain("worker-src 'self'");
    expect(csp).toContain("manifest-src 'self'");
    await res.text();
  });

  it("serves /offline as a page of its own, kept out of search", async () => {
    const res = await get("/offline");
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("text/html");
    expect(res.headers.get("x-robots-tag")).toBe("noindex");
    const body = await res.text();
    expect(body).toContain("You are offline");
    expect(body).toContain('href="/utsab"');
  });
});

describe("the home-screen details for iPhone", () => {
  it("names the app, makes it full screen and gives it the 180 px icon", async () => {
    const page = await (await get("/")).text();
    expect(page).toContain('<meta name="apple-mobile-web-app-title" content="Durgotsab"/>');
    expect(page).toContain('<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent"/>');
    expect(page).toContain('<meta name="mobile-web-app-capable" content="yes"/>');
    expect(page).toMatch(/<link rel="apple-touch-icon" href="\/apple-icon\.png" sizes="180x180" type="image\/png"\/>/);
    expect(page).toContain("beforeinstallprompt");

    const icon = await get("/apple-icon.png");
    expect(icon.status).toBe(200);
    const bytes = Buffer.from(await icon.arrayBuffer());
    expect([bytes.readUInt32BE(16), bytes.readUInt32BE(20)]).toEqual([180, 180]);
  });
});
