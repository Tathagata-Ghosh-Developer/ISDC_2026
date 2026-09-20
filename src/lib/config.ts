import "server-only";
import { cache } from "react";
import { db, dbReady } from "./db";
import {
  SITE,
  PUJA_DATES,
  BANK,
  LINKS,
  CONTACTS,
  COMMITTEE,
  GATES,
  VOLUNTEER_ROLES,
} from "./site";
import { SCHEDULE, type PujaDay } from "./content/schedule";

/* ================================================================
   Everything on the public site that the committee can change
   without a developer. Defaults live in code; overrides live in a
   `settings` row and win on merge.
   ================================================================ */

export type Announcement = {
  enabled: boolean;
  text: string;
  bangla: string;
  href: string;
  tone: "info" | "urgent";
};

export type Sponsor = {
  name: string;
  tier: string;
  url: string;
  logo: string;
};

export type Config = {
  hero: {
    eyebrow: string;
    titleBangla: string;
    titleRoman: string;
    subtitle: string;
    ctaPrimary: { label: string; href: string };
    ctaSecondary: { label: string; href: string };
    image: string;
    campusImage: string;
  };
  arrival: {
    enabled: boolean;
    oncePerSession: boolean;
  };
  announcement: Announcement;
  dates: Record<keyof typeof PUJA_DATES, string>;
  bank: {
    accountName: string;
    accountNumber: string;
    accountType: string;
    ifsc: string;
    bank: string;
    branch: string;
    upiId: string;
    qrImage: string;
  };
  donation: {
    goal: number;
    showGoal: boolean;
    note: string;
    noteBangla: string;
    suggested: number[];
  };
  links: Record<keyof typeof LINKS, string>;
  contacts: { name: string; role: string; phone: string }[];
  committee: { name: string; role: string; bangla: string; phone: string }[];
  gates: {
    id: string;
    name: string;
    bangla: string;
    note: string;
    origin: string;
  }[];
  schedule: PujaDay[];
  sponsors: Sponsor[];
  venue: {
    address: string;
    short: string;
    mapRef: string;
    mapUrl: string;
    directionsUrl: string;
    campusMapPdf: string;
    campusMapSource: string;
  };
};

export const DEFAULTS: Config = {
  hero: {
    eyebrow: "Indian Institute of Science · Bengaluru",
    titleBangla: "শারদীয়া দুর্গোৎসব",
    titleRoman: `IISc ${SITE.year}`,
    subtitle:
      "From the banks of the Ganga to the river of knowledge — four days when a campus becomes a home.",
    ctaPrimary: { label: "Donate to the Puja", href: "/daan" },
    ctaSecondary: { label: "Four days, hour by hour", href: "/utsab" },
    image: "/media/art/nandalal-bose-durga.jpg",
    campusImage: "/media/iisc/main-building-sunset.jpg",
  },
  arrival: { enabled: true, oncePerSession: true },
  announcement: {
    enabled: false,
    text: "",
    bangla: "",
    href: "",
    tone: "info",
  },
  dates: { ...PUJA_DATES },
  bank: { ...BANK },
  donation: {
    goal: 0,
    showGoal: false,
    note: "There is no minimum. Give what feels right; every rupee is listed publicly.",
    noteBangla:
      "কোনও ন্যূনতম অঙ্ক নেই। যা মন চায় দিন — প্রতিটি টাকার হিসেব প্রকাশ্যে থাকবে।",
    suggested: [251, 501, 1001, 2100, 5001],
  },
  links: { ...LINKS },
  contacts: CONTACTS.map((c) => ({ ...c })),
  committee: COMMITTEE.map((c) => ({ ...c })),
  gates: GATES.map((g) => ({ ...g })),
  schedule: SCHEDULE,
  sponsors: [],
  venue: {
    address: SITE.venue,
    short: SITE.venueShort,
    mapRef: SITE.venueMapRef,
    mapUrl: SITE.venueMapUrl,
    directionsUrl: SITE.venueDirectionsUrl,
    campusMapPdf: SITE.campusMapPdf,
    campusMapSource: SITE.campusMapSource,
  },
};

/** Top-level groups an admin can edit, in the order shown. */
export const CONFIG_GROUPS = [
  { key: "announcement", label: "Announcement bar", form: "fields" },
  { key: "hero", label: "Home page hero", form: "fields" },
  { key: "donation", label: "Donation settings", form: "fields" },
  { key: "bank", label: "Bank account", form: "fields" },
  { key: "venue", label: "Venue", form: "fields" },
  { key: "arrival", label: "Arrival sequence", form: "fields" },
  { key: "dates", label: "Puja dates", form: "fields" },
  { key: "links", label: "External links", form: "fields" },
  { key: "committee", label: "Committee members", form: "json" },
  { key: "gates", label: "Campus gates", form: "json" },
  { key: "contacts", label: "Contacts", form: "json" },
  { key: "schedule", label: "Day-by-day schedule", form: "json" },
  { key: "sponsors", label: "Sponsors", form: "json" },
] as const;

export type ConfigGroup = (typeof CONFIG_GROUPS)[number]["key"];

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

/** Overrides win. Arrays replace wholesale; objects merge key by key. */
function merge<T>(base: T, override: unknown): T {
  if (override === undefined || override === null) return base;
  if (!isPlainObject(base) || !isPlainObject(override)) return override as T;
  const out: Record<string, unknown> = { ...base };
  for (const [k, v] of Object.entries(override)) {
    out[k] = k in base ? merge((base as Record<string, unknown>)[k], v) : v;
  }
  return out as T;
}

/**
 * Reads overrides once per request. Any database trouble falls back
 * to the built-in defaults, so a Supabase outage cannot take the
 * public site down.
 */
export const getConfig = cache(async (): Promise<Config> => {
  if (!dbReady) return DEFAULTS;
  try {
    const { data, error } = await db().from("settings").select("key,value");
    if (error || !data) return DEFAULTS;

    let cfg: Config = DEFAULTS;
    for (const row of data as { key: string; value: unknown }[]) {
      if (!(row.key in DEFAULTS)) continue;
      cfg = {
        ...cfg,
        [row.key]: merge(
          DEFAULTS[row.key as keyof Config],
          row.value,
        ),
      };
    }
    return cfg;
  } catch {
    return DEFAULTS;
  }
});

export async function saveConfigGroup(
  key: ConfigGroup,
  value: unknown,
): Promise<void> {
  await db()
    .from("settings")
    .upsert({ key, value, updated_at: new Date().toISOString() });
}

export async function resetConfigGroup(key: ConfigGroup): Promise<void> {
  await db().from("settings").delete().eq("key", key);
}

export { VOLUNTEER_ROLES };
