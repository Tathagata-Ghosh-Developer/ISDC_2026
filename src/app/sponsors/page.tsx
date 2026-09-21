import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Download, Mail } from "lucide-react";
import { Container, Section, SectionHeading } from "@/components/Section";
import Reveal, { Stagger, StaggerItem } from "@/components/Reveal";
import { WhatsappIcon } from "@/components/BrandIcons";
import { getConfig } from "@/lib/config";
import { SPONSOR_CONTACT, SITE } from "@/lib/site";
import { IISC_FIGURES } from "@/lib/content/neighbours";
import { formatINR } from "@/lib/format";
import EnquiryForm from "@/components/EnquiryForm";

export const metadata: Metadata = {
  title: "Sponsors",
  description:
    "Partner with the IISc Sharodiya Durgotsab, the campus Durga Puja of the Indian Institute of Science, and reach Bengaluru's academic and professional community across five days.",
};

export const revalidate = 600;

export default async function SponsorsPage() {
  const config = await getConfig();
  const tiers = config.sponsorTiers;

  return (
    <>
      <Section className="pt-[7.5rem] sm:pt-[9rem]">
        <Container>
          <SectionHeading
            as="h1"
            eyebrow="পৃষ্ঠপোষকতা Sponsorship"
            title="Five days, ten thousand people, one campus"
            bangla="আমাদের সঙ্গে থাকুন"
            lede="Sharodiya Durgotsab at IISc blends Bengal's cultural heritage with the working life of India's leading research institution. It is the only full scale campus Durga Puja in Bengaluru, and it is open to the city."
          />

          <Reveal className="mt-8 flex flex-wrap gap-3">
            <Link href="/sponsors/proposal" className="btn btn-primary">
              Read the full proposal
            </Link>
            <a
              href={`mailto:${SPONSOR_CONTACT.emails[0]}`}
              className="btn btn-ghost"
            >
              <Mail size={14} /> Write to us
            </a>
          </Reveal>
        </Container>
      </Section>

      {/* ---------------- why ---------------- */}
      <Section className="!pt-0">
        <Container>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              {
                t: "Reach the right audience",
                d: "Students, researchers, faculty, alumni and professionals from IISc and the institutes around it. The committee expects over ten thousand across the five days this year, against a counted four thousand in 2025, on a ground and a programme that have both grown.",
              },
              {
                t: "Strengthen your brand",
                d: "Association with an event that holds academic seriousness and cultural heritage in the same hand, on a campus the city already respects.",
              },
              {
                t: "Be visible for weeks, not days",
                d: "On ground branding, official recognition, and promotion across our channels before, during and after the festival.",
              },
            ].map((c, i) => (
              <Reveal key={c.t} delay={i * 0.06}>
                <div className="surface h-full p-6">
                  <h2 className="font-display text-[1.1rem] text-ink">{c.t}</h2>
                  <p className="mt-3 text-[0.85rem] leading-relaxed text-ink-soft">
                    {c.d}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      {/* ---------------- the institute ---------------- */}
      <Section className="bg-paper-2/40">
        <Container>
          <SectionHeading
            eyebrow="প্রেক্ষাপট The setting"
            title="Where the Puja happens"
            lede="Every figure below is the Institute's own published number, with the year and the source attached, because a sponsor deserves to check rather than take our word for it."
          />

          <Stagger className="mt-[2.618rem] grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {IISC_FIGURES.slice(0, 9).map((f) => (
              <StaggerItem key={f.label}>
                <article className="surface flex h-full flex-col p-6">
                  <span className="font-display text-[1.272rem] leading-snug text-sindoor">
                    {f.value}
                  </span>
                  <span className="mt-2 text-[0.85rem] text-ink">{f.label}</span>
                  <span className="mt-auto pt-4 text-[0.62rem] uppercase tracking-[0.18em] text-ink-faint">
                    {f.year}
                  </span>
                </article>
              </StaggerItem>
            ))}
          </Stagger>
        </Container>
      </Section>

      {/* ---------------- tiers ---------------- */}
      <Section>
        <Container>
          <SectionHeading
            eyebrow="স্তর The tiers"
            title="What each level carries"
            lede="Six levels, and room to build something that does not appear on this list. The deck has the full detail; terms apply to the LED display slots."
          />

          <div className="mt-[2.618rem] grid gap-4 lg:grid-cols-2">
            {tiers.map((tier, i) => (
              <Reveal key={tier.id} delay={i * 0.04}>
                <article
                  className={`surface flex h-full flex-col p-6 sm:p-8 ${
                    i === 0 ? "border-gold lg:col-span-2" : ""
                  }`}
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-3">
                    <div>
                      <span className="bangla-display block text-[1.272rem] text-gold">
                        {tier.bangla}
                      </span>
                      <h3 className="font-display text-[1.618rem] font-normal text-ink">
                        {tier.name}
                      </h3>
                    </div>
                    <span className="font-display text-[1.618rem] tabular-nums text-sindoor">
                      {formatINR(tier.amount)}
                    </span>
                  </div>

                  <p className="mt-3 text-[0.9rem] italic text-ink-soft">
                    {tier.headline}
                  </p>

                  <ul className="mt-5 space-y-2.5">
                    {tier.benefits.map((b) => (
                      <li
                        key={b}
                        className="flex gap-2.5 text-[0.84rem] leading-relaxed text-ink-soft"
                      >
                        <span className="mt-1.5 h-1 w-1 shrink-0 rotate-45 bg-gold" />
                        {b}
                      </li>
                    ))}
                  </ul>
                </article>
              </Reveal>
            ))}
          </div>

          <Reveal className="mt-8">
            <p className="max-w-[70ch] text-[0.82rem] leading-relaxed text-ink-faint">
              Other arrangements are possible, including in kind support, stall
              only partnerships and support for a single evening. Every
              sponsorship received is entered in the same ledger as individual
              donations and acknowledged by name.
            </p>
          </Reveal>
        </Container>
      </Section>

      {/* ---------------- contact ---------------- */}
      <Section className="bg-paper-2/40">
        <Container>
          <div className="grid gap-[2.618rem] lg:grid-cols-[1.618fr_1fr] lg:items-start">
            <Reveal>
              <h2 className="font-display text-[1.618rem] font-normal text-ink">
                Talk to us
              </h2>
              <p className="lede mt-4 max-w-[56ch] text-[0.95rem]">
                A conversation is usually quicker than a proposal. Tell us what
                you want out of it and we will tell you honestly whether this
                festival can deliver it.
              </p>

              <ul className="mt-7 space-y-2">
                {SPONSOR_CONTACT.emails.map((e) => (
                  <li key={e}>
                    <a
                      href={`mailto:${e}`}
                      className="inline-flex items-center gap-2 text-[0.92rem] text-ink-soft transition-colors hover:text-sindoor"
                    >
                      <Mail size={14} className="text-gold" />
                      {e}
                    </a>
                  </li>
                ))}
              </ul>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/sponsors/proposal" className="btn btn-primary">
                  The proposal, terms and all
                </Link>
                <a
                  href={SPONSOR_CONTACT.deck}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="btn btn-ghost"
                >
                  <Download size={14} /> One-page PDF
                </a>
                <Link href="/thikana#committee" className="btn btn-ghost">
                  The committee
                </Link>
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <div className="surface p-6">
                <h3 className="eyebrow">Direct lines</h3>
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
                        <span className="mt-0.5 inline-flex items-center gap-1.5 text-[0.8rem] tabular-nums text-gold">
                          <WhatsappIcon size={12} /> +91 {c.phone}
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
                <p className="mt-6 border-t border-line pt-5 text-[0.72rem] leading-relaxed text-ink-faint">
                  {SITE.name} is a registered student committee of the Institute.
                  It is not the Institute itself, and sponsorship of this
                  festival is not an endorsement by IISc.
                </p>
              </div>
            </Reveal>
          </div>
        </Container>
      </Section>

      {/* ---------------- get in touch ---------------- */}
      <Section id="get-in-touch" className="bg-paper-2/40">
        <Container>
          <div className="grid gap-[2.618rem] lg:grid-cols-[1fr_1.618fr] lg:items-start">
            <Reveal>
              <SectionHeading
                eyebrow="যোগাযোগ Get in touch"
                title="Tell us what would actually be worth your while"
                bangla="আসুন, কথা বলি"
                lede="The tiers above are a starting point and not a price list. If none of them fits, say so. We have built one-off arrangements before, and the ones that worked best were the ones neither side had planned."
              />

              <div className="surface mt-7 p-5">
                <h3 className="eyebrow">What we can usually do</h3>
                <ul className="mt-3 space-y-2.5 text-[0.82rem] leading-relaxed text-ink-soft">
                  <li>A stall on the ground for all five days, with power.</li>
                  <li>
                    Your name on the pandal arch, the backdrop, the souvenir and
                    every announcement from the stage.
                  </li>
                  <li>
                    A full page in Probash, which goes to several hundred
                    households and stays on shelves for years.
                  </li>
                  <li>
                    A slot at the cultural evening, if what you are doing suits
                    an audience of researchers and their families.
                  </li>
                  <li>
                    Campus recruitment visibility, which is the one most
                    companies actually come for and nobody writes down.
                  </li>
                </ul>
                <p className="mt-4 border-t border-line pt-4 text-[0.75rem] leading-relaxed text-ink-faint">
                  We will send a written note of what was agreed before anything
                  is printed, so both sides have the same document.
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <EnquiryForm kind="sponsor" />
            </Reveal>
          </div>
        </Container>
      </Section>

      {config.sponsors.length > 0 && (
        <Section>
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
                    {s.url && (
                      <ArrowUpRight size={13} className="mt-2 text-ink-faint" />
                    )}
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
