import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";
import { ART_FORMS } from "@/lib/content/artforms";

const PAGES = [
  { path: "/", priority: 1 },
  { path: "/utsab", priority: 0.9 },
  { path: "/mahalaya", priority: 0.8 },
  { path: "/itihash", priority: 0.8 },
  { path: "/shilpa", priority: 0.8 },
  { path: "/gaan", priority: 0.7 },
  { path: "/probash", priority: 0.7 },
  { path: "/gallery", priority: 0.6 },
  { path: "/thikana", priority: 0.7 },
  { path: "/jogdan", priority: 0.7 },
  { path: "/daan", priority: 0.9 },
  { path: "/daan/board", priority: 0.6 },
  { path: "/sponsors", priority: 0.6 },
  { path: "/sponsors/proposal", priority: 0.5 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  // One page per art form. They change rarely and are the pages most
  // likely to be found by somebody searching for the craft rather
  // than for the festival, which is the point of writing them.
  const arts = ART_FORMS.map((a) => ({
    url: `${SITE.url}/shilpa/${a.id}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));

  return [
    ...PAGES.map((p) => ({
      url: `${SITE.url}${p.path}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: p.priority,
    })),
    ...arts,
  ];
}
