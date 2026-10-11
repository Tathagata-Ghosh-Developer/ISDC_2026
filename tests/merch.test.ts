/**
 * The merchandise, the partners, and the edges of the season logic
 * that a cached page meets in a visitor's browser.
 */
import { existsSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import { MERCH, PARTNERS, PUJA_DATES, TITLE_SPONSOR } from "@/lib/site";
import { SHIRT, shouldOffer } from "@/lib/merch";
import { SCHEDULE } from "@/lib/content/schedule";
import { BROADCAST_MINUTES, pujaDayAt, seasonNote } from "@/lib/season";
import { buildCalendar } from "@/lib/calendar";
import { DEFAULTS } from "@/lib/config";
import { pujaFaq } from "@/lib/faq";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const pub = (p: string) => join(ROOT, "public", p.replace(/^\//, ""));

/** Width and height from a PNG's IHDR, without an image library. */
function pngSize(file: string) {
  const b = readFileSync(file);
  expect(b.subarray(1, 4).toString("ascii")).toBe("PNG");
  return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) };
}

describe("the merchandise popup", () => {
  it("opens on ordinary pages, once", () => {
    expect(shouldOffer("/", false)).toBe(true);
    expect(shouldOffer("/utsab", false)).toBe(true);
    expect(shouldOffer("/", true)).toBe(false);
    expect(shouldOffer(null, false)).toBe(false);
  });

  it("leaves donors, receipts, the console and the shirt's own page alone", () => {
    for (const p of ["/daan", "/daan/board", "/receipt/abc", "/admin", "/admin/content", "/merch"]) {
      expect(shouldOffer(p, false), p).toBe(false);
    }
  });

  it("matches whole path segments, not prefixes of words", () => {
    expect(shouldOffer("/daanx", false)).toBe(true);
    expect(shouldOffer("/merchandise-faq", false)).toBe(true);
    expect(shouldOffer("/administration", false)).toBe(true);
  });
});

describe("the 3D assets", () => {
  it("the height field is exactly the grid the viewer reads", () => {
    const size = statSync(pub("/media/merch/shirt.bin")).size;
    expect(size).toBe(SHIRT.nx * SHIRT.ny * 2);
  });

  it("the grid, the masks and the textures share one aspect", () => {
    expect(SHIRT.ny / SHIRT.nx).toBeCloseTo(SHIRT.aspect, 2);
    for (const f of ["mask-front.png", "mask-back.png"]) {
      const { w, h } = pngSize(pub(`/media/merch/${f}`));
      expect(h / w, f).toBeCloseTo(SHIRT.aspect, 2);
    }
  });

  it("every file the viewer and the pages load is present and not empty", () => {
    for (const f of ["front.jpg", "back.jpg", "mask-front.png", "mask-back.png", "fabric-normal.png", "shirt.bin", "flat-front.webp", "flat-back.webp"]) {
      const p = pub(`/media/merch/${f}`);
      expect(existsSync(p), f).toBe(true);
      expect(statSync(p).size, f).toBeGreaterThan(1000);
    }
  });

  it("textures stay small enough for a phone on Jio", () => {
    const total = ["front.jpg", "back.jpg", "mask-front.png", "mask-back.png", "fabric-normal.png", "shirt.bin"]
      .map((f) => statSync(pub(`/media/merch/${f}`)).size)
      .reduce((a, b) => a + b, 0);
    expect(total).toBeLessThan(1.2 * 1024 * 1024);
  });
});

describe("the merchandise listing", () => {
  it("points only at the partner's own https pages", () => {
    for (const u of [MERCH.url, MERCH.terms, MERCH.refunds, MERCH.shipping]) {
      expect(u).toMatch(/^https:\/\/www\.memetheory\.in\//);
    }
    expect(MERCH.url).toMatch(/\/product\/[0-9a-f]{24}$/);
  });

  it("has a sensible price and the sizes the partner sells", () => {
    expect(Number.isInteger(MERCH.price)).toBe(true);
    expect(MERCH.price).toBeGreaterThan(0);
    expect(MERCH.price).toBeLessThan(5000);
    expect(MERCH.sizes.length).toBeGreaterThan(0);
    expect(MERCH.delivery).toMatch(/Campus orders only/);
  });

  it("is in the answers people and assistants read", () => {
    const merch = pujaFaq(DEFAULTS).find((f) => /T-shirt/.test(f.q));
    expect(merch?.a).toContain(`₹${MERCH.price}`);
    expect(merch?.href).toBe("/merch");
  });
});

describe("the partners", () => {
  it("are listed in order of what they put in, after a title sponsor that put in more", () => {
    const amounts = PARTNERS.map((p) => p.contribution);
    expect([...amounts].sort((a, b) => b - a)).toEqual(amounts);
    expect(PARTNERS.find((p) => p.id === "jewellery")?.contribution).toBe(15000);
    expect(PARTNERS.find((p) => p.id === "merchandise")?.contribution).toBe(0);
    expect(TITLE_SPONSOR.tierId).toBe("title");
  });

  it("have marks on disk, unique ids, and links that are https or absent", () => {
    expect(new Set(PARTNERS.map((p) => p.id)).size).toBe(PARTNERS.length);
    for (const p of PARTNERS) {
      expect(existsSync(pub(p.logo)), p.logo).toBe(true);
      expect(p.url === "" || p.url.startsWith("https://"), p.id).toBe(true);
      expect(p.width).toBeGreaterThan(0);
      expect(p.height).toBeGreaterThan(0);
    }
  });

  it("never invents a link for a partner nobody could verify", () => {
    expect(PARTNERS.find((p) => p.id === "jewellery")?.url).toBe("");
  });
});

describe("season edges, to the second", () => {
  const broadcast = Date.parse(PUJA_DATES.mahalaya);
  const offAir = broadcast + BROADCAST_MINUTES * 60_000;
  const bodhon = Date.parse(PUJA_DATES.arrival);

  it("goes on air at exactly four, and off at exactly ninety minutes", () => {
    expect(seasonNote(broadcast - 1, PUJA_DATES)?.live).toBe(false);
    expect(seasonNote(broadcast, PUJA_DATES)?.live).toBe(true);
    expect(seasonNote(offAir - 1, PUJA_DATES)?.live).toBe(true);
    expect(seasonNote(offAir, PUJA_DATES)?.bangla).toBe("শুভ মহালয়া");
    expect(seasonNote(offAir, PUJA_DATES)?.live).toBe(false);
  });

  it("names the Puja day from the instant of Bodhon", () => {
    expect(seasonNote(bodhon - 1, PUJA_DATES)?.text).toMatch(/^Bodhon this morning/);
    expect(seasonNote(bodhon, PUJA_DATES)?.href).toBe("/utsab#shashthi");
  });

  it("changes day at Bengaluru midnight, not UTC midnight", () => {
    expect(pujaDayAt(Date.parse("2026-10-19T23:59:59+05:30"), PUJA_DATES)).toBe("ashtami");
    expect(pujaDayAt(Date.parse("2026-10-20T00:00:00+05:30"), PUJA_DATES)).toBe("nabami");
  });

  it("survives a schedule with names missing", () => {
    const note = seasonNote(Date.parse("2026-10-19T09:00:00+05:30"), PUJA_DATES, {});
    expect(note?.text).toBe("Today at the TMC Ground: the Puja");
  });
});

describe("the calendar file, with awkward text", () => {
  const tricky = SCHEDULE.map((d) =>
    d.id === "ashtami"
      ? {
          ...d,
          headline: "Anjali; Sandhi, and a back\\slash\nacross two lines — " + "মহাষ্টমীর অঞ্জলি ও সন্ধিপুজো ".repeat(6),
        }
      : d,
  );
  const ics = buildCalendar({ dates: PUJA_DATES, schedule: tricky, venue: DEFAULTS.venue.address, siteUrl: "https://example.org", now: 0 });
  const lines = ics.split("\r\n");

  it("escapes commas, semicolons, backslashes and newlines", () => {
    const unfolded = ics.replace(/\r\n /g, "");
    expect(unfolded).toContain("Anjali\\; Sandhi\\, and a back\\\\slash\\nacross two lines");
  });

  it("folds Bengali at character boundaries, never inside one", () => {
    const strict = new TextDecoder("utf-8", { fatal: true });
    for (const l of lines) {
      const bytes = new TextEncoder().encode(l);
      expect(bytes.length).toBeLessThanOrEqual(75);
      expect(() => strict.decode(bytes)).not.toThrow();
    }
  });

  it("has one event per Puja day plus the broadcast, and a stable stamp", () => {
    expect(ics.match(/BEGIN:VEVENT/g)).toHaveLength(6);
    expect(ics).toContain("DTSTAMP:19700101T000000Z");
  });
});
