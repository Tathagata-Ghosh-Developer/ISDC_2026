/* ================================================================
   The Puja as a calendar file.

   One .ics with the Mahalaya broadcast and each of the five days, so
   "mark the dates" is a tap rather than an instruction. Built from
   the same schedule the Utsab page reads, so an edit in the console
   reaches people's calendars the next time they add it.

   RFC 5545 is strict about three things that are easy to get wrong:
   lines end in CRLF, no line runs past 75 octets (and a fold must not
   split a Bengali character in half), and commas, semicolons and
   backslashes in text are escaped.
   ================================================================ */

import { BROADCAST_MINUTES, istDateStamp, pujaDaySpans, type PujaDates } from "./season";
import type { PujaDay } from "./content/schedule";

type Input = {
  dates: PujaDates;
  schedule: PujaDay[];
  venue: string;
  siteUrl: string;
  /** When the file was made, for DTSTAMP. */
  now: number;
};

const HOST = "iiscsharodiyadurgotsab";

function escapeText(s: string): string {
  return s
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

/** Fold to 75 octets per line without splitting a multi-byte character. */
function fold(line: string): string {
  const enc = new TextEncoder();
  const out: string[] = [];
  let cur = "";
  let bytes = 0;
  for (const ch of line) {
    const n = enc.encode(ch).length;
    // continuation lines start with a space, which counts toward the 75
    const limit = out.length === 0 ? 75 : 74;
    if (bytes + n > limit) {
      out.push(cur);
      cur = "";
      bytes = 0;
    }
    cur += ch;
    bytes += n;
  }
  out.push(cur);
  return out.join("\r\n ");
}

function utcStamp(t: number): string {
  return new Date(t).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

export function buildCalendar({ dates, schedule, venue, siteUrl, now }: Input): string {
  const stamp = utcStamp(now);
  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//IISc Sharodiya Durgotsab//Puja 2026//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:IISc Durga Puja 2026",
    "X-WR-TIMEZONE:Asia/Kolkata",
  ];

  const broadcast = Date.parse(dates.mahalaya);
  lines.push(
    "BEGIN:VEVENT",
    `UID:mahalaya-broadcast-${istDateStamp(broadcast)}@${HOST}`,
    `DTSTAMP:${stamp}`,
    `DTSTART:${utcStamp(broadcast)}`,
    `DTEND:${utcStamp(broadcast + BROADCAST_MINUTES * 60_000)}`,
    `SUMMARY:${escapeText("Mahalaya: Mahishasuramardini on the radio")}`,
    `DESCRIPTION:${escapeText(
      `Birendra Krishna Bhadra's recitation, on Akashvani Kolkata at four in the morning, as on every Mahalaya since the 1930s. The 1966 recording also plays at ${siteUrl}/mahalaya`,
    )}`,
    `URL:${siteUrl}/mahalaya`,
    "BEGIN:VALARM",
    "ACTION:DISPLAY",
    `DESCRIPTION:${escapeText("Mahishasuramardini in ten minutes")}`,
    "TRIGGER:-PT10M",
    "END:VALARM",
    "END:VEVENT",
  );

  const byId = new Map(schedule.map((d) => [d.id, d]));
  for (const span of pujaDaySpans(dates)) {
    const day = byId.get(span.id);
    if (!day) continue;
    const rituals = day.rituals.map((r) => `${r.time}: ${r.title}`).join("\n");
    lines.push(
      "BEGIN:VEVENT",
      `UID:${span.id}-${istDateStamp(span.start)}@${HOST}`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${istDateStamp(span.start)}`,
      `DTEND;VALUE=DATE:${istDateStamp(span.end)}`,
      `SUMMARY:${escapeText(`${day.tithi}, IISc Durga Puja`)}`,
      `DESCRIPTION:${escapeText(`${day.headline}\n\n${rituals}\n\nFull schedule: ${siteUrl}/utsab#${span.id}`)}`,
      `LOCATION:${escapeText(venue)}`,
      `URL:${siteUrl}/utsab#${span.id}`,
      "TRANSP:TRANSPARENT",
      "END:VEVENT",
    );
  }

  lines.push("END:VCALENDAR");
  return lines.map(fold).join("\r\n") + "\r\n";
}
