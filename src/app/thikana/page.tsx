import type { Metadata } from "next";
import Link from "next/link";
import {
  Download,
  ExternalLink,
  Footprints,
  MapPin,
  Navigation,
  Train,
} from "lucide-react";
import { Container, Section, SectionHeading } from "@/components/Section";
import Reveal, { Stagger, StaggerItem } from "@/components/Reveal";
import { WhatsappIcon } from "@/components/BrandIcons";
import { getConfig } from "@/lib/config";
import EnquiryForm from "@/components/EnquiryForm";

export const metadata: Metadata = {
  title: "Thikana",
  description:
    "How to find the IISc Sharodiya Durgotsab pandal, the Tata Memorial Club ground opposite the SBI branch, with walking directions from every gate of the campus.",
};

export const revalidate = 600;

/** OpenStreetMap needs no key and no tracking script. */
const OSM_EMBED =
  "https://www.openstreetmap.org/export/embed.html?bbox=77.5600%2C13.0150%2C77.5740%2C13.0290&layer=mapnik";
const OSM_LINK = "https://www.openstreetmap.org/#map=15/13.0220/77.5670";

function walkFrom(origin: string): string {
  const params = new URLSearchParams({
    api: "1",
    origin,
    destination: "Tata Memorial Club Indian Institute of Science Bengaluru",
    travelmode: "walking",
  });
  return `https://www.google.com/maps/dir/?${params}`;
}

export default async function ThikanaPage() {
  const config = await getConfig();

  return (
    <>
      <Section className="pt-[7.5rem] sm:pt-[9rem]">
        <Container>
          <SectionHeading
            eyebrow="ঠিকানা Finding us"
            title="The pandal stands on the TMC ground"
            bangla="টিএমসি মাঠ, এসবিআই-এর উল্টোদিকে"
            lede="Tata Memorial Club ground, directly opposite the State Bank of India branch on campus. On the Institute's own map it is grid F3, building 126. If you are already inside the campus, walk towards the bank and you will hear it before you see it."
          />

          <Reveal className="mt-8 flex flex-wrap gap-3">
            <a
              href={config.venue.directionsUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="btn btn-primary"
            >
              <Navigation size={14} /> Directions from where you are
            </a>
            <a
              href={config.venue.mapUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="btn btn-ghost"
            >
              <MapPin size={14} /> Open the pin
            </a>
            <a
              href={config.venue.campusMapPdf}
              target="_blank"
              rel="noreferrer noopener"
              className="btn btn-ghost"
            >
              <Download size={14} /> Official campus map
            </a>
          </Reveal>
        </Container>
      </Section>

      {/* ---------------- the map ---------------- */}
      <Section className="!pt-0">
        <Container>
          <Reveal>
            <figure className="surface overflow-hidden">
              <div className="relative aspect-[16/10] w-full sm:aspect-[2/1]">
                <iframe
                  src={OSM_EMBED}
                  title="Map of the Indian Institute of Science campus, Bengaluru"
                  loading="lazy"
                  className="h-full w-full border-0"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
              <figcaption className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-5 py-3.5 text-[0.72rem] text-ink-faint">
                <span>
                  The main campus. The pandal sits near the centre, by the bank.
                </span>
                <a
                  href={OSM_LINK}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-1.5 hover:text-gold"
                >
                  OpenStreetMap <ExternalLink size={11} />
                </a>
              </figcaption>
            </figure>
          </Reveal>

          <Reveal className="mt-4">
            <p className="text-[0.78rem] leading-relaxed text-ink-faint">
              The Institute&apos;s own map is the one to carry. It names every
              building and marks all the gates, and the Tata Memorial Club is at{" "}
              <span className="text-gold">{config.venue.mapRef}</span>. A copy is
              hosted here so it works without signal, and the{" "}
              <a
                href={config.venue.campusMapSource}
                target="_blank"
                rel="noreferrer noopener"
                className="underline underline-offset-2 hover:text-gold"
              >
                original is on iisc.ac.in
              </a>
              .
            </p>
          </Reveal>
        </Container>
      </Section>

      {/* ---------------- gates ---------------- */}
      <Section className="bg-paper-2/40">
        <Container>
          <SectionHeading
            eyebrow="ফটক From every gate"
            title="Whichever gate you come through"
            lede="The campus has several entrances and they are far apart. Pick the one you are walking in by; each link opens walking directions to the pandal. Security at any gate will also point you towards the bank."
          />

          <Stagger className="mt-[2.618rem] grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {config.gates.map((gate) => (
              <StaggerItem key={gate.id}>
                <article className="surface flex h-full flex-col p-6">
                  <h3 className="bangla-display text-[1.272rem] text-ink">
                    {gate.bangla}
                  </h3>
                  <p className="font-display text-[1.05rem] text-ink-soft">
                    {gate.name}
                  </p>
                  <p className="mt-3 flex-1 text-[0.82rem] leading-relaxed text-ink-soft">
                    {gate.note}
                  </p>
                  <a
                    href={walkFrom(gate.origin)}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="mt-5 inline-flex items-center gap-2 text-[0.68rem] uppercase tracking-[0.2em] text-gold transition-colors hover:text-sindoor"
                  >
                    <Footprints size={13} /> Walk from here
                  </a>
                </article>
              </StaggerItem>
            ))}
          </Stagger>

          <Reveal className="mt-8">
            <p className="max-w-[70ch] text-[0.8rem] leading-relaxed text-ink-faint">
              Gate opening hours change during the festival, and vehicle entry is
              restricted on the busiest evenings. Watch the WhatsApp group and
              Instagram for the notice, and come on foot from the nearest gate if
              you can.
            </p>
          </Reveal>
        </Container>
      </Section>

      {/* ---------------- reaching the campus ---------------- */}
      <Section>
        <Container>
          <div className="grid gap-[2.618rem] lg:grid-cols-[1.618fr_1fr] lg:items-start">
            <Reveal>
              <h2 className="font-display text-[1.618rem] font-normal text-ink">
                Getting to the campus at all
              </h2>
              <p className="lede mt-4 max-w-[58ch] text-[0.95rem]">
                Ask for the Tata Institute. Nobody driving in this city calls it
                anything else, and every auto driver in Malleswaram and
                Yeshwantpur knows the gate.
              </p>

              <dl className="mt-7 divide-y divide-line border-y border-line">
                {[
                  {
                    t: "Yeshwantpur railway station",
                    d: "Under two kilometres away, the closest rail option. A prepaid auto from the platform 6 exit is the simplest arrival.",
                  },
                  {
                    t: "Bengaluru City railway station",
                    d: "About seven kilometres. Prepaid taxis run from platform one.",
                  },
                  {
                    t: "Kempegowda International Airport",
                    d: "Roughly thirty-five kilometres. Prepaid and city taxis both serve it, and the BMTC shuttle runs every fifteen minutes.",
                  },
                  {
                    t: "By bus",
                    d: "Stops at Prof. C. N. R. Rao Circle, the yellow overbridge and Yeshwantpur tollgate all put you within a short walk of a gate.",
                  },
                  {
                    t: "Landmark",
                    d: "Just past Mekhri Circle, on the way to Yeshwantpur.",
                  },
                ].map((x) => (
                  <div key={x.t} className="flex gap-4 py-4">
                    <Train size={15} className="mt-1 shrink-0 text-gold" />
                    <div>
                      <dt className="text-[0.95rem] text-ink">{x.t}</dt>
                      <dd className="mt-1 max-w-[56ch] text-[0.84rem] leading-relaxed text-ink-soft">
                        {x.d}
                      </dd>
                    </div>
                  </div>
                ))}
              </dl>
              <p className="mt-4 text-[0.7rem] text-ink-faint">
                Distances and fares as published by IISc. Treat the fares as
                indicative.
              </p>
            </Reveal>

            <Reveal delay={0.1}>
              <div className="surface p-6">
                <h3 className="eyebrow">On the day</h3>
                <ul className="mt-5 space-y-3 text-[0.84rem] leading-relaxed text-ink-soft">
                  <li>
                    Anjali and bhog timings are on the{" "}
                    <Link href="/utsab" className="text-gold hover:text-sindoor">
                      four-days page
                    </Link>
                    .
                  </li>
                  <li>
                    Bring a water bottle. The queue on Ashtami is long and the
                    afternoon is warm.
                  </li>
                  <li>
                    Everything is at ground level and the ground is flat, so the
                    pandal is reachable with a wheelchair or a pram.
                  </li>
                  <li>
                    Lost, late, or stuck at a gate? Ring a convenor below.
                  </li>
                </ul>
              </div>
            </Reveal>
          </div>
        </Container>
      </Section>

      {/* ---------------- committee ---------------- */}
      <Section id="committee" className="bg-paper-2/40">
        <Container>
          <SectionHeading
            eyebrow="কমিটি The committee"
            title="Who is running it this year"
            bangla="২০২৬-এর কার্যকরী সমিতি"
            lede="Elected by the general body on 19 July 2026. Seven people, most of them still meant to be finishing a thesis."
          />

          <Stagger className="mt-[2.618rem] grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {config.committee.map((m) => (
              <StaggerItem key={m.name}>
                <article className="surface flex h-full flex-col p-6">
                  <span className="bangla-display text-[1.05rem] text-gold">
                    {m.bangla}
                  </span>
                  <span className="text-[0.62rem] uppercase tracking-[0.24em] text-ink-faint">
                    {m.role}
                  </span>
                  <h3 className="font-display mt-2 text-[1.272rem] text-ink">
                    {m.name}
                  </h3>
                  {m.phone && (
                    <a
                      href={`https://wa.me/91${m.phone}`}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="mt-4 inline-flex items-center gap-2 text-[0.8rem] tabular-nums text-ink-soft transition-colors hover:text-sindoor"
                    >
                      <WhatsappIcon size={13} /> +91 {m.phone}
                    </a>
                  )}
                </article>
              </StaggerItem>
            ))}
          </Stagger>

          <Reveal className="mt-8">
            <p className="max-w-[70ch] text-[0.8rem] leading-relaxed text-ink-faint">
              The committee account is operated jointly, and no single member can
              move money alone. What comes in and what goes out is published on
              the{" "}
              <Link href="/daan/board" className="text-gold hover:text-sindoor">
                donation board
              </Link>
              .
            </p>
          </Reveal>
        </Container>
      </Section>

      {/* ---------------- writing in from elsewhere ---------------- */}
      <Section id="write-to-us" className="bg-paper-2/40">
        <Container>
          <SectionHeading
            eyebrow="লিখুন Write to us"
            title="Coming from another institute, or another city"
            bangla="সকলের জন্য খোলা"
            lede="The Puja is open to everyone and always has been. If you are at NCBS, JNCASR, ICTS, RRI or anywhere else in Bengaluru, or you are a Bengali association wanting to bring a group, this reaches a convenor directly."
            align="center"
          />

          <div className="mx-auto mt-[2.618rem] grid max-w-[68rem] gap-[2.618rem] lg:grid-cols-2">
            <Reveal>
              <div className="surface h-full p-6">
                <h3 className="font-display text-[1.272rem] text-ink">
                  Things worth telling us in advance
                </h3>
                <ul className="mt-4 space-y-3 text-[0.84rem] leading-relaxed text-ink-soft">
                  <li>
                    <span className="text-ink">Bringing a group.</span> Bhog is
                    cooked to a count. A rough number a week ahead means nobody
                    is turned away on Ashtami.
                  </li>
                  <li>
                    <span className="text-ink">Performing.</span> The cultural
                    evenings fill up by late September. Tell us what you do and
                    how long it runs.
                  </li>
                  <li>
                    <span className="text-ink">Driving in.</span> Vehicle passes
                    for the campus take a day or two to arrange, and cannot be
                    arranged at the gate.
                  </li>
                  <li>
                    <span className="text-ink">A stall.</span> Books, food,
                    handloom, anything a Puja ground should have. There is space
                    and there is no charge for a non-commercial one.
                  </li>
                  <li>
                    <span className="text-ink">Accessibility.</span> Tell us what
                    you need and we will arrange it rather than improvise it.
                  </li>
                </ul>
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <EnquiryForm kind="institute" />
            </Reveal>
          </div>
        </Container>
      </Section>

      {/* ---------------- feedback ---------------- */}
      <Section>
        <Container>
          <div className="mx-auto max-w-[44rem]">
            <SectionHeading
              eyebrow="মতামত Feedback"
              title="Tell us what this site gets wrong"
              bangla="ভুল ধরিয়ে দিন"
              lede="There is a great deal of history on these pages and some of it will be wrong. If you know better, we would rather hear it than keep it. The same goes for anything broken, anything missing, and any photograph that should not be here."
              align="center"
            />
            <div className="mt-[2.618rem]">
              <EnquiryForm kind="feedback" />
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
