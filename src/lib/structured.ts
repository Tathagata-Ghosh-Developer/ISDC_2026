/* ================================================================
   schema.org descriptions of the committee, the site and the Puja.

   Search engines and AI assistants read these to answer "Durga Puja
   at IISc", "Durga Puja in Bengaluru 2026" and the like without
   having to guess from the prose. Every value comes from the config
   the pages render, so the two cannot disagree.
   ================================================================ */

import type { Config } from "./config";
import type { Faq } from "./faq";
import { pujaDaySpans } from "./season";
import { SITE, TITLE_SPONSOR } from "./site";

const ORG_ID = `${SITE.url}/#organization`;
const SITE_ID = `${SITE.url}/#website`;
const EVENT_ID = `${SITE.url}/#durga-puja-${SITE.year}`;

const abs = (path: string) => (path.startsWith("http") ? path : `${SITE.url}${path}`);

function place(config: Config) {
  return {
    "@type": "Place",
    name: "Tata Memorial Club (TMC) Ground, Indian Institute of Science",
    address: {
      "@type": "PostalAddress",
      streetAddress: "TMC Ground, opposite the SBI branch, Indian Institute of Science campus",
      addressLocality: "Bengaluru",
      addressRegion: "Karnataka",
      postalCode: "560012",
      addressCountry: "IN",
    },
    hasMap: config.venue.mapUrl,
  };
}

export function siteGraph(config: Config) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": ORG_ID,
        name: `${SITE.name} Committee`,
        alternateName: [SITE.name, SITE.nameBangla, "IISc Durga Puja"],
        url: SITE.url,
        logo: abs(SITE.icon),
        email: SITE.email,
        sameAs: [config.links.instagram, config.links.youtube].filter(Boolean),
        location: place(config),
      },
      {
        "@type": "WebSite",
        "@id": SITE_ID,
        name: SITE.name,
        alternateName: SITE.nameBangla,
        url: SITE.url,
        inLanguage: ["en-IN", "bn"],
        publisher: { "@id": ORG_ID },
      },
    ],
  };
}

export function pujaGraph(config: Config, faq: Faq[]) {
  const names = new Map(config.schedule.map((d) => [d.id, d]));
  const spans = pujaDaySpans(config.dates);
  const last = spans[spans.length - 1];
  const isoDate = (t: number) => new Date(t + 330 * 60_000).toISOString().slice(0, 10);

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Festival",
        "@id": EVENT_ID,
        name: `${SITE.name} ${SITE.year}: Durga Puja at IISc Bengaluru`,
        alternateName: [`${SITE.nameBangla} ${SITE.year}`, `IISc Durga Puja ${SITE.year}`],
        description: `${SITE.description} ${TITLE_SPONSOR.line}. Free and open to everyone.`,
        url: SITE.url,
        image: [abs("/media/puja/puja-1.jpg")],
        startDate: config.dates.arrival,
        endDate: isoDate(last.end - 1),
        eventStatus: "https://schema.org/EventScheduled",
        eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
        isAccessibleForFree: true,
        inLanguage: ["bn", "en"],
        location: place(config),
        organizer: { "@id": ORG_ID },
        sponsor: { "@type": "Organization", name: TITLE_SPONSOR.name, url: "https://genotypic.co.in/" },
        offers: {
          "@type": "Offer",
          price: 0,
          priceCurrency: "INR",
          availability: "https://schema.org/InStock",
          url: SITE.url,
        },
        subEvent: spans.map((s) => {
          const day = names.get(s.id);
          return {
            "@type": "Event",
            name: day ? `${day.tithi}: ${day.headline}` : s.id,
            startDate: isoDate(s.start),
            endDate: isoDate(s.end - 1),
            url: `${SITE.url}/utsab#${s.id}`,
            location: place(config),
            eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
            eventStatus: "https://schema.org/EventScheduled",
          };
        }),
      },
      {
        "@type": "FAQPage",
        mainEntity: faq.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
    ],
  };
}

/** Serialise for a <script type="application/ld+json">, safe against "</script>". */
export function jsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
