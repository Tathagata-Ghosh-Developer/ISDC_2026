import type { Metadata, Viewport } from "next";
import {
  Bodoni_Moda,
  Galada,
  Baloo_Da_2,
  Noto_Serif_Bengali,
  Inter,
} from "next/font/google";
import "./globals.css";
import { SITE, TITLE_SPONSOR } from "@/lib/site";
import SiteHeader from "@/components/SiteHeader";
import { Suspense } from "react";
import SiteFooter from "@/components/SiteFooter";
import Track from "@/components/Track";
import Journey from "@/components/Journey";
import ConsentNotice from "@/components/Consent";
import PujoGuide from "@/components/PujoGuide";
import Arrival from "@/components/Arrival";
import AnnouncementBar from "@/components/AnnouncementBar";
import ShlokaBand from "@/components/ShlokaBand";
import { getConfig } from "@/lib/config";

/**
 * Satyajit Ray spent thirteen years as a visualiser at D. J. Keymer
 * before Pather Panchali, drew the lettering on his own title cards,
 * and designed four Latin typefaces. Two of them, Ray Roman and Ray
 * Bizarre, won an international competition in 1971.
 *
 * Bodoni Moda stands in for the high stroke contrast of Ray Roman.
 * Galada carries the brush weight of his hand-drawn Bengali titles.
 */
const display = Bodoni_Moda({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
  variable: "--f-display",
  display: "swap",
});

const banglaDisplay = Galada({
  subsets: ["bengali", "latin"],
  weight: ["400"],
  variable: "--f-bangla-display",
  display: "swap",
});

/** The heavy poster weight, for title cards and the arrival sequence. */
const banglaPoster = Baloo_Da_2({
  subsets: ["bengali", "latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--f-bangla-poster",
  display: "swap",
});

const bangla = Noto_Serif_Bengali({
  subsets: ["bengali", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--f-bangla",
  display: "swap",
});

const body = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--f-body",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} ${TITLE_SPONSOR.line}`,
    template: `%s ${SITE.name}`,
  },
  description: SITE.description,
  keywords: [
    "Durga Puja",
    "IISc",
    "Bangalore",
    "Sharodiya",
    "Durgotsab",
    "Bengali",
    "Indian Institute of Science",
  ],
  openGraph: {
    title: `${SITE.name} ${TITLE_SPONSOR.line}`,
    description: SITE.description,
    url: SITE.url,
    siteName: SITE.name,
    locale: "en_IN",
    type: "website",
    images: [{ url: "/media/puja/puja-1.jpg", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image" },
  icons: {
    icon: [{ url: SITE.icon, type: "image/png" }],
    apple: [{ url: SITE.icon }],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4e9d6" },
    { media: "(prefers-color-scheme: dark)", color: "#120d10" },
  ],
};

/** Applies the stored theme before first paint so nothing flashes. */
const THEME_BOOT = `(function(){try{var t=localStorage.getItem('isdc-theme');if(t){document.documentElement.setAttribute('data-theme',t)}}catch(e){}})()`;

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const config = await getConfig();

  return (
    /*
      The font variables go on <html>, not <body>. Tailwind resolves the
      @theme fonts in globals.css (--font-display: var(--f-display), ...)
      once, at :root, and a var() that is undefined there makes the whole
      value invalid: every font-family on the site then fell through to
      the browser's system stack and not one of the five faces loaded.
      On :root the variables exist when the theme is resolved.
    */
    <html
      lang="en"
      className={`${display.variable} ${banglaDisplay.variable} ${banglaPoster.variable} ${bangla.variable} ${body.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT }} />
      </head>
      <body className="min-h-dvh antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:bg-sindoor focus:px-4 focus:py-2 focus:text-paper-3"
        >
          Skip to content
        </a>
        {config.arrival.enabled && (
          <Arrival oncePerSession={config.arrival.oncePerSession} />
        )}
        <AnnouncementBar announcement={config.announcement} />
        <SiteHeader />
        <main id="main">{children}</main>
        <ShlokaBand />
        <SiteFooter />
        <Suspense fallback={null}>
          <Track />
          <Journey />
        </Suspense>
        <ConsentNotice />
        <PujoGuide />
      </body>
    </html>
  );
}
