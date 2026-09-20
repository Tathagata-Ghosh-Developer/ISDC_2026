import type { Metadata } from "next";
import Link from "next/link";
import { Container, Section, SectionHeading } from "@/components/Section";
import Reveal from "@/components/Reveal";
import { getConfig } from "@/lib/config";

export const metadata: Metadata = {
  title: "Sponsors",
  description:
    "Partner with the IISc Sharodiya Durgotsab, the only full-scale campus Durga Puja in Bengaluru, reaching students, faculty, alumni and the wider city.",
};

export const revalidate = 600;

export default async function SponsorsPage() {
  const config = await getConfig();

  return (
    <>
      <Section className="pt-[7.5rem] sm:pt-[9rem]">
        <Container>
          <SectionHeading
            eyebrow="পৃষ্ঠপোষকতা Sponsorship"
            title="Stand with a Puja the city comes to"
            lede="A student-run festival on the campus of the Indian Institute of Science, open to the public across four days, drawing students, faculty, alumni, families and visitors from across Bengaluru."
          />
        </Container>
      </Section>

      <Section className="!pt-0">
        <Container>
          <div className="grid gap-[2.618rem] lg:grid-cols-[1.618fr_1fr] lg:items-start">
            <Reveal>
              <h2 className="font-display text-[1.618rem] font-normal text-ink">
                What a partner gets
              </h2>
              <ul className="mt-6 divide-y divide-line border-y border-line">
                {[
                  {
                    t: "A specific audience, not a broad one",
                    d: "Postgraduate and doctoral researchers, faculty, and an alumni network that reaches well beyond the campus gate.",
                  },
                  {
                    t: "Presence on the ground",
                    d: "Stalls, sampling and branding across the venue for the full run of the festival, in a space people stay in for hours rather than pass through.",
                  },
                  {
                    t: "The printed magazine",
                    d: "Probash is produced once a year, kept, and read long after the pandal comes down.",
                  },
                  {
                    t: "Digital reach",
                    d: "Instagram and YouTube through the build-up, the four days and the aftermath, plus acknowledgement on this site.",
                  },
                  {
                    t: "Community initiatives",
                    d: "Blood donation drives, cultural programmes and outreach that a corporate social responsibility team can point at honestly.",
                  },
                ].map((item) => (
                  <li key={item.t} className="py-5">
                    <h3 className="text-[1rem] text-ink">{item.t}</h3>
                    <p className="mt-1.5 max-w-[60ch] text-[0.86rem] leading-relaxed text-ink-soft">
                      {item.d}
                    </p>
                  </li>
                ))}
              </ul>

              <p className="mt-8 text-[0.78rem] leading-relaxed text-ink-faint">
                Sponsorship tiers, deliverables and previous-year figures are in
                the brochure, which a convenor will send on request. Every
                sponsorship received is entered in the same public ledger as
                individual donations.
              </p>
            </Reveal>

            <Reveal delay={0.1}>
              <div className="surface p-6">
                <h3 className="eyebrow">Talk to us</h3>
                <ul className="mt-5 space-y-4">
                  {config.contacts.map((c) => (
                    <li key={c.phone}>
                      <a
                        href={`https://wa.me/91${c.phone}`}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="group block"
                      >
                        <span className="block text-[0.95rem] text-ink transition-colors group-hover:text-sindoor">
                          {c.name}
                        </span>
                        <span className="block text-[0.62rem] uppercase tracking-[0.22em] text-ink-faint">
                          {c.role}
                        </span>
                        <span className="mt-0.5 block text-[0.8rem] tabular-nums text-gold">
                          +91 {c.phone}
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
                <Link href="/daan/board" className="btn btn-ghost mt-7 w-full">
                  See how funds are accounted for
                </Link>
              </div>
            </Reveal>
          </div>
        </Container>
      </Section>

      {config.sponsors.length > 0 && (
        <Section className="bg-paper-2/40">
          <Container>
            <SectionHeading
              eyebrow="ধন্যবাদ With thanks"
              title="This year's partners"
              align="center"
            />
            <div className="mt-[2.618rem] grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {config.sponsors.map((s) => (
                <Reveal key={s.name}>
                  <a
                    href={s.url || "#"}
                    target={s.url ? "_blank" : undefined}
                    rel="noreferrer noopener"
                    className="surface flex h-full flex-col items-center justify-center p-6 text-center transition-all duration-500 hover:-translate-y-1 hover:border-gold"
                  >
                    <span className="font-display text-[1.1rem] text-ink">
                      {s.name}
                    </span>
                    <span className="mt-1 text-[0.6rem] uppercase tracking-[0.24em] text-gold">
                      {s.tier}
                    </span>
                  </a>
                </Reveal>
              ))}
            </div>
          </Container>
        </Section>
      )}
    </>
  );
}
