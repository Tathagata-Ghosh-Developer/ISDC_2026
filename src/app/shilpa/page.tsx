import type { Metadata } from "next";
import { Container, Section, SectionHeading } from "@/components/Section";
import Reveal from "@/components/Reveal";
import ArtGrid from "@/components/ArtGrid";
import { ART_FORMS, ART_CATEGORIES } from "@/lib/content/artforms";
import { CARD_IMAGE, hasDetail } from "@/lib/content/artform-detail";

export const metadata: Metadata = {
  title: "Shilpa",
  description:
    "Twenty-four art forms that Durga Puja commissions every year, from Kumartuli clay to Chandannagar light, each with a living practitioner you can go and find.",
};

export default function ShilpaPage() {
  const endangered = ART_FORMS.filter((a) => a.status === "Endangered");

  return (
    <>
      <Section className="pt-[7.5rem] sm:pt-[9rem]">
        <Container>
          <SectionHeading
            eyebrow="শিল্প Art forms"
            title="The festival is a commission"
            bangla="বাংলার শিল্পের মরশুম"
            lede="Four days of ritual are the visible end of a year of work by potters, foil-beaters, pith-carvers, scroll painters, drummers, bamboo riggers and lighting engineers. Most of it is seasonal. Some of it is disappearing. Every entry below names someone still doing it."
          />

          <Reveal className="mt-[2.618rem]">
            <div className="grid gap-px overflow-hidden border border-line bg-line sm:grid-cols-3">
              <Stat value={String(ART_FORMS.length)} label="Art forms documented" />
              <Stat
                value={String(endangered.length)}
                label="Listed as endangered"
                tone="sindoor"
              />
              <Stat value={String(ART_CATEGORIES.length)} label="Disciplines" />
            </div>
          </Reveal>
        </Container>
      </Section>

      <Section className="!pt-0">
        <Container>
          <ArtGrid
            arts={ART_FORMS}
            categories={[...ART_CATEGORIES]}
            images={CARD_IMAGE}
            detailed={Object.fromEntries(
              ART_FORMS.map((a) => [a.id, hasDetail(a.id)]),
            )}
          />
        </Container>
      </Section>

      <Section className="bg-paper-2/40">
        <Container>
          <SectionHeading
            eyebrow="সংকট At risk"
            title="What is actually disappearing"
            lede="These are not nostalgia. They are trades with a shrinking number of working hands, usually because a cheaper industrial substitute exists and the skill takes a decade to learn."
          />
          <div className="mt-[2.618rem] space-y-4">
            {endangered.map((a, i) => (
              <Reveal key={a.id} delay={i * 0.05}>
                <div className="surface flex flex-col gap-4 p-6 sm:flex-row sm:items-baseline sm:justify-between">
                  <div className="min-w-0">
                    <h3 className="bangla-display text-[1.4rem] text-ink">
                      {a.bangla}
                    </h3>
                    <p className="font-display text-[1rem] text-ink-soft">{a.name}</p>
                    <p className="mt-2 max-w-[62ch] text-[0.85rem] leading-relaxed text-ink-soft">
                      {a.didYouKnow}
                    </p>
                  </div>
                  <p className="shrink-0 text-[0.72rem] leading-relaxed text-gold sm:max-w-[16rem] sm:text-right">
                    {a.practitioner}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>
    </>
  );
}

function Stat({
  value,
  label,
  tone = "ink",
}: {
  value: string;
  label: string;
  tone?: "ink" | "sindoor";
}) {
  return (
    <div className="bg-paper p-6">
      <span
        className={`font-display block text-[2.058rem] font-normal leading-none tabular-nums ${
          tone === "sindoor" ? "text-sindoor" : "text-ink"
        }`}
      >
        {value}
      </span>
      <span className="mt-2 block text-[0.62rem] uppercase tracking-[0.24em] text-ink-faint">
        {label}
      </span>
    </div>
  );
}
