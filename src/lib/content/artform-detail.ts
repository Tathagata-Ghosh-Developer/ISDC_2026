/**
 * The long version of each art form.
 *
 * ART_FORMS carries a paragraph each, which is right for a grid of
 * twenty-four. This carries the rest: where it came from, who is
 * allowed to do it, what it means, the stories people tell about it,
 * and what state it is in now.
 *
 * Generated from research/artforms-detail-a.json and -b.json. A form
 * with no entry here still gets a page, built from what ART_FORMS
 * knows, rather than a broken link.
 */

export type Tale = { title: string; body: string };
export type GlossaryEntry = { term: string; bangla: string; meaning: string };

export type DetailImage = {
  /** Served from this site once fetched; the remote URL until then. */
  src: string;
  caption: string;
  licence: string;
  attribution: string;
  sourcePage: string;
};

export type DetailVideo = {
  youtubeId: string;
  title: string;
  channel: string;
  why: string;
};

export type ArtFormDetail = {
  history: string;
  culture: string;
  significance: string;
  technique: string;
  today: string;
  tales: Tale[];
  glossary: GlossaryEntry[];
  images: DetailImage[];
  videos: DetailVideo[];
  sources: string[];
};

/** Filled by the generator. Empty until the research lands. */
export const ART_DETAIL: Record<string, ArtFormDetail> = {};

export function getDetail(id: string): ArtFormDetail | null {
  return ART_DETAIL[id] ?? null;
}

export function hasDetail(id: string): boolean {
  return id in ART_DETAIL;
}

/**
 * A picture for the card, whether or not the long page exists yet.
 * Photographs from this ground where one genuinely shows the form,
 * and nothing at all rather than something that only looks similar.
 */
export const CARD_IMAGE: Record<string, string> = {
  "pratima-shilpa": "/media/puja2025/38.jpg",
  "daker-saj": "/media/art/ekchala-daker-saj.jpg",
  "sholar-saj": "/media/puja2025/16.jpg",
  chalchitra: "/media/art/durga-oleograph.jpg",
  alpona: "/media/puja2025/02.jpg",
  "dhaker-badyi": "/media/video/bisarjan-road.jpg",
  "dhunuchi-naach": "/media/video/dhunuchi-naach.jpg",
  chandipath: "/media/puja2025/10.jpg",
  "pandal-shilpa": "/media/puja2025/08.jpg",
  "agomoni-gaan": "/media/video/cultural-night.jpg",
  "theme-pujo": "/media/puja2025/43.jpg",
  "pujor-gaan": "/media/video/pandal-evening.jpg",
};
