import type { Metadata } from "next";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { Container, Section, SectionHeading } from "@/components/Section";
import Reveal, { Stagger, StaggerItem } from "@/components/Reveal";
import Countdown from "@/components/Countdown";
import { getConfig } from "@/lib/config";

export const metadata: Metadata = {
  title: "Utsab",
  description:
    "The four days of the IISc Sharodiya Durgotsab, hour by hour: Bodhon, Nabapatrika Snan, Anjali, Sandhi Puja, Kumari Puja, Bhog, Sindoor Khela and Bisarjan.",
};

export const revalidate = 300;

export default async function UtsabPage() {
  const config = await getConfig();

  return (
    <>
      <Section className="pt-[7.5rem] sm:pt-[9rem]">
        <Container>
          <SectionHeading
            eyebrow="উৎসব The days"
            title="Four days, and the two that frame them"
            bangla="বোধন থেকে বিসর্জন"
            lede="Timings below are the committee's working plan. Ritual timings that depend on the tithi, Sandhi Puja above all, are confirmed by the priest closer to the day and announced on WhatsApp and Instagram."
          />

          <Reveal className="mt-[2.618rem]">
            <div className="surface p-6 sm:p-8">
              <Countdown target={config.dates.countdownTo} />
              <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[0.78rem] text-ink-soft">
                <Link
                  href="/thikana"
                  className="inline-flex items-center gap-1.5 hover:text-sindoor"
                >
                  <MapPin size={14} className="text-gold" />
                  {config.venue.address}
                </Link>
              </div>
            </div>
          </Reveal>
        </Container>
      </Section>

      <Section className="!pt-0">
        <Container>
          <div className="space-y-[2.618rem]">
            {config.schedule.map((day, i) => (
              <Reveal key={day.id} delay={0.04}>
                <article
                  id={day.id}
                  className="scroll-mt-28 border-t border-line pt-8"
                >
                  <div className="grid gap-8 lg:grid-cols-[1fr_1.618fr] lg:items-start">
                    <div className="lg:sticky lg:top-24">
                      <p className="font-display text-[0.8rem] tabular-nums text-gold">
                        {String(i + 1).padStart(2, "0")}
                      </p>
                      <h2 className="bangla-display mt-2 text-[2.058rem] leading-tight text-sindoor">
                        {day.tithiBangla}
                      </h2>
                      <p className="font-display mt-2 text-[1.272rem] text-ink">
                        {day.tithi}
                      </p>
                      <p className="mt-1 text-[0.8rem] text-ink-soft">
                        {day.date} {day.weekday}
                      </p>
                    </div>

                    <div>
                      <h3 className="font-display text-[1.272rem] font-normal leading-snug text-ink sm:text-[1.618rem]">
                        {day.headline}
                      </h3>
                      <p className="lede mt-4 max-w-[64ch] text-[0.95rem]">
                        {day.story}
                      </p>

                      <Stagger className="mt-8 divide-y divide-line border-y border-line">
                        {day.rituals.map((r) => (
                          <StaggerItem key={r.title}>
                            <div className="flex gap-5 py-4">
                              <span className="w-[4.5rem] shrink-0 font-display text-[0.95rem] tabular-nums text-gold">
                                {r.time}
                              </span>
                              <span className="min-w-0">
                                <span className="block text-[0.95rem] text-ink">
                                  {r.title}
                                </span>
                                <span className="bangla block text-[0.85rem] text-ink-soft">
                                  {r.bangla}
                                </span>
                                {r.note && (
                                  <span className="mt-1.5 block text-[0.75rem] leading-relaxed text-ink-faint">
                                    {r.note}
                                  </span>
                                )}
                              </span>
                            </div>
                          </StaggerItem>
                        ))}
                      </Stagger>
                    </div>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      <Section className="bg-paper-2/40">
        <Container>
          <div className="grid gap-[2.618rem] lg:grid-cols-2">
            <Reveal>
              <h2 className="font-display text-[1.618rem] font-normal text-ink">
                Coming for the first time?
              </h2>
              <ul className="mt-6 space-y-4 text-[0.9rem] leading-relaxed text-ink-soft">
                <li>
                  <strong className="font-medium text-ink">Anjali is free and open to everyone.</strong>{" "}
                  Arrive a little before the announced time, wash your hands, and
                  take a place in line. Flowers are provided. You do not need to
                  know the mantras; you repeat after the priest.
                </li>
                <li>
                  <strong className="font-medium text-ink">Bhog is served to all.</strong>{" "}
                  Khichuri, labra, chutney and a sweet, on a leaf plate, sitting
                  on the floor in rows. There is no ticket and no guest list.
                </li>
                <li>
                  <strong className="font-medium text-ink">Nothing is compulsory.</strong>{" "}
                  Plenty of people come only for the dhak, the food and the
                  crowd, and that is a complete way to attend a Puja.
                </li>
                <li>
                  <strong className="font-medium text-ink">Dress as you like.</strong>{" "}
                  Many wear new clothes because that is the custom, not a rule.
                </li>
              </ul>
            </Reveal>

            <Reveal delay={0.1}>
              <h2 className="font-display text-[1.618rem] font-normal text-ink">
                Words you will hear
              </h2>
              <dl className="mt-6 divide-y divide-line border-y border-line">
                {[
                  ["বোধন Bodhon", "Waking the goddess, out of her proper season."],
                  ["অঞ্জলি Anjali", "Flowers offered from cupped palms, with the priest leading the verses."],
                  ["সন্ধিপূজা Sandhi Puja", "The forty-eight minutes across the Ashtami-Navami seam. A hundred and eight lamps."],
                  ["ভোগ Bhog", "Food offered to the goddess, then served to everyone present."],
                  ["ধুনুচি Dhunuchi", "An earthen censer of burning resin, danced with at arati."],
                  ["সিঁদুরখেলা Sindoor Khela", "Vermilion on Dashami, as she is about to leave."],
                  ["বিসর্জন Bisarjan", "Immersion. The clay goes back to the water it came from."],
                ].map(([term, meaning]) => (
                  <div key={term} className="py-4">
                    <dt className="bangla text-[0.95rem] text-ink">{term}</dt>
                    <dd className="mt-1 text-[0.85rem] leading-relaxed text-ink-soft">
                      {meaning}
                    </dd>
                  </div>
                ))}
              </dl>
              <Link href="/shilpa" className="btn btn-ghost mt-7">
                The crafts behind all of this
              </Link>
            </Reveal>
          </div>
        </Container>
      </Section>
    </>
  );
}
