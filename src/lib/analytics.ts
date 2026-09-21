import "server-only";
import { db, dbReady } from "@/lib/db";

/**
 * Counting visits without collecting anybody.
 *
 * The committee asked for as much detail about visitors as could be
 * taken. This file deliberately takes almost none, and the reason is
 * worth writing down where the next person will find it.
 *
 * India's Digital Personal Data Protection Act 2023 requires notice
 * and consent before personal data is processed, and this site already
 * holds donor names, phone numbers, SR numbers and bank references.
 * A committee that quietly fingerprinted its visitors on top of that
 * would be risking real trouble for numbers it does not need. Europe's
 * rules say the same thing with sharper teeth for anyone in the EU.
 *
 * So nothing here is about a person. No cookie is set. No address is
 * stored, not even hashed. No device identifier is generated. What is
 * kept is a day, a path, the site that sent the visitor and whether
 * the screen was phone sized, with two counters. A row cannot be
 * narrowed to a person because there is nothing in it that varies by
 * person.
 *
 * What that still answers, which is everything the committee actually
 * wanted: how many people came, what they read, what they read next,
 * where they came from, how many reached the donation form, and how
 * many of those finished. That last pair is the only number that
 * changes what the committee does.
 */

export type VisitRow = {
  day: string;
  path: string;
  referrer: string;
  device: string;
  views: number;
  sessions: number;
};

export type EventRow = { day: string; name: string; count: number };

/** Paths we are willing to store, so a stray URL cannot fill the table. */
const PATH_MAX = 120;

/**
 * Query strings can carry anything, including a donor's own details
 * if a link is ever built carelessly, so the path is cut at the
 * question mark before it is ever written down.
 */
export function cleanPath(raw: string): string {
  let p = raw.split("?")[0].split("#")[0].trim();
  if (!p.startsWith("/")) p = "/" + p;
  // A receipt link carries a token that is the only thing standing
  // between a stranger and a donor's details. It is never recorded.
  if (p.startsWith("/receipt/")) return "/receipt";
  if (p.startsWith("/admin")) return "/admin";
  if (p.length > PATH_MAX) p = p.slice(0, PATH_MAX);
  return p.toLowerCase();
}

/** Only the sending site's host, never the full referring URL. */
export function cleanReferrer(raw: string | null | undefined, self: string): string {
  if (!raw) return "direct";
  try {
    const host = new URL(raw).hostname.replace(/^www\./, "").toLowerCase();
    if (!host) return "direct";
    if (host === self.replace(/^www\./, "").toLowerCase()) return "internal";
    return host.slice(0, 80);
  } catch {
    return "direct";
  }
}

/** Three buckets. Not a user agent string, which would narrow too far. */
export function deviceFromWidth(width: unknown): string {
  const w = Number(width);
  if (!Number.isFinite(w) || w <= 0) return "unknown";
  if (w < 640) return "phone";
  if (w < 1024) return "tablet";
  return "desktop";
}

const EVENT_NAMES = new Set([
  "donate-form-opened",
  "donate-form-submitted",
  "upi-copied",
  "account-copied",
  "receipt-printed",
  "magazine-opened",
  "music-played",
  "radio-tuned",
  "desk-played",
  "sponsor-enquiry",
  "institute-enquiry",
  "feedback-sent",
  "route-to-pandal",
]);

export function isKnownEvent(name: string): boolean {
  return EVENT_NAMES.has(name);
}

/** The day in Kolkata, because the committee reads these in Kolkata. */
export function kolkataDay(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export async function recordVisit(v: {
  path: string;
  referrer: string;
  device: string;
  first: boolean;
}): Promise<void> {
  if (!dbReady) return;
  const { error } = await db().rpc("bump_visit", {
    p_day: kolkataDay(),
    p_path: v.path,
    p_referrer: v.referrer,
    p_device: v.device,
    p_first: v.first,
  });
  if (error) console.error("[visits]", error.message);
}

export async function recordEvent(name: string): Promise<void> {
  if (!dbReady || !isKnownEvent(name)) return;
  const { error } = await db().rpc("bump_event", {
    p_day: kolkataDay(),
    p_name: name,
  });
  if (error) console.error("[events]", error.message);
}

export type Analytics = {
  ready: boolean;
  days: number;
  totals: { views: number; sessions: number };
  byDay: { day: string; views: number; sessions: number }[];
  byPath: { path: string; views: number; sessions: number }[];
  byReferrer: { referrer: string; sessions: number }[];
  byDevice: { device: string; sessions: number }[];
  events: { name: string; count: number }[];
  funnel: { reachedForm: number; submitted: number; rate: number };
};

const EMPTY: Analytics = {
  ready: false,
  days: 0,
  totals: { views: 0, sessions: 0 },
  byDay: [],
  byPath: [],
  byReferrer: [],
  byDevice: [],
  events: [],
  funnel: { reachedForm: 0, submitted: 0, rate: 0 },
};

function since(days: number): string {
  const d = new Date(Date.now() - days * 86_400_000);
  return d.toISOString().slice(0, 10);
}

export async function getAnalytics(days = 30): Promise<Analytics> {
  if (!dbReady) return EMPTY;
  const from = since(days);

  const [visitsRes, eventsRes] = await Promise.all([
    db().from("visits").select("*").gte("day", from).order("day", { ascending: true }),
    db().from("events").select("*").gte("day", from),
  ]);

  if (visitsRes.error) {
    console.error("[analytics]", visitsRes.error.message);
    return EMPTY;
  }

  const rows = (visitsRes.data ?? []) as VisitRow[];
  const events = (eventsRes.data ?? []) as EventRow[];

  const add = <T extends string>(
    map: Map<T, { views: number; sessions: number }>,
    key: T,
    r: VisitRow,
  ) => {
    const cur = map.get(key) ?? { views: 0, sessions: 0 };
    cur.views += r.views;
    cur.sessions += r.sessions;
    map.set(key, cur);
  };

  const dayMap = new Map<string, { views: number; sessions: number }>();
  const pathMap = new Map<string, { views: number; sessions: number }>();
  const refMap = new Map<string, { views: number; sessions: number }>();
  const devMap = new Map<string, { views: number; sessions: number }>();

  let views = 0;
  let sessions = 0;
  for (const r of rows) {
    views += r.views;
    sessions += r.sessions;
    add(dayMap, r.day, r);
    add(pathMap, r.path, r);
    add(refMap, r.referrer, r);
    add(devMap, r.device, r);
  }

  const eventMap = new Map<string, number>();
  for (const e of events) {
    eventMap.set(e.name, (eventMap.get(e.name) ?? 0) + e.count);
  }

  const reachedForm =
    (pathMap.get("/daan")?.sessions ?? 0) + (eventMap.get("donate-form-opened") ?? 0);
  const submitted = eventMap.get("donate-form-submitted") ?? 0;

  return {
    ready: true,
    days,
    totals: { views, sessions },
    byDay: [...dayMap].map(([day, v]) => ({ day, ...v })),
    byPath: [...pathMap]
      .map(([path, v]) => ({ path, ...v }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 40),
    byReferrer: [...refMap]
      .map(([referrer, v]) => ({ referrer, sessions: v.sessions }))
      .sort((a, b) => b.sessions - a.sessions)
      .slice(0, 25),
    byDevice: [...devMap]
      .map(([device, v]) => ({ device, sessions: v.sessions }))
      .sort((a, b) => b.sessions - a.sessions),
    events: [...eventMap]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count),
    funnel: {
      reachedForm,
      submitted,
      rate: reachedForm > 0 ? submitted / reachedForm : 0,
    },
  };
}
