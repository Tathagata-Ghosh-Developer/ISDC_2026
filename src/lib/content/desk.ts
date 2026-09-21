/**
 * The sound desk.
 *
 * Eleven layers, all sourced from archive.org or Wikimedia Commons,
 * because the recordings this desk originally used were on a host
 * that cannot be reached from the network this site is built on.
 *
 * Desk order is percussion, then ritual punctuation, then people,
 * then weather, then place, then drone. Sweeping left to right takes
 * you from the loudest human-made thing to the quietest natural one.
 *
 * There is no ulu-dhwani fader. No openly licensed recording of
 * Bengali ululation exists on either host, and the page says so
 * rather than substituting something that is not it.
 */

export type LayerKind = "bed" | "punct";

export type DeskLayer = {
  id: string;
  bangla: string;
  roman: string;
  kind: LayerKind;
  /** Per-recording level correction, so one fader position means one loudness. */
  trim: number;
  /** Fixed stereo position, so the room has a geography. */
  pan: number;
  /** Three letters, for the share URL. */
  code: string;
  /** Crossfade seconds at the loop seam. */
  xfade: number;
  /** Only sustained tones may be detuned; never a drum. */
  detune: boolean;
};

export const DESK_LAYERS: DeskLayer[] = [
  { id: "dhak", bangla: "ঢাক", roman: "Dhak", kind: "bed", trim: 0.8, pan: -0.35, code: "dhk", xfade: 1.2, detune: false },
  { id: "kanshor_ghanta", bangla: "কাঁসর ঘণ্টা", roman: "Gong", kind: "bed", trim: 0.5, pan: 0.45, code: "kan", xfade: 1.2, detune: false },
  { id: "shankha", bangla: "শঙ্খ", roman: "Shankha", kind: "punct", trim: 0.75, pan: 0.6, code: "shk", xfade: 0.4, detune: false },
  { id: "mandir_ghanta", bangla: "মন্দিরের ঘণ্টা", roman: "Temple Bells", kind: "bed", trim: 0.6, pan: 0.25, code: "ghn", xfade: 1.2, detune: false },
  { id: "adda", bangla: "আড্ডা", roman: "Adda", kind: "bed", trim: 1.0, pan: 0, code: "add", xfade: 1.2, detune: false },
  { id: "brishti", bangla: "বৃষ্টি", roman: "Brishti", kind: "bed", trim: 0.9, pan: 0, code: "bri", xfade: 1.6, detune: false },
  { id: "sandhya_arati", bangla: "সন্ধ্যারতি", roman: "Sandhya Arati", kind: "bed", trim: 0.85, pan: -0.2, code: "ara", xfade: 1.2, detune: false },
  { id: "gangar_dhara", bangla: "গঙ্গার ধারা", roman: "Gangar Dhara", kind: "bed", trim: 1.0, pan: 0.15, code: "gng", xfade: 2.4, detune: false },
  { id: "jhijhi_poka", bangla: "ঝিঁঝিঁ পোকা", roman: "Jhijhi Poka", kind: "bed", trim: 0.95, pan: -0.15, code: "jhi", xfade: 1.6, detune: false },
  { id: "mantra_path", bangla: "মন্ত্রপাঠ", roman: "Mantra Path", kind: "bed", trim: 0.75, pan: 0.3, code: "man", xfade: 1.2, detune: true },
  { id: "drone", bangla: "সুরের রেখা", roman: "Drone", kind: "bed", trim: 0.7, pan: 0, code: "drn", xfade: 1.6, detune: true },
];

export const DESK_ORDER = DESK_LAYERS.map((l) => l.id);

export type Preset = {
  slug: string;
  bangla: string;
  roman: string;
  values: number[];
};

/** Values run in desk order. */
export const PRESETS: Preset[] = [
  {
    slug: "sondhyar-pandal",
    bangla: "সন্ধ্যার প্যান্ডেল",
    roman: "Evening Pandal",
    values: [62, 34, 22, 26, 58, 0, 0, 0, 0, 0, 20],
  },
  {
    slug: "sandhya-arati",
    bangla: "সন্ধ্যারতি",
    roman: "Arati",
    values: [30, 55, 40, 44, 26, 0, 66, 0, 0, 38, 24],
  },
  {
    slug: "nodir-dhare",
    bangla: "নদীর ধারে",
    roman: "By the River",
    values: [12, 0, 14, 0, 8, 0, 0, 62, 46, 0, 34],
  },
  {
    slug: "brishtir-sasthi",
    bangla: "বৃষ্টির ষষ্ঠী",
    roman: "Rain on Shashthi",
    values: [36, 14, 0, 10, 30, 70, 0, 0, 0, 0, 18],
  },
  {
    slug: "bhor-charte",
    bangla: "ভোর চারটে",
    roman: "Four in the Morning",
    values: [0, 0, 10, 12, 0, 0, 0, 26, 40, 30, 48],
  },
  {
    slug: "nabamir-raat",
    bangla: "নবমীর রাত",
    roman: "Navami Night",
    values: [82, 56, 34, 30, 74, 0, 30, 0, 0, 0, 12],
  },
  {
    slug: "porar-ghor",
    bangla: "পড়ার ঘর",
    roman: "The Study",
    values: [0, 0, 0, 0, 14, 44, 0, 30, 36, 0, 40],
  },
];

export const DEFAULT_PRESET = "sondhyar-pandal";

/** The two ends of the city to village slider, overridable by the visitor. */
export const CITY_POLE =
  PRESETS.find((p) => p.slug === "nabamir-raat")!.values.slice();
export const VILLAGE_POLE =
  PRESETS.find((p) => p.slug === "nodir-dhare")!.values.slice();

export const WIDTHS = [
  { id: "mono", bangla: "মোনো", roman: "Mono", factor: 0 },
  { id: "narrow", bangla: "সরু", roman: "Narrow", factor: 0.5 },
  { id: "normal", bangla: "স্বাভাবিক", roman: "Normal", factor: 1 },
  { id: "wide", bangla: "চওড়া", roman: "Wide", factor: 1.6 },
] as const;

export type Mix = Record<string, number>;

export function valuesToMix(values: number[]): Mix {
  const mix: Mix = {};
  DESK_LAYERS.forEach((l, i) => {
    mix[l.id] = values[i] ?? 0;
  });
  return mix;
}

export function mixToValues(mix: Mix): number[] {
  return DESK_LAYERS.map((l) => mix[l.id] ?? 0);
}

/** Packs a mix into a URL as three-letter codes with two-digit levels. */
export function encodeMix(mix: Mix): string {
  return DESK_LAYERS.filter((l) => (mix[l.id] ?? 0) > 0)
    .map(
      (l) =>
        `${l.code}${String(Math.min(99, Math.round(mix[l.id]))).padStart(2, "0")}`,
    )
    .join("");
}

export function decodeMix(raw: string): Mix {
  const mix: Mix = {};
  const byCode = new Map(DESK_LAYERS.map((l) => [l.code, l.id]));
  for (const m of raw.matchAll(/([a-z]{3})(\d{2})/g)) {
    const id = byCode.get(m[1]);
    if (id) mix[id] = Math.min(100, Math.max(0, Number(m[2])));
  }
  return mix;
}

/** Layers we looked for and could not license. Shown on the page. */
export const MISSING_LAYERS = [
  {
    bangla: "উলুধ্বনি",
    roman: "Ulu-dhwani",
    why: "No openly licensed recording of Bengali ululation exists on either archive.org or Wikimedia Commons. The only genuine ululation found was Egyptian, in a video container, and substituting it would have been a lie told in sound.",
  },
];
