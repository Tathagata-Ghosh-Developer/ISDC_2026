import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

/**
 * So that somebody who adds this to their home screen at the pandal
 * gets the committee's own crest rather than a screenshot of the page.
 *
 * The short name is what appears under the icon, where there is room
 * for about twelve characters and not a syllable more.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE.name} ${SITE.year}`,
    short_name: "Durgotsab",
    description: SITE.description,
    start_url: "/",
    display: "standalone",
    background_color: "#0d0a08",
    theme_color: "#0d0a08",
    lang: "en-IN",
    categories: ["events", "education", "lifestyle"],
    icons: [
      {
        src: "/media/brand/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/media/brand/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/apple-icon.png",
        sizes: "180x180",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
