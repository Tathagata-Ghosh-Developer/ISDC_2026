/**
 * The public site as a visitor's browser sees it, over HTTP, from a
 * real `next start` (see servers.ts). Nothing here writes anything.
 *
 * These are the pages a QR code, an Instagram bio or an AI assistant
 * sends people to during the Puja. Each must answer, carry its own
 * content, carry the security headers, and leak nothing.
 */
import { describe, expect, it } from "vitest";
import { TITLE_SPONSOR } from "@/lib/site";
import { BASE_NO_DB } from "./servers";

async function get(path: string) {
  const res = await fetch(BASE_NO_DB + path, { redirect: "manual" });
  return { res, body: await res.text() };
}

function jsonLdBlocks(html: string): unknown[] {
  return [...html.matchAll(/<script type="application\/ld\+json">([^<]*)<\/script>/g)].map((m) => JSON.parse(m[1]));
}

const PAGES = ["/", "/merch", "/mahalaya", "/utsab", "/daan", "/sponsors", "/thikana", "/gaan", "/probash", "/jogdan", "/gallery", "/itihash", "/shilpa"];

describe("every public page", () => {
  for (const path of PAGES) {
    it(`${path} answers 200 with the security headers and no stack trace`, async () => {
      const { res, body } = await get(path);
      expect(res.status, path).toBe(200);
      expect(res.headers.get("content-security-policy"), path).toContain("default-src 'self'");
      expect(res.headers.get("x-frame-options"), path).toBe("DENY");
      expect(res.headers.get("x-content-type-options"), path).toBe("nosniff");
      expect(body, path).not.toContain("node_modules");
      expect(body, path).not.toContain("\n    at ");
    });
  }

  it("names the title sponsor and both partners on every page, in the footer", async () => {
    for (const path of ["/", "/merch", "/utsab"]) {
      const { body } = await get(path);
      expect(body, path).toContain(TITLE_SPONSOR.line);
      // the sponsor's trademark notice, which their guidelines ask for
      // wherever their name or mark appears
      expect(body, path).toContain(TITLE_SPONSOR.notice);
      expect(body, path).toContain("/media/sponsors/iitxiim-jewels.jpg");
      expect(body, path).toContain("/media/sponsors/meme-theory.png");
    }
  });
});

describe("the merchandise", () => {
  it("/merch links out to the partner's product page and says who sells it", async () => {
    const { body } = await get("/merch");
    expect(body).toContain("Pujo Hits IISc");
    expect(body).toContain("https://www.memetheory.in/product/6aca697a15387416873f0e0d");
    expect(body).toContain("Campus orders only");
    expect(body).toContain("https://www.memetheory.in/refund-policy");
    // outbound links never hand the partner our page or our window
    for (const m of body.matchAll(/<a [^>]*href="https:\/\/www\.memetheory\.in[^"]*"[^>]*>/g)) {
      expect(m[0]).toMatch(/rel="[^"]*noopener[^"]*"/);
    }
  });

  it("/merch describes the shirt as a Product with an INR offer", async () => {
    const { body } = await get("/merch");
    const product = jsonLdBlocks(body).find((b) => (b as { "@type"?: string })["@type"] === "Product") as
      | { offers: { priceCurrency: string; price: number; url: string } }
      | undefined;
    expect(product).toBeDefined();
    expect(product!.offers.priceCurrency).toBe("INR");
    expect(product!.offers.price).toBeGreaterThan(0);
    expect(product!.offers.url).toMatch(/^https:\/\/www\.memetheory\.in\//);
  });

  it("serves the film, the posters and the 3D shirt", async () => {
    for (const f of ["tee-loop-720p30.webm", "tee-loop-720p30.mp4", "tee-loop-1080p60.webm", "tee-loop-1080p60.mp4", "tee-poster-720.webp", "tee-poster.webp", "tee.glb?v=2", "kash-sky.webp", "flat-front.webp", "flat-back.webp"]) {
      const res = await fetch(`${BASE_NO_DB}/media/merch/${f}`);
      expect(res.status, f).toBe(200);
      expect(res.headers.get("cache-control"), f).toContain("max-age=31536000");
    }
  });

  it("the home page offers the shirt and does not put the 3D library in its HTML", async () => {
    const { body } = await get("/");
    expect(body).toContain("Puja T-shirt");
    expect(body).not.toMatch(/WebGLRenderer/);
  });
});

describe("the machine-readable pages", () => {
  it("/calendar.ics is a calendar, with CRLF lines and the broadcast reminder", async () => {
    const { res, body } = await get("/calendar.ics");
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("text/calendar");
    expect(body.startsWith("BEGIN:VCALENDAR\r\n")).toBe(true);
    expect(body).toContain("TRIGGER:-PT10M");
    expect(body.split("\r\n").every((l) => new TextEncoder().encode(l).length <= 75)).toBe(true);
  });

  it("/llms.txt summarises the Puja, the UPI id and the merchandise", async () => {
    const { res, body } = await get("/llms.txt");
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("text/plain");
    expect(body).toMatch(/^# IISc Sharodiya Durgotsab 2026/);
    expect(body).toContain("UPI ");
    expect(body).toContain("Pujo Hits IISc");
    expect(body).toContain("IITxIIM Jewels (Jewellery Partner)");
  });

  it("the home page carries valid JSON-LD for the festival and its questions", async () => {
    const { body } = await get("/");
    const types = jsonLdBlocks(body).flatMap((b) => ((b as { "@graph"?: { "@type": string }[] })["@graph"] ?? []).map((n) => n["@type"]));
    expect(types).toEqual(expect.arrayContaining(["Organization", "WebSite", "Festival", "FAQPage"]));
  });

  it("the sitemap lists /merch and never a receipt", async () => {
    const { body } = await get("/sitemap.xml");
    expect(body).toContain("/merch</loc>");
    expect(body).not.toContain("/receipt");
  });

  it("robots keeps receipts, the console and the API out of search", async () => {
    const { body } = await get("/robots.txt");
    for (const path of ["/receipt/", "/admin", "/api/"]) expect(body).toContain(`Disallow: ${path}`);
  });
});
