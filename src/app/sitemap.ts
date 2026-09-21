import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

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
  return PAGES.map((p) => ({
    url: `${SITE.url}${p.path}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: p.priority,
  }));
}
