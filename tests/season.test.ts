/**
 * The season line, the countdown stages, the calendar file and the
 * structured data all hang off a handful of date functions. They run
 * in the browser against cached pages, so the only place their edges
 * get checked is here.
 */
import { describe, expect, it } from "vitest";

import { PUJA_DATES } from "@/lib/site";
import { SCHEDULE } from "@/lib/content/schedule";
import {
  bijoyaFrom,
  istClock,
  istDate,
  istDateStamp,
  istDaysBetween,
  pujaDayAt,
  pujaDaySpans,
  seasonNote,
} from "@/lib/season";
import { buildCalendar } from "@/lib/calendar";
import { DEFAULTS } from "@/lib/config";
import { pujaFaq } from "@/lib/faq";
import { jsonLd, pujaGraph, siteGraph } from "@/lib/structured";

const at = (iso: string) => Date.parse(iso);
const names = Object.fromEntries(SCHEDULE.map((d) => [d.id, d]));

describe("Bengaluru time helpers", () => {
  it("formats the broadcast in IST whatever the machine's zone", () => {
    expect(istClock(at(PUJA_DATES.mahalaya))).toBe("4 AM");
    expect(istClock(at(PUJA_DATES.arrival))).toBe("8:30 AM");
    expect(istDate(at(PUJA_DATES.mahalaya))).toBe("Saturday 10 October");
    expect(istDate(at(PUJA_DATES.arrival))).toBe("Friday 16 October");
  });

  it("counts calendar days in Bengaluru, not in UTC", () => {
    // 11:45 PM IST on the 9th is 6:15 PM UTC; Mahalaya is still tomorrow.
    expect(istDaysBetween(at("2026-10-09T23:45:00+05:30"), at(PUJA_DATES.mahalaya))).toBe(1);
    // 12:15 AM IST on the 10th is still the 9th in UTC; Mahalaya is today.
    expect(istDaysBetween(at("2026-10-10T00:15:00+05:30"), at(PUJA_DATES.mahalaya))).toBe(0);
  });

  it("stamps calendar dates in IST", () => {
    expect(istDateStamp(at(PUJA_DATES.mahalaya))).toBe("20261010");
  });
});

describe("which Puja day it is", () => {
  it("covers Saptami across both its days", () => {
    expect(pujaDayAt(at("2026-10-17T10:00:00+05:30"), PUJA_DATES)).toBe("saptami");
    expect(pujaDayAt(at("2026-10-18T23:59:00+05:30"), PUJA_DATES)).toBe("saptami");
    expect(pujaDayAt(at("2026-10-19T00:01:00+05:30"), PUJA_DATES)).toBe("ashtami");
  });

  it("knows Mahalaya, and nothing outside the season", () => {
    expect(pujaDayAt(at("2026-10-10T12:00:00+05:30"), PUJA_DATES)).toBe("mahalaya");
    expect(pujaDayAt(at("2026-10-12T12:00:00+05:30"), PUJA_DATES)).toBeNull();
    expect(pujaDayAt(at("2026-10-22T00:01:00+05:30"), PUJA_DATES)).toBeNull();
  });

  it("gives every schedule day a span that exists in the schedule", () => {
    const ids = new Set(SCHEDULE.map((d) => d.id));
    for (const s of pujaDaySpans(PUJA_DATES)) {
      expect(ids.has(s.id)).toBe(true);
      expect(s.end).toBeGreaterThan(s.start);
    }
  });
});

describe("the season line", () => {
  const note = (iso: string) => seasonNote(at(iso), PUJA_DATES, names);

  it("is silent more than a week before Mahalaya", () => {
    expect(note("2026-10-01T12:00:00+05:30")).toBeNull();
  });

  it("counts Mahalaya down, then goes on air, then wishes Shubho Mahalaya", () => {
    expect(note("2026-10-09T12:00:00+05:30")?.text).toMatch(/^Mahalaya tomorrow, Saturday 10 October\. Mahishasuramardini at 4 AM$/);
    expect(note("2026-10-10T02:00:00+05:30")?.text).toMatch(/^Mahalaya is here/);
    const onAir = note("2026-10-10T04:30:00+05:30");
    expect(onAir?.live).toBe(true);
    expect(onAir?.href).toBe("/mahalaya#listen");
    expect(note("2026-10-10T09:00:00+05:30")?.text).toMatch(/^Shubho Mahalaya.*Bodhon is in 6 days$/);
  });

  it("counts to Bodhon, then names the day at the pandal, then says goodbye", () => {
    expect(note("2026-10-15T09:00:00+05:30")?.text).toMatch(/^Bodhon tomorrow, Friday 16 October/);
    expect(note("2026-10-16T06:00:00+05:30")?.text).toMatch(/^Bodhon this morning by 8:30 AM/);
    const ashtami = note("2026-10-19T07:30:00+05:30");
    expect(ashtami?.text).toBe("Today at the TMC Ground: Maha Ashtami");
    expect(ashtami?.href).toBe("/utsab#ashtami");
    expect(note("2026-10-22T09:00:00+05:30")?.bangla).toBe("শুভ বিজয়া");
    // Bijoya stays up to the end of the year and points at the board.
    expect(note("2026-11-15T09:00:00+05:30")?.href).toBe("/daan/board");
    expect(note("2026-12-31T23:30:00+05:30")?.bangla).toBe("শুভ বিজয়া");
    expect(note("2027-01-01T00:30:00+05:30")).toBeNull();
  });

  it("turns to Bijoya at midnight IST at the end of Dashami", () => {
    expect(bijoyaFrom(PUJA_DATES)).toBe(at("2026-10-22T00:00:00+05:30"));
  });
});

describe("the calendar file", () => {
  const ics = buildCalendar({
    dates: PUJA_DATES,
    schedule: SCHEDULE,
    venue: DEFAULTS.venue.address,
    siteUrl: "https://example.org",
    now: at("2026-10-09T12:00:00+05:30"),
  });

  it("is CRLF throughout with no line over 75 octets", () => {
    expect(ics.endsWith("\r\n")).toBe(true);
    const lines = ics.split("\r\n");
    expect(lines.every((l) => !l.includes("\n"))).toBe(true);
    const enc = new TextEncoder();
    expect(lines.every((l) => enc.encode(l).length <= 75)).toBe(true);
  });

  it("puts the broadcast at 4 AM IST with a reminder, and Saptami across two days", () => {
    expect(ics).toContain("DTSTART:20261009T223000Z");
    expect(ics).toContain("TRIGGER:-PT10M");
    expect(ics).toContain("DTSTART;VALUE=DATE:20261017\r\nDTEND;VALUE=DATE:20261019");
    expect(ics.match(/BEGIN:VEVENT/g)).toHaveLength(6);
  });
});

describe("structured data and answers", () => {
  const faq = pujaFaq(DEFAULTS);

  it("answers from the config, including the UPI id and Sandhi Puja", () => {
    const text = faq.map((f) => f.a).join(" ");
    expect(text).toContain(DEFAULTS.bank.upiId);
    expect(text).toContain("7:26 to 8:14 AM");
    expect(text).toContain("Saturday 10 October 2026");
  });

  it("serialises to valid JSON that cannot close its script tag", () => {
    for (const g of [siteGraph(DEFAULTS), pujaGraph(DEFAULTS, faq)]) {
      const s = jsonLd(g);
      expect(s).not.toContain("<");
      expect(() => JSON.parse(s)).not.toThrow();
    }
  });

  it("describes a free festival from Shashthi to Dashami", () => {
    const graph = pujaGraph(DEFAULTS, faq)["@graph"];
    const festival = graph[0] as Record<string, unknown>;
    expect(festival.startDate).toBe(PUJA_DATES.arrival);
    expect(festival.endDate).toBe("2026-10-21");
    expect(festival.isAccessibleForFree).toBe(true);
    expect((festival.subEvent as unknown[]).length).toBe(5);
  });
});
