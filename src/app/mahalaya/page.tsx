import type { Metadata } from "next";
import Link from "next/link";
import { Radio } from "lucide-react";
import { Container, Section, SectionHeading } from "@/components/Section";
import Reveal, { Stagger, StaggerItem } from "@/components/Reveal";
import Countdown from "@/components/Countdown";
import { FactGrid } from "@/components/Facts";
import { getConfig } from "@/lib/config";

export const metadata: Metadata = {
  title: "Mahalaya",
  description:
    "Mahishasuramardini, the pre dawn broadcast that has opened Durga Puja since 1931, and the year Bengal refused to let All India Radio replace it.",
};

export const revalidate = 600;

const TIMELINE = [
  {
    year: "1931",
    title: "The first broadcast",
    body: "All India Radio's Calcutta station puts out a pre dawn programme of Chandi recitation, song and narration. It is live. There is no tape, because there is nothing to tape onto.",
  },
  {
    year: "The makers",
    title: "Three men and a choir",
    body: "Bani Kumar writes the script. Pankaj Kumar Mullick composes and directs the music. Birendra Krishna Bhadra recites. Around them sing Dwijen Mukhopadhyay, Supriti Ghosh, Sandhya Mukhopadhyay and others, in a studio, before sunrise, every year.",
  },
  {
    year: "1966",
    title: "Committed to tape",
    body: "The programme is recorded, which is why the voice a Bengali hears at four in the morning today is the same voice their grandparents heard live.",
  },
  {
    year: "1976",
    title: "The year Bengal refused",
    body: "All India Radio replaces the programme with a new production fronted by the film star Uttam Kumar. The reaction is immediate and furious. Offices are stoned, the new version is abandoned, and the original recording returns within the same season. It has not been touched since.",
  },
];

export default async function MahalayaPage() {
  const config = await getConfig();
  const { audioUrl, youtubeId, caption } = config.mahalaya;
  const mahalaya = config.schedule.find((d) => d.id === "mahalaya");

  return (
    <>
      <Section className="pt-[7.5rem] sm:pt-[9rem]">
        <Container>
          <SectionHeading
            eyebrow="মহালয়া Mahalaya"
            title="Four in the morning, and the radio is already on"
            bangla="আশ্বিনের শারদপ্রাতে"
            lede="Mahalaya is not part of the Puja. It is the day before the Puja becomes possible, when the fortnight of the ancestors ends and the fortnight of the goddess begins. For most Bengalis it begins with a voice on a radio that has been saying the same words since before their grandparents were born."
          />

          <Reveal className="mt-[2.618rem]">
            <div className="surface p-6 sm:p-8">
              <Countdown target={config.dates.countdownTo} />
              <p className="mt-6 text-center text-[0.72rem] uppercase tracking-[0.24em] text-ink-faint">
                until the broadcast, {mahalaya?.date ?? "10 October 2026"}
              </p>
            </div>
          </Reveal>
        </Container>
      </Section>

      {/* ---------------- listen ---------------- */}
      <Section className="!pt-0">
        <Container>
          <Reveal>
            <div className="surface overflow-hidden">
              <div className="flex flex-wrap items-center gap-3 border-b border-line px-6 py-4">
                <Radio size={17} className="text-gold" />
                <span className="font-display text-[1.1rem] text-ink">
                  Mahishasuramardini
                </span>
                <span className="bangla-display text-[1.05rem] text-sindoor">
                  মহিষাসুরমর্দিনী
                </span>
              </div>

              <div className="p-6">
                {audioUrl ? (
                  <audio
                    controls
                    preload="none"
                    src={audioUrl}
                    className="w-full"
                  >
                    Your browser cannot play audio.
                  </audio>
                ) : youtubeId ? (
                  <div className="relative aspect-video w-full">
                    <iframe
                      src={`https://www.youtube-nocookie.com/embed/${youtubeId}`}
                      title="Mahishasuramardini"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      loading="lazy"
                      className="absolute inset-0 h-full w-full border-0"
                    />
                  </div>
                ) : (
                  <p className="text-[0.88rem] leading-relaxed text-ink-soft">
                    The player goes live once the committee has added an
                    official source. Until then, the broadcast is on All India
                    Radio and its Prasar Bharati channels at four in the morning
                    on Mahalaya, as it has been for close to a century.
                  </p>
                )}

                <p className="mt-4 text-[0.75rem] leading-relaxed text-ink-faint">
                  {caption}
                </p>
              </div>
            </div>
          </Reveal>
        </Container>
      </Section>

      {/* ---------------- the story ---------------- */}
      <Section className="bg-paper-2/40">
        <Container>
          <SectionHeading
            eyebrow="ইতিহাস The story"
            title="A programme nobody is allowed to change"
            lede="Almost every year since 1931, and identical since the recording was made. Bengal has treated any attempt to improve it as a provocation, and has been proved right once already."
          />

          <Stagger className="mt-[2.618rem] grid gap-4 sm:grid-cols-2">
            {TIMELINE.map((t) => (
              <StaggerItem key={t.year}>
                <article className="surface flex h-full flex-col p-6">
                  <span className="font-display text-[1.1rem] text-gold">
                    {t.year}
                  </span>
                  <h3 className="mt-1 text-[1rem] text-ink">{t.title}</h3>
                  <p className="mt-3 text-[0.85rem] leading-relaxed text-ink-soft">
                    {t.body}
                  </p>
                </article>
              </StaggerItem>
            ))}
          </Stagger>
        </Container>
      </Section>

      {/* ---------------- what else happens ---------------- */}
      <Section>
        <Container>
          <div className="grid gap-[2.618rem] lg:grid-cols-[1.618fr_1fr] lg:items-start">
            <Reveal>
              <h2 className="font-display text-[1.618rem] font-normal text-ink">
                What else happens that morning
              </h2>
              <div className="mt-6 space-y-4">
                <p className="lede text-[0.96rem]">
                  Tarpan, on the riverbank. Water offered to the dead of one's
                  own family, and then to everyone who has no one left to offer
                  it for them. In Kolkata the ghats fill before dawn; in
                  Bengaluru people find whatever water there is.
                </p>
                <p className="lede text-[0.96rem]">
                  And in the workshops, Chokkhu Daan. The artisan fasts, and
                  paints the eyes last, in a fixed order, the forehead eye after
                  the other two. Until that stroke the figure is clay. After it,
                  she can be seen, and can see.
                </p>
                <p className="lede text-[0.96rem]">
                  Which is the honest reason the countdown on this site runs to
                  Mahalaya rather than to the first day of the Puja. Nothing has
                  begun yet. Everything is about to.
                </p>
              </div>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/utsab" className="btn btn-ghost">
                  The five days that follow
                </Link>
                <Link href="/gaan" className="btn btn-ghost">
                  The listening room
                </Link>
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <div className="surface p-6">
                <h3 className="eyebrow">Mahalaya is not Puja</h3>
                <p className="mt-4 text-[0.84rem] leading-relaxed text-ink-soft">
                  A common confusion worth clearing up. Mahalaya falls on the
                  new moon that closes Pitri Paksha, the fortnight of the
                  ancestors. Devi Paksha begins with it. The Puja itself starts
                  six days later on Shashthi.
                </p>
                <p className="mt-3 text-[0.84rem] leading-relaxed text-ink-soft">
                  So nobody worships the goddess on Mahalaya. They invite her.
                </p>
              </div>
            </Reveal>
          </div>
        </Container>
      </Section>

      <Section className="bg-paper-2/40">
        <Container>
          <SectionHeading
            eyebrow="জানা অজানা Did you know"
            title="Around the broadcast"
          />
          <FactGrid count={3} offset={9} className="mt-[2.618rem]" />
        </Container>
      </Section>
    </>
  );
}
