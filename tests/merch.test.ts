/**
 * The merchandise, the partners, and the edges of the season logic
 * that a cached page meets in a visitor's browser.
 */
import { existsSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import { FOOD_STALL, MERCH, PARTNERS, PUJA_DATES, SPONSOR_TIERS, TITLE_SPONSOR } from "@/lib/site";
import { shouldOffer } from "@/lib/merch";
import { SCHEDULE } from "@/lib/content/schedule";
import { BROADCAST_MINUTES, pujaDayAt, seasonNote } from "@/lib/season";
import { buildCalendar } from "@/lib/calendar";
import { DEFAULTS } from "@/lib/config";
import { pujaFaq } from "@/lib/faq";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const pub = (p: string) => join(ROOT, "public", p.replace(/^\//, ""));

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

describe("the film and the 3D shirt", () => {
  const size = (f: string) => statSync(pub(`/media/merch/${f}`)).size;
  const PHONE = ["tee-loop-720p30.webm", "tee-loop-720p30.mp4", "tee-poster-720.webp"];
  const DESK = ["tee-loop-1080p60.webm", "tee-loop-1080p60.mp4", "tee-poster.webp"];

  it("every file the stage, the viewer and the pages load is present and not empty", () => {
    for (const f of [...PHONE, ...DESK, "tee.glb", "kash-sky.webp", "flat-front.webp", "flat-back.webp"]) {
      expect(existsSync(pub(`/media/merch/${f}`)), f).toBe(true);
      expect(size(f), f).toBeGreaterThan(1000);
    }
  });

  it("a phone on Jio gets the film for well under a megabyte", () => {
    // the popup plays one source, never both
    expect(Math.max(size(PHONE[0]), size(PHONE[1])) + size(PHONE[2])).toBeLessThan(600 * 1024);
  });

  it("the full-size film and the 3D model stay small", () => {
    expect(Math.max(size(DESK[0]), size(DESK[1]))).toBeLessThan(2 * 1024 * 1024);
    expect(size("tee.glb")).toBeLessThan(2 * 1024 * 1024);
  });

  it("the model is a binary glTF", () => {
    const head = readFileSync(pub("/media/merch/tee.glb")).subarray(0, 8);
    expect(head.subarray(0, 4).toString("ascii")).toBe("glTF");
    expect(head.readUInt32LE(4)).toBe(2);
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

  it("charts every size it sells, chest growing two inches a size", () => {
    expect(MERCH.chart.map((c) => c.size)).toEqual([...MERCH.sizes]);
    MERCH.chart.forEach((c, i) => expect(c.chest).toBe(38 + 2 * i));
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

  it("names the bronze sponsor at a real tier, at that tier's price", () => {
    const britton = PARTNERS.find((p) => p.id === "bronze-britton");
    expect(britton?.name).toBe("Britton Innotech");
    expect(britton?.tier).toBe("bronze");
    const bronze = SPONSOR_TIERS.find((t) => t.id === britton?.tier);
    expect(bronze?.amount).toBe(britton?.contribution);
    for (const p of PARTNERS) if (p.tier) expect(SPONSOR_TIERS.some((t) => t.id === p.tier), p.id).toBe(true);
  });

  it("puts the food partner and its NGO on one tile for one payment, with the menu on disk", () => {
    const food = PARTNERS.find((p) => p.id === "food");
    expect(food?.name).toBe("Swadisht Bhojan Adda");
    expect(food?.contribution).toBe(15000);
    expect(food?.with?.name).toBe("Prakriti Foundation");
    expect(existsSync(pub(food!.with!.logo))).toBe(true);
    expect(PARTNERS.some((p) => p.id === "ngo")).toBe(false); // one partnership, counted once
    expect(FOOD_STALL.partner).toBe("food");
    expect(existsSync(pub(FOOD_STALL.menu))).toBe(true);
  });

  it("never invents a link for a partner nobody could verify", () => {
    expect(PARTNERS.find((p) => p.id === "jewellery")?.url).toBe("");
    for (const id of ["bronze-britton", "food"]) expect(PARTNERS.find((p) => p.id === id)?.url, id).toBe("");
    expect(PARTNERS.find((p) => p.id === "food")?.with?.url).toBe("");
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
