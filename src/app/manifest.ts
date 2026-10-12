import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

/**
 * So that somebody who adds this to their home screen at the pandal
 * gets the committee's own crest rather than a screenshot of the page,
 * and an app that opens without the browser around it.
 *
 * The short name is what appears under the icon, where there is room
 * for about twelve characters and not a syllable more.
 *
 * The background is the night-pandal paper (--c-paper in the dark
 * theme). It is the splash screen while the app starts, and the field
 * the maskable icon is drawn on, so the two meet without a seam.
 *
 * The maskable icons are made by scripts/app-icons.py: the crest inside
 * the middle 80 per cent, which is all a launcher promises to keep.
 */
const APP_BACKGROUND = "#120d10";

/**
 * A shortcut's icon: a lucide glyph on sindoor, full bleed, with the
 * glyph inside the middle half. One file serves both as it is (a
 * Windows jump list) and under a launcher's round mask (Android).
 */
function shortcutIcon(slug: string): NonNullable<MetadataRoute.Manifest["icons"]> {
  const src = `/media/app/shortcut-${slug}-96.png`;
  return [
    { src, sizes: "96x96", type: "image/png", purpose: "any" },
    { src, sizes: "96x96", type: "image/png", purpose: "maskable" },
  ];
}

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: `${SITE.name} ${SITE.year}`,
    short_name: "Durgotsab",
    description: SITE.description,
    start_url: "/",
    scope: "/",
    display: "standalone",
    display_override: ["standalone", "minimal-ui"],
    orientation: "any",
    background_color: APP_BACKGROUND,
    theme_color: APP_BACKGROUND,
    lang: "en-IN",
    dir: "ltr",
    categories: ["events", "education", "lifestyle"],
    icons: [
      { src: "/media/brand/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/media/brand/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/media/brand/icon-maskable-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/media/brand/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    // A long press on the app icon. Four, the most Android shows.
    shortcuts: [
      {
        name: "Donate to the Puja",
        short_name: "Donate",
        description: "Bank details, the bank's QR and the form that records a gift",
        url: "/daan",
        icons: shortcutIcon("daan"),
      },
      {
        name: "The five days",
        short_name: "Five days",
        description: "The schedule, ritual by ritual",
        url: "/utsab",
        icons: shortcutIcon("utsab"),
      },
      {
        name: "Merchandise",
        short_name: "Merch",
        description: "The official T-shirt",
        url: "/merch",
        icons: shortcutIcon("merch"),
      },
      {
        name: "Find us",
        short_name: "Find us",
        description: "The pandal, the gates and the campus map",
        url: "/thikana",
        icons: shortcutIcon("thikana"),
      },
    ],
    // Shown in the richer install sheet on Android and the desktop.
    screenshots: [
      {
        src: "/media/app/screen-home-narrow-2026.webp",
        sizes: "1080x1920",
        type: "image/webp",
        form_factor: "narrow",
        label: "The home page: the countdown to the Puja at IISc",
      },
      {
        src: "/media/app/screen-home-wide-2026.webp",
        sizes: "1920x1080",
        type: "image/webp",
        form_factor: "wide",
        label: "The home page on a laptop",
      },
    ],
  };
}
