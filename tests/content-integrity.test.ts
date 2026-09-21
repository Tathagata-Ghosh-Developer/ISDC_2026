/**
 * The content tables.
 *
 * None of this is logic; all of it is data that the pages trust. A
 * duplicated id, a video id that is one character short or a photograph
 * that was never committed does not fail the build and does not fail
 * type checking. It fails in front of a visitor.
 */
import { existsSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import { COLLECTIONS, AMBIENCE } from "@/lib/content/music";
import { ART_FORMS, ART_CATEGORIES } from "@/lib/content/artforms";
import { ART_DETAIL, CARD_IMAGE } from "@/lib/content/artform-detail";
import { IMAGES as BIPLOB_IMAGES, FIGURES, SECTIONS } from "@/lib/content/revolutionaries";
import { SCHEDULE } from "@/lib/content/schedule";
import { NAV, MAGAZINES, SITE, COMMITTEE, POINTS_OF_CONTACT } from "@/lib/site";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const PUBLIC = join(ROOT, "public");
const APP = join(ROOT, "src", "app");

/** A public path like "/media/shilpa/alpona-1.jpg" on disk. */
function publicFile(src: string): string {
  return join(PUBLIC, src.replace(/^\//, "").split("/").join("/"));
}

function duplicates<T>(items: T[]): T[] {
  const seen = new Set<T>();
  const dup = new Set<T>();
  for (const i of items) {
    if (seen.has(i)) dup.add(i);
    seen.add(i);
  }
  return [...dup];
}

/* ------------------------------------------------------------------
   music.ts
   ------------------------------------------------------------------ */

describe("music", () => {
  const tracks = COLLECTIONS.flatMap((c) => c.tracks.map((t) => ({ ...t, collection: c.id })));

  it("has tracks at all", () => {
    expect(tracks.length).toBeGreaterThan(0);
  });

  it("gives every track an eleven-character YouTube id", () => {
    // A YouTube video id is always exactly 11 characters of
    // [A-Za-z0-9_-]. Anything else is a paste that lost a character or
    // kept the whole URL, and the embed will be a grey box.
    const wrong = tracks
      .filter((t) => !/^[A-Za-z0-9_-]{11}$/.test(t.youtubeId))
      .map((t) => `${t.collection}/${t.titleRoman}: ${JSON.stringify(t.youtubeId)}`);
    expect(wrong).toEqual([]);
  });

  it("never embeds the same video twice", () => {
    const dup = duplicates(tracks.map((t) => t.youtubeId));
    const where = dup.map(
      (id) =>
        `${id} in ${tracks
          .filter((t) => t.youtubeId === id)
          .map((t) => `${t.collection}/${t.titleRoman}`)
          .join(", ")}`,
    );
    expect(where).toEqual([]);
  });

  it("gives every collection a unique id and a non-empty track list", () => {
    const ids = COLLECTIONS.map((c) => c.id);
    expect(duplicates(ids)).toEqual([]);
    for (const c of COLLECTIONS) expect(c.tracks.length, c.id).toBeGreaterThan(0);
  });

  it("names an artist and a channel on every track", () => {
    for (const t of tracks) {
      expect(t.titleRoman.trim().length, JSON.stringify(t)).toBeGreaterThan(0);
      expect(t.artist.trim().length, t.titleRoman).toBeGreaterThan(0);
      expect(t.channel.trim().length, t.titleRoman).toBeGreaterThan(0);
    }
  });

  it("credits a licence and a source on every ambient layer", () => {
    const ids = AMBIENCE.map((a) => a.id);
    expect(duplicates(ids)).toEqual([]);
    for (const a of AMBIENCE) {
      expect(a.licence.trim().length, a.id).toBeGreaterThan(0);
      expect(a.attribution.trim().length, a.id).toBeGreaterThan(0);
      expect(a.sourceUrl.startsWith("https://"), a.id).toBe(true);
      expect(a.remoteUrl.startsWith("https://"), a.id).toBe(true);
    }
  });
});

/* ------------------------------------------------------------------
   artforms.ts and artform-detail.ts
   ------------------------------------------------------------------ */

describe("art forms", () => {
  it("gives every art form a unique id", () => {
    const ids = ART_FORMS.map((a) => a.id);
    expect(duplicates(ids)).toEqual([]);
  });

  it("uses slug-safe ids, because each one becomes a URL", () => {
    for (const a of ART_FORMS) expect(a.id, a.name).toMatch(/^[a-z0-9-]+$/);
  });

  it("puts every art form in a declared category", () => {
    const allowed = new Set<string>(ART_CATEGORIES);
    for (const a of ART_FORMS) expect(allowed.has(a.category), `${a.id}: ${a.category}`).toBe(true);
  });

  it("has a detail page for every art form on the index", () => {
    const missing = ART_FORMS.filter((a) => !(a.id in ART_DETAIL)).map((a) => a.id);
    expect(missing).toEqual([]);
  });

  it("has no detail entry that no art form points at", () => {
    const ids = new Set(ART_FORMS.map((a) => a.id));
    const orphans = Object.keys(ART_DETAIL).filter((k) => !ids.has(k));
    expect(orphans).toEqual([]);
  });

  it("gives every art form a card image", () => {
    const missing = ART_FORMS.filter((a) => !CARD_IMAGE[a.id]).map((a) => a.id);
    expect(missing).toEqual([]);
  });

  it("has every detail image on disk under public/", () => {
    const missing: string[] = [];
    for (const [id, detail] of Object.entries(ART_DETAIL)) {
      for (const img of detail.images) {
        const file = publicFile(img.src);
        if (!existsSync(file)) missing.push(`${id}: ${img.src}`);
        else if (statSync(file).size === 0) missing.push(`${id}: ${img.src} (empty file)`);
      }
    }
    expect(missing).toEqual([]);
  });

  it("uses a site-relative path for every detail image", () => {
    for (const [id, detail] of Object.entries(ART_DETAIL)) {
      for (const img of detail.images) expect(img.src, id).toMatch(/^\/media\//);
    }
  });

  it("credits a licence on every detail image", () => {
    for (const [id, detail] of Object.entries(ART_DETAIL)) {
      for (const img of detail.images) {
        expect(img.licence.trim().length, `${id}: ${img.src}`).toBeGreaterThan(0);
        expect(img.attribution.trim().length, `${id}: ${img.src}`).toBeGreaterThan(0);
      }
    }
  });

  it("gives every embedded detail video an eleven-character id", () => {
    const wrong: string[] = [];
    for (const [id, detail] of Object.entries(ART_DETAIL)) {
      for (const v of detail.videos) {
        if (!/^[A-Za-z0-9_-]{11}$/.test(v.youtubeId)) wrong.push(`${id}: ${v.youtubeId}`);
      }
    }
    expect(wrong).toEqual([]);
  });
});

/* ------------------------------------------------------------------
   revolutionaries.ts
   ------------------------------------------------------------------ */

describe("the Biplob chapter", () => {
  it("gives every image a unique id", () => {
    expect(duplicates(BIPLOB_IMAGES.map((i) => i.id))).toEqual([]);
  });

  it("has every image on disk under public/", () => {
    const missing = BIPLOB_IMAGES.filter((i) => !existsSync(publicFile(i.src))).map(
      (i) => `${i.id}: ${i.src}`,
    );
    expect(missing).toEqual([]);
  });

  it("has no empty image files", () => {
    const empty = BIPLOB_IMAGES.filter(
      (i) => existsSync(publicFile(i.src)) && statSync(publicFile(i.src)).size === 0,
    ).map((i) => i.src);
    expect(empty).toEqual([]);
  });

  it("credits a licence and an attribution on every image", () => {
    for (const i of BIPLOB_IMAGES) {
      expect(i.licence.trim().length, i.id).toBeGreaterThan(0);
      expect(i.attribution.trim().length, i.id).toBeGreaterThan(0);
    }
  });

  it("gives every section a unique id and every figure a unique name", () => {
    expect(duplicates(SECTIONS.map((s) => s.id))).toEqual([]);
    expect(duplicates(FIGURES.map((f) => f.name))).toEqual([]);
  });

  it("labels every section with a confidence the page knows how to render", () => {
    const allowed = new Set(["verified", "contested", "unverified"]);
    for (const s of SECTIONS) expect(allowed.has(s.confidence), s.id).toBe(true);
  });

  it("cites a source for every figure, which is the whole claim of the chapter", () => {
    for (const f of FIGURES) {
      expect(f.source.trim().length, f.name).toBeGreaterThan(0);
      expect(f.what.trim().length, f.name).toBeGreaterThan(0);
      // Some figures are dated only by the years they were active
      // ("fl. 1926-1940s"), so this asks for a century, not a format.
      expect(f.years, f.name).toMatch(/1[6-9]\d{2}/);
    }
  });
});

/* ------------------------------------------------------------------
   schedule.ts
   ------------------------------------------------------------------ */

describe("the schedule", () => {
  it("has no duplicate day ids", () => {
    expect(duplicates(SCHEDULE.map((d) => d.id))).toEqual([]);
  });

  it("uses slug-safe day ids, because they become anchors", () => {
    for (const d of SCHEDULE) expect(d.id, d.tithi).toMatch(/^[a-z0-9-]+$/);
  });

  it("gives every day at least one ritual", () => {
    for (const d of SCHEDULE) expect(d.rituals.length, d.id).toBeGreaterThan(0);
  });

  it("has no duplicate ritual inside a single day", () => {
    for (const d of SCHEDULE) {
      const keys = d.rituals.map((r) => `${r.time}|${r.title}`);
      expect(duplicates(keys), d.id).toEqual([]);
    }
  });

  /**
   * A day may cover two calendar dates: Saptami 2026 is written
   * "17 and 18 October 2026" / "Saturday and Sunday". Both forms are
   * expanded here so each date can be checked against its own weekday.
   */
  function datesOf(text: string): Date[] {
    const m = /^(.+?)\s+([A-Za-z]+)\s+(\d{4})$/.exec(text.trim());
    if (!m) return [];
    const [, dayPart, month, year] = m;
    return dayPart
      .split(/\s+and\s+/)
      .map((day) => new Date(`${day.trim()} ${month} ${year} 12:00:00 GMT+0530`));
  }

  it("gives every day a date that parses", () => {
    for (const d of SCHEDULE) {
      const dates = datesOf(d.date);
      expect(dates.length, `${d.id}: ${d.date}`).toBeGreaterThan(0);
      for (const parsed of dates) {
        expect(Number.isNaN(parsed.getTime()), `${d.id}: ${d.date}`).toBe(false);
      }
    }
  });

  it("names the right weekday for every date, including two-day tithis", () => {
    // Printing Monday against a Sunday sends people to an empty ground.
    const fmt = new Intl.DateTimeFormat("en-GB", {
      weekday: "long",
      timeZone: "Asia/Kolkata",
    });
    for (const d of SCHEDULE) {
      const dates = datesOf(d.date);
      const stated = d.weekday.split(/\s+and\s+/).map((w) => w.trim());
      expect(stated.length, `${d.id}: ${d.date} vs ${d.weekday}`).toBe(dates.length);
      dates.forEach((parsed, i) => {
        expect(fmt.format(parsed), `${d.id}: ${d.date}`).toBe(stated[i]);
      });
    }
  });

  it("runs in date order", () => {
    const times = SCHEDULE.map((d) => datesOf(d.date)[0].getTime());
    expect(times.some(Number.isNaN)).toBe(false);
    expect(times).toEqual([...times].sort((a, b) => a - b));
  });
});

/* ------------------------------------------------------------------
   site.ts
   ------------------------------------------------------------------ */

describe("the navigation", () => {
  it("points every entry at a route that exists", () => {
    const missing = NAV.filter((item) => {
      const segments = item.href.replace(/^\//, "").split("/");
      const dir = join(APP, ...segments);
      return !existsSync(join(dir, "page.tsx")) && !existsSync(join(dir, "page.ts"));
    }).map((item) => `${item.label} -> ${item.href}`);
    expect(missing).toEqual([]);
  });

  it("has no duplicate href", () => {
    expect(duplicates(NAV.map((n) => n.href))).toEqual([]);
  });

  it("uses absolute internal hrefs with no trailing slash", () => {
    for (const n of NAV) {
      expect(n.href, n.label).toMatch(/^\/[a-z0-9/-]*[a-z0-9]$/);
      expect(n.label.trim().length, n.href).toBeGreaterThan(0);
      expect(n.bangla.trim().length, n.href).toBeGreaterThan(0);
    }
  });
});

describe("site assets", () => {
  it("has the brand images on disk", () => {
    for (const src of [SITE.logo, SITE.logoMono, SITE.icon]) {
      expect(existsSync(publicFile(src)), src).toBe(true);
    }
  });

  it("has the campus map on disk", () => {
    expect(existsSync(publicFile(SITE.campusMapPdf)), SITE.campusMapPdf).toBe(true);
  });

  it("has every back issue of the magazine on disk", () => {
    const missing = MAGAZINES.filter((m) => !existsSync(publicFile(m.file))).map((m) => m.file);
    expect(missing).toEqual([]);
    expect(duplicates(MAGAZINES.map((m) => m.id))).toEqual([]);
  });

  it("has a site URL with no trailing slash", () => {
    expect(SITE.url).toMatch(/^https?:\/\/[^/]+$/);
  });
});

describe("the committee sheet", () => {
  it("names every point of contact as somebody on the committee", () => {
    const names = new Set<string>(COMMITTEE.map((m) => m.name));
    const unknown: string[] = [];
    for (const p of POINTS_OF_CONTACT) {
      for (const who of p.who) if (!names.has(who)) unknown.push(`${p.area}: ${who}`);
    }
    expect(unknown).toEqual([]);
  });

  it("stores published phone numbers as ten digits", () => {
    for (const m of COMMITTEE) {
      if (m.phone !== "") expect(m.phone, m.name).toMatch(/^\d{10}$/);
    }
  });
});
