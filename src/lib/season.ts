/* ================================================================
   Where the season stands at a given instant.

   Every page on this site is cached, some for ten minutes and some
   until the next deploy, so nothing here may run on the server and
   be trusted. These are plain functions of an instant: the pages
   call them in the browser, and the tests call them with any instant
   they like.

   All the dates are Indian Standard Time. A visitor in another time
   zone still sees "tomorrow" counted in Bengaluru days, because the
   Puja happens in Bengaluru.
   ================================================================ */

import type { PUJA_DATES } from "./site";

export type PujaDates = Record<keyof typeof PUJA_DATES, string>;

/** What a day is called, for the line that names today. */
export type DayNames = Record<string, { tithi: string; tithiBangla: string }>;

export type SeasonNote = {
  text: string;
  bangla: string;
  href: string;
  /** True while something is happening right now. */
  live: boolean;
};

const IST_OFFSET = 330 * 60_000;
const DAY = 86_400_000;

/** Mahishasuramardini runs about ninety minutes from four. */
export const BROADCAST_MINUTES = 90;

/** How long after Dashami the farewell stays up. */
const BIJOYA_DAYS = 10;

/** How far ahead of Mahalaya the line starts counting it down. */
const MAHALAYA_LEAD_DAYS = 7;

/** The Puja days in order, and the key in PUJA_DATES each begins on. */
export const PUJA_DAYS = [
  { id: "shashthi", key: "shashthi" },
  { id: "saptami", key: "saptami" },
  { id: "ashtami", key: "ashtami" },
  { id: "nabami", key: "navami" },
  { id: "dashami", key: "dashami" },
] as const satisfies readonly { id: string; key: keyof typeof PUJA_DATES }[];

/** Midnight in Bengaluru at the start of the day that contains `t`. */
export function istDayStart(t: number): number {
  return Math.floor((t + IST_OFFSET) / DAY) * DAY - IST_OFFSET;
}

/** Whole Bengaluru calendar days from `a` to `b`. */
export function istDaysBetween(a: number, b: number): number {
  return Math.round((istDayStart(b) - istDayStart(a)) / DAY);
}

/** "4 AM", "8:30 AM", "6 PM", in Bengaluru time. */
export function istClock(t: number): string {
  const d = new Date(t + IST_OFFSET);
  const h = d.getUTCHours();
  const m = d.getUTCMinutes();
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}${m ? `:${String(m).padStart(2, "0")}` : ""} ${h < 12 ? "AM" : "PM"}`;
}

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/** "Saturday 10 October", in Bengaluru time. */
export function istDate(t: number): string {
  const d = new Date(t + IST_OFFSET);
  return `${WEEKDAYS[d.getUTCDay()]} ${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}`;
}

/** "20261016", the calendar date in Bengaluru, for an .ics file. */
export function istDateStamp(t: number): string {
  return new Date(istDayStart(t) + IST_OFFSET).toISOString().slice(0, 10).replace(/-/g, "");
}

/** The Puja day whose Bengaluru dates contain `t`, by schedule id. */
export function pujaDayAt(t: number, dates: PujaDates): string | null {
  const mahalaya = istDayStart(Date.parse(dates.mahalaya));
  if (t >= mahalaya && t < mahalaya + DAY) return "mahalaya";

  for (let i = 0; i < PUJA_DAYS.length; i++) {
    const start = istDayStart(Date.parse(dates[PUJA_DAYS[i].key]));
    const next = PUJA_DAYS[i + 1];
    const end = next ? istDayStart(Date.parse(dates[next.key])) : start + DAY;
    if (t >= start && t < end) return PUJA_DAYS[i].id;
  }
  return null;
}

/** First and last calendar day of each Puja day, end exclusive. */
export function pujaDaySpans(dates: PujaDates) {
  return PUJA_DAYS.map((d, i) => {
    const start = istDayStart(Date.parse(dates[d.key]));
    const next = PUJA_DAYS[i + 1];
    const end = next ? istDayStart(Date.parse(dates[next.key])) : start + DAY;
    return { id: d.id, start, end };
  });
}

function inDays(n: number): string {
  if (n === 0) return "today";
  if (n === 1) return "tomorrow";
  return `in ${n} days`;
}

/**
 * The one line the home page leads with, or null when there is
 * nothing to say. It walks the season in order: Mahalaya coming,
 * the broadcast on air, Shubho Mahalaya, Bodhon coming, today at
 * the pandal, Shubho Bijoya.
 */
export function seasonNote(t: number, dates: PujaDates, names: DayNames = {}): SeasonNote | null {
  const broadcast = Date.parse(dates.mahalaya);
  const offAir = broadcast + BROADCAST_MINUTES * 60_000;
  const mahalayaEnd = istDayStart(broadcast) + DAY;
  const bodhon = Date.parse(dates.arrival);
  const dashamiEnd = istDayStart(Date.parse(dates.dashami)) + DAY;

  if (t < broadcast) {
    const n = istDaysBetween(t, broadcast);
    if (n > MAHALAYA_LEAD_DAYS) return null;
    return {
      text:
        n === 0
          ? `Mahalaya is here. Mahishasuramardini at ${istClock(broadcast)}`
          : `Mahalaya ${inDays(n)}, ${istDate(broadcast)}. Mahishasuramardini at ${istClock(broadcast)}`,
      bangla: "আশ্বিনের শারদপ্রাতে",
      href: "/mahalaya",
      live: false,
    };
  }

  if (t < offAir) {
    return {
      text: "Mahishasuramardini is on air now",
      bangla: "শুভ মহালয়া",
      href: "/mahalaya#listen",
      live: true,
    };
  }

  if (t < mahalayaEnd) {
    return {
      text: `Shubho Mahalaya. Devi Paksha has begun, and Bodhon is ${inDays(istDaysBetween(t, bodhon))}`,
      bangla: "শুভ মহালয়া",
      href: "/utsab",
      live: false,
    };
  }

  if (t < bodhon) {
    const n = istDaysBetween(t, bodhon);
    return {
      text:
        n === 0
          ? `Bodhon this morning by ${istClock(bodhon)} at the TMC Ground`
          : `Bodhon ${inDays(n)}, ${istDate(bodhon)}, at the TMC Ground`,
      bangla: "মা আসছেন",
      href: "/utsab",
      live: false,
    };
  }

  if (t < dashamiEnd) {
    const id = pujaDayAt(t, dates) ?? "shashthi";
    const name = names[id];
    return {
      text: `Today at the TMC Ground: ${name?.tithi ?? "the Puja"}`,
      bangla: name?.tithiBangla ?? "মা এসেছেন",
      href: `/utsab#${id}`,
      live: true,
    };
  }

  if (t < dashamiEnd + BIJOYA_DAYS * DAY) {
    return {
      text: "Shubho Bijoya. Thank you for coming, and see you next year",
      bangla: "শুভ বিজয়া",
      href: "/gallery",
      live: false,
    };
  }

  return null;
}
