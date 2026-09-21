import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { Container, Section } from "@/components/Section";
import Reveal, { Stagger, StaggerItem } from "@/components/Reveal";
import { Parallax } from "@/components/Depth";
import {
  SECTIONS,
  FIGURES,
  IMAGES,
  CONFIDENCE_NOTE,
  imageById,
  type Confidence,
} from "@/lib/content/revolutionaries";

export const metadata: Metadata = {
  title: "The Puja and the revolutionaries",
  description:
    "Durga Puja and the Bengali freedom movement, researched from the Sedition Committee Report of 1918, J. C. Ker's intelligence volumes and Kalpana Datta's own memoir. Every claim carries its confidence.",
};

export const revalidate = 3600;

/* ================================================================
   The chapter nobody writes carefully.

   It is very easy to write a stirring page about pandals full of
   revolutionaries and very hard to source one. This page carries a
   confidence marker on every section, and the marker is the point.
   Where the documents say something better than the legend, the
   documents win, and they usually do.
   ================================================================ */

const BADGE: Record<Confidence, string> = {
  verified: "border-leaf/60 text-leaf",
  contested: "border-gold/70 text-gold",
  unverified: "border-sindoor/60 text-sindoor",
};

const LABEL: Record<Confidence, string> = {
  verified: "Documented",
  contested: "Contested",
  unverified: "Unsourced",
};

/** A picture chosen for each section, by hand, from what was verified. */
const SECTION_IMAGE: Record<string, string> = {
  "bankim-anandamath": "bankim-portrait",
  "swadeshi-1905": "bengal-partition-protest-1906",
  "bharat-mata": "bharat-mata-1905",
  "oaths-anushilan-jugantar": "pulin-behari-das",
  "subhas-chandra-bose": "bose-annakut-1928",
  "pujas-revolutionary-descent": "durga-puja-photo-c1900",
  "surveillance-restriction": "prinsep-durga-puja",
  "women-shakti-idiom": "pritilata-waddedar",
  "after-1947": "kumartuli-street",
  "the-case-against": "kalpana-dutt",
};

export default function BiplobPage() {
  const hero =
    imageById("durga-procession-c1800") ??
    imageById("prinsep-durga-puja") ??
    IMAGES[0];

  const counts = SECTIONS.reduce<Record<string, number>>((acc, s) => {
    acc[s.confidence] = (acc[s.confidence] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <>
      <Section className="pt-[7.5rem] sm:pt-[9rem]">
        <Container>
          <Link
            href="/itihash"
            className="mb-7 inline-flex items-center gap-2 text-[0.7rem] uppercase tracking-[0.18em] text-ink-faint transition-colors hover:text-gold"
          >
            <ArrowLeft size={13} /> History
          </Link>

          <div className="max-w-[54rem]">
            <p className="bangla-display text-[2.058rem] leading-tight text-sindoor sm:text-[2.618rem]">
              পুজো ও বিপ্লব
            </p>
            <h1 className="font-display mt-3 text-[1.618rem] font-normal leading-[1.15] text-ink sm:text-[2.618rem]">
              The Puja and the revolutionaries
            </h1>
            <p className="lede mt-6 text-[1.05rem]">
              For about fifty years the freedom movement in Bengal and this
              festival were entangled, and the story is told everywhere and
              sourced almost nowhere. This chapter went to the documents: the
              Sedition Committee Report of 1918, J. C. Ker&apos;s intelligence
              volumes, the Parliamentary Return of 1849, Sumit Sarkar&apos;s
              monograph on the Swadeshi movement, and Kalpana Datta&apos;s own
              memoir of 1945.
            </p>
            <p className="lede mt-4 text-[1.05rem]">
              What came back is stranger than the legend and in places flatly
              contradicts it. Every section below says how well it is
              evidenced, and that marking is the most useful thing on this
              page.
            </p>
          </div>

          <div className="mt-9 flex flex-wrap gap-3">
            {(Object.keys(LABEL) as Confidence[]).map((c) => (
              <span
                key={c}
                className={`border px-3 py-1.5 text-[0.62rem] uppercase tracking-[0.18em] ${BADGE[c]}`}
              >
                {LABEL[c]} · {counts[c] ?? 0}
              </span>
            ))}
          </div>
        </Container>
      </Section>

      {hero && (
        <Section className="!py-0">
          <div className="relative aspect-[21/9] w-full overflow-hidden border-y border-line bg-ink">
            <Image
              src={hero.src}
              alt={hero.title}
              fill
              sizes="100vw"
              priority
              className="sepia-plate object-cover"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent" />
            <p className="absolute inset-x-0 bottom-0 px-5 py-3 text-[0.7rem] leading-relaxed text-paper-3/85 md:px-8">
              {hero.title}
              <span className="ml-2 text-paper-3/55">{hero.attribution}</span>
            </p>
          </div>
        </Section>
      )}

      {/* ---------------- the chapter ---------------- */}
      {SECTIONS.map((s, i) => {
        const img = imageById(SECTION_IMAGE[s.id] ?? "");
        return (
          <Section
            key={s.id}
            id={s.id}
            className={i % 2 === 1 ? "bg-paper-2/40" : ""}
          >
            <Container>
              <div className="grid gap-[2.618rem] lg:grid-cols-[1.618fr_1fr] lg:items-start">
                <div>
                  <Reveal>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="font-display text-[0.85rem] text-gold">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span
                        className={`border px-2.5 py-1 text-[0.55rem] uppercase tracking-[0.2em] ${BADGE[s.confidence]}`}
                        title={CONFIDENCE_NOTE[s.confidence]}
                      >
                        {LABEL[s.confidence]}
                      </span>
                    </div>

                    <p className="bangla-display mt-4 text-[1.4rem] leading-tight text-sindoor">
                      {s.headingBangla.split("—")[0].trim()}
                    </p>
                    <h2 className="font-display mt-1 max-w-[24ch] text-[1.618rem] font-normal leading-snug text-ink sm:text-[2.058rem]">
                      {s.heading}
                    </h2>
                  </Reveal>

                  <Reveal delay={0.08}>
                    <div className="mt-6 space-y-4">
                      {s.body.split(/\n{2,}/).map((p, j) => (
                        <p key={j} className="lede text-[0.98rem]">
                          {p}
                        </p>
                      ))}
                    </div>
                  </Reveal>

                  {s.pullQuote && (
                    <Reveal delay={0.12}>
                      <blockquote className="mt-8 border-l-2 border-gold pl-6">
                        <p className="font-display text-[1.272rem] leading-snug text-ink">
                          {s.pullQuote}
                        </p>
                      </blockquote>
                    </Reveal>
                  )}
                </div>

                {img && (
                  <Reveal delay={0.12} className="lg:sticky lg:top-24">
                    <figure>
                      <Parallax
                        depth={20}
                        className="relative aspect-[4/5] w-full overflow-hidden border border-line bg-ink"
                      >
                        <Image
                          src={img.src}
                          alt={img.title}
                          fill
                          sizes="(max-width: 1024px) 100vw, 30vw"
                          className="sepia-plate object-cover"
                        />
                      </Parallax>
                      <figcaption className="mt-2.5">
                        <span className="block text-[0.78rem] leading-relaxed text-ink">
                          {img.title}
                        </span>
                        <span className="mt-1 block text-[0.7rem] leading-relaxed text-ink-faint">
                          {img.relevance}
                        </span>
                        <a
                          href={img.sourcePage}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="mt-1.5 block text-[0.62rem] text-ink-faint/80 hover:text-gold"
                        >
                          {img.attribution} · {img.licence}
                        </a>
                      </figcaption>
                    </figure>
                  </Reveal>
                )}
              </div>
            </Container>
          </Section>
        );
      })}

      {/* ---------------- who they were ---------------- */}
      <Section className="bg-paper-2/40">
        <Container>
          <Reveal>
            <p className="eyebrow">যাঁরা ছিলেন The people in this chapter</p>
            <h2 className="font-display mt-3 max-w-[26ch] text-[1.618rem] font-normal leading-snug text-ink sm:text-[2.058rem]">
              Eighteen names, and what each of them actually did
            </h2>
          </Reveal>

          <Stagger className="mt-[2.618rem] grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FIGURES.map((f) => (
              <StaggerItem key={f.name}>
                <article className="surface flex h-full flex-col p-5">
                  <span className="bangla-display text-[1.2rem] leading-tight text-ink">
                    {f.nameBangla}
                  </span>
                  <span className="font-display text-[0.95rem] text-ink-soft">
                    {f.name}
                  </span>
                  <span className="mt-1 text-[0.62rem] uppercase tracking-[0.18em] text-gold">
                    {f.years}
                  </span>
                  <p className="mt-3 flex-1 text-[0.82rem] leading-relaxed text-ink-soft">
                    {f.what}
                  </p>
                  <p className="mt-3 border-t border-line pt-2.5 text-[0.62rem] leading-relaxed text-ink-faint">
                    {f.source}
                  </p>
                </article>
              </StaggerItem>
            ))}
          </Stagger>
        </Container>
      </Section>

      {/* ---------------- the pictures ---------------- */}
      <Section>
        <Container>
          <Reveal>
            <p className="eyebrow">ছবি The pictures</p>
            <p className="lede mt-3 max-w-[68ch] text-[0.95rem]">
              Every image on this page is public domain or openly licensed, was
              checked to respond, and is served from this site rather than
              linked from somewhere that may move it. The source page and the
              licence are under each one.
            </p>
            <p className="lede mt-3 max-w-[68ch] text-[0.95rem]">
              One exception, marked as such. The photograph of the Bose
              brothers at an annakut came from the committee&apos;s own
              collection of reference images and we have not been able to
              establish where it was first published. A photograph taken in
              1928 is out of copyright in India either way. If you know the
              archive it belongs to, tell us and we will credit it properly.
            </p>
          </Reveal>

          <Stagger className="mt-[2.618rem] grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {IMAGES.map((im) => (
              <StaggerItem key={im.id}>
                <figure className="h-full">
                  <div className="relative aspect-square w-full overflow-hidden border border-line bg-ink">
                    <Image
                      src={im.src}
                      alt={im.title}
                      fill
                      sizes="(max-width: 640px) 50vw, 24vw"
                      className="sepia-plate object-cover"
                    />
                  </div>
                  <figcaption className="mt-2">
                    <span className="block text-[0.74rem] leading-snug text-ink">
                      {im.title}
                    </span>
                    <a
                      href={im.sourcePage}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="mt-1 block text-[0.6rem] leading-relaxed text-ink-faint hover:text-gold"
                    >
                      {im.licence}
                    </a>
                  </figcaption>
                </figure>
              </StaggerItem>
            ))}
          </Stagger>
        </Container>
      </Section>

      {/* ---------------- how to read this ---------------- */}
      <Section className="bg-paper-2/40">
        <Container>
          <Reveal>
            <div className="surface mx-auto max-w-[70ch] p-7 sm:p-[2.618rem]">
              <h2 className="font-display text-[1.618rem] font-normal text-ink">
                How to read the markings
              </h2>
              <dl className="mt-6 space-y-5">
                {(Object.keys(LABEL) as Confidence[]).map((c) => (
                  <div key={c}>
                    <dt
                      className={`inline-block border px-2.5 py-1 text-[0.55rem] uppercase tracking-[0.2em] ${BADGE[c]}`}
                    >
                      {LABEL[c]}
                    </dt>
                    <dd className="mt-2 text-[0.88rem] leading-relaxed text-ink-soft">
                      {CONFIDENCE_NOTE[c]}
                    </dd>
                  </div>
                ))}
              </dl>
              <p className="mt-7 border-t border-line pt-5 text-[0.85rem] leading-relaxed text-ink-soft">
                A festival that can mark its own uncertainties is in better
                shape than one that cannot. If you can source something here
                properly, or you can show that something is wrong, write to a
                convenor and it will be changed with the change noted.
              </p>
              <Link href="/thikana#write-to-us" className="btn btn-ghost mt-6">
                Tell us what we got wrong
              </Link>
            </div>
          </Reveal>
        </Container>
      </Section>
    </>
  );
}
