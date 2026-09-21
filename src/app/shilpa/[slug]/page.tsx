import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Container, Section } from "@/components/Section";
import Reveal, { Stagger, StaggerItem } from "@/components/Reveal";
import { ART_FORMS } from "@/lib/content/artforms";
import { getDetail, CARD_IMAGE } from "@/lib/content/artform-detail";

export const revalidate = 3600;

export function generateStaticParams() {
  return ART_FORMS.map((a) => ({ slug: a.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const art = ART_FORMS.find((a) => a.id === slug);
  if (!art) return { title: "Not found" };
  return {
    title: art.name,
    description: art.blurb.slice(0, 180),
  };
}

const STATUS_COLOUR = {
  Thriving: "text-leaf",
  Evolving: "text-indigo",
  Endangered: "text-sindoor",
} as const;

export default async function ArtFormPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const i = ART_FORMS.findIndex((a) => a.id === slug);
  if (i === -1) notFound();

  const art = ART_FORMS[i];
  const detail = getDetail(slug);
  const prev = ART_FORMS[(i - 1 + ART_FORMS.length) % ART_FORMS.length];
  const next = ART_FORMS[(i + 1) % ART_FORMS.length];

  const hero = detail?.images[0]?.src ?? CARD_IMAGE[slug] ?? null;

  return (
    <>
      {/* ---------------- the head ---------------- */}
      <Section className="pt-[7.5rem] sm:pt-[9rem]">
        <Container>
          <Link
            href="/shilpa"
            className="mb-7 inline-flex items-center gap-2 text-[0.7rem] uppercase tracking-[0.18em] text-ink-faint transition-colors hover:text-gold"
          >
            <ArrowLeft size={13} /> All art forms
          </Link>

          <div className="grid gap-[2.618rem] lg:grid-cols-[1.618fr_1fr] lg:items-end">
            <Reveal>
              <p className="text-[0.62rem] uppercase tracking-[0.24em] text-gold">
                {art.category}
              </p>
              <h1 className="bangla-display mt-3 text-[2.618rem] leading-[1.1] text-ink sm:text-[3.4rem]">
                {art.bangla}
              </h1>
              <p className="font-display mt-1 text-[1.272rem] text-ink-soft sm:text-[1.618rem]">
                {art.name}
              </p>
              <p className="mt-5 text-[0.75rem] uppercase tracking-[0.16em] text-ink-faint">
                {art.origin}
              </p>
            </Reveal>

            <Reveal delay={0.1}>
              <div className="border-l-2 border-gold/50 pl-5">
                <p className="text-[0.58rem] uppercase tracking-[0.22em] text-ink-faint">
                  Where it stands
                </p>
                <p
                  className={`font-display mt-1 text-[1.272rem] ${STATUS_COLOUR[art.status]}`}
                >
                  {art.status}
                </p>
                <p className="mt-4 text-[0.82rem] leading-relaxed text-ink-soft">
                  {art.practitioner}
                </p>
              </div>
            </Reveal>
          </div>
        </Container>
      </Section>

      {/* ---------------- the picture ---------------- */}
      {hero && (
        <Section className="!py-0">
          <div className="relative aspect-[21/9] w-full overflow-hidden border-y border-line bg-ink">
            <Image
              src={hero}
              alt={detail?.images[0]?.caption ?? art.name}
              fill
              sizes="100vw"
              priority
              className="object-cover"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent" />
            {detail?.images[0] && (
              <p className="absolute inset-x-0 bottom-0 px-5 py-3 text-[0.68rem] leading-relaxed text-paper-3/85 md:px-8">
                {detail.images[0].caption}
                <span className="ml-2 text-paper-3/55">
                  {detail.images[0].attribution}
                </span>
              </p>
            )}
          </div>
        </Section>
      )}

      {/* ---------------- the opening ---------------- */}
      <Section>
        <Container>
          <Reveal>
            <p className="lede mx-auto max-w-[68ch] text-[1.05rem]">
              {art.blurb}
            </p>
          </Reveal>
        </Container>
      </Section>

      {detail ? (
        <>
          {/* ---------------- the long read ---------------- */}
          <Chapter
            eyebrow="ইতিহাস History"
            title="Where it came from"
            body={detail.history}
            image={detail.images[1]}
          />
          <Chapter
            eyebrow="সংস্কৃতি Culture"
            title="Who does it, and who used to"
            body={detail.culture}
            image={detail.images[2]}
            tinted
          />
          <Chapter
            eyebrow="তাৎপর্য Significance"
            title="Why this, and not something else"
            body={detail.significance}
            image={detail.images[3]}
          />

          {/* ---------------- how it is made ---------------- */}
          <Section className="bg-paper-2/40">
            <Container>
              <div className="grid gap-[2.618rem] lg:grid-cols-[1fr_1.618fr]">
                <Reveal>
                  <p className="eyebrow">কীভাবে How it is made</p>
                  <h2 className="font-display mt-3 text-[1.618rem] font-normal leading-snug text-ink">
                    The work itself
                  </h2>
                </Reveal>
                <Reveal delay={0.1}>
                  <p className="lede text-[0.98rem]">{detail.technique}</p>
                  {detail.glossary.length > 0 && (
                    <dl className="mt-8 grid gap-x-8 gap-y-4 sm:grid-cols-2">
                      {detail.glossary.map((g) => (
                        <div key={g.term}>
                          <dt className="flex items-baseline gap-2">
                            <span className="bangla-display text-[1.1rem] text-ink">
                              {g.bangla}
                            </span>
                            <span className="text-[0.62rem] uppercase tracking-[0.16em] text-gold">
                              {g.term}
                            </span>
                          </dt>
                          <dd className="mt-1 text-[0.8rem] leading-relaxed text-ink-soft">
                            {g.meaning}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  )}
                </Reveal>
              </div>
            </Container>
          </Section>

          {/* ---------------- the stories ---------------- */}
          {detail.tales.length > 0 && (
            <Section>
              <Container>
                <Reveal>
                  <p className="eyebrow">কাহিনি The stories</p>
                  <h2 className="font-display mt-3 max-w-[24ch] text-[1.618rem] font-normal leading-snug text-ink sm:text-[2.058rem]">
                    What people tell each other about it
                  </h2>
                </Reveal>

                <Stagger className="mt-[2.618rem] grid gap-5 md:grid-cols-2">
                  {detail.tales.map((t) => (
                    <StaggerItem key={t.title}>
                      <article className="surface h-full p-6">
                        <h3 className="font-display text-[1.15rem] text-ink">
                          {t.title}
                        </h3>
                        <p className="mt-3 text-[0.88rem] leading-relaxed text-ink-soft">
                          {t.body}
                        </p>
                      </article>
                    </StaggerItem>
                  ))}
                </Stagger>
              </Container>
            </Section>
          )}

          {/* ---------------- film ---------------- */}
          {detail.videos.length > 0 && (
            <Section className="bg-paper-2/40">
              <Container>
                <Reveal>
                  <p className="eyebrow">দেখুন Watch</p>
                </Reveal>
                <div className="mt-7 grid gap-6 md:grid-cols-2">
                  {detail.videos.map((v) => (
                    <Reveal key={v.youtubeId}>
                      <figure>
                        <div className="aspect-video w-full overflow-hidden border border-line bg-ink">
                          <iframe
                            src={`https://www.youtube-nocookie.com/embed/${v.youtubeId}?rel=0`}
                            title={v.title}
                            loading="lazy"
                            allow="accelerometer; encrypted-media; picture-in-picture"
                            allowFullScreen
                            className="h-full w-full border-0"
                          />
                        </div>
                        <figcaption className="mt-2.5">
                          <span className="block text-[0.85rem] text-ink">
                            {v.title}
                          </span>
                          <span className="block text-[0.62rem] uppercase tracking-[0.16em] text-ink-faint">
                            {v.channel}
                          </span>
                          <span className="mt-1.5 block text-[0.8rem] leading-relaxed text-ink-soft">
                            {v.why}
                          </span>
                        </figcaption>
                      </figure>
                    </Reveal>
                  ))}
                </div>
              </Container>
            </Section>
          )}

          {/* ---------------- now ---------------- */}
          <Section>
            <Container>
              <div className="mx-auto max-w-[68ch]">
                <Reveal>
                  <p className="eyebrow">এখন Now</p>
                  <h2 className="font-display mt-3 text-[1.618rem] font-normal leading-snug text-ink">
                    What state it is in
                  </h2>
                  <p className="lede mt-5 text-[0.98rem]">{detail.today}</p>
                </Reveal>

                {detail.images.length > 4 && (
                  <div className="mt-[2.618rem] grid gap-4 sm:grid-cols-2">
                    {detail.images.slice(4).map((im) => (
                      <Reveal key={im.src}>
                        <figure>
                          <div className="relative aspect-[4/3] w-full overflow-hidden border border-line bg-ink">
                            <Image
                              src={im.src}
                              alt={im.caption}
                              fill
                              sizes="(max-width: 640px) 100vw, 40vw"
                              className="object-cover"
                            />
                          </div>
                          <figcaption className="mt-2 text-[0.72rem] leading-relaxed text-ink-faint">
                            {im.caption}
                            <span className="ml-1.5 text-ink-faint/70">
                              {im.licence}
                            </span>
                          </figcaption>
                        </figure>
                      </Reveal>
                    ))}
                  </div>
                )}

                {detail.sources.length > 0 && (
                  <Reveal>
                    <details className="mt-[2.618rem] border-t border-line pt-5">
                      <summary className="cursor-pointer text-[0.65rem] uppercase tracking-[0.2em] text-ink-faint hover:text-gold">
                        Sources for this page
                      </summary>
                      <ul className="mt-4 space-y-1.5">
                        {detail.sources.map((u) => (
                          <li key={u}>
                            <a
                              href={u}
                              target="_blank"
                              rel="noreferrer noopener"
                              className="break-all text-[0.72rem] text-ink-faint hover:text-gold"
                            >
                              {u}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </details>
                  </Reveal>
                )}
              </div>
            </Container>
          </Section>
        </>
      ) : (
        /* ---------------- the short version, honestly labelled ---------------- */
        <Section className="bg-paper-2/40">
          <Container>
            <div className="mx-auto max-w-[68ch] space-y-8">
              <Reveal>
                <p className="eyebrow">কীভাবে How it is made</p>
                <p className="lede mt-3 text-[0.98rem]">{art.technique}</p>
              </Reveal>
              <Reveal>
                <p className="eyebrow">জানেন কি Did you know</p>
                <p className="lede mt-3 text-[0.98rem]">{art.didYouKnow}</p>
              </Reveal>
              <Reveal>
                <div className="surface p-6">
                  <p className="text-[0.85rem] leading-relaxed text-ink-soft">
                    The long version of this page is still being written. What
                    is here is checked; there is simply more of the story than
                    this, and it will be added rather than invented. If you know
                    this craft, or somebody who practises it, the committee
                    would be glad to hear from you.
                  </p>
                  <Link href="/thikana#write-to-us" className="btn btn-ghost mt-5">
                    Tell us about it
                  </Link>
                </div>
              </Reveal>
            </div>
          </Container>
        </Section>
      )}

      {/* ---------------- on either side ---------------- */}
      <Section className="!pt-0">
        <Container>
          <div className="grid gap-px border-t border-line bg-line sm:grid-cols-2">
            <Link
              href={`/shilpa/${prev.id}`}
              className="group bg-paper p-6 transition-colors hover:bg-paper-2/60"
            >
              <span className="flex items-center gap-2 text-[0.6rem] uppercase tracking-[0.2em] text-ink-faint">
                <ArrowLeft size={12} /> Before
              </span>
              <span className="bangla-display mt-2 block text-[1.272rem] text-ink transition-colors group-hover:text-sindoor">
                {prev.bangla}
              </span>
              <span className="block text-[0.82rem] text-ink-soft">
                {prev.name}
              </span>
            </Link>
            <Link
              href={`/shilpa/${next.id}`}
              className="group bg-paper p-6 text-right transition-colors hover:bg-paper-2/60"
            >
              <span className="flex items-center justify-end gap-2 text-[0.6rem] uppercase tracking-[0.2em] text-ink-faint">
                After <ArrowRight size={12} />
              </span>
              <span className="bangla-display mt-2 block text-[1.272rem] text-ink transition-colors group-hover:text-sindoor">
                {next.bangla}
              </span>
              <span className="block text-[0.82rem] text-ink-soft">
                {next.name}
              </span>
            </Link>
          </div>
        </Container>
      </Section>
    </>
  );
}

function Chapter({
  eyebrow,
  title,
  body,
  image,
  tinted = false,
}: {
  eyebrow: string;
  title: string;
  body: string;
  image?: { src: string; caption: string; attribution: string };
  tinted?: boolean;
}) {
  return (
    <Section className={tinted ? "bg-paper-2/40" : ""}>
      <Container>
        <div className="grid gap-[2.618rem] lg:grid-cols-[1.618fr_1fr] lg:items-start">
          <div>
            <Reveal>
              <p className="eyebrow">{eyebrow}</p>
              <h2 className="font-display mt-3 max-w-[22ch] text-[1.618rem] font-normal leading-snug text-ink sm:text-[2.058rem]">
                {title}
              </h2>
            </Reveal>
            <Reveal delay={0.08}>
              <div className="mt-6 space-y-4">
                {body.split(/\n{2,}/).map((p, i) => (
                  <p key={i} className="lede text-[0.98rem]">
                    {p}
                  </p>
                ))}
              </div>
            </Reveal>
          </div>

          {image && (
            <Reveal delay={0.12} className="lg:sticky lg:top-24">
              <figure>
                <div className="relative aspect-[4/5] w-full overflow-hidden border border-line bg-ink">
                  <Image
                    src={image.src}
                    alt={image.caption}
                    fill
                    sizes="(max-width: 1024px) 100vw, 30vw"
                    className="object-cover"
                  />
                </div>
                <figcaption className="mt-2 text-[0.72rem] leading-relaxed text-ink-faint">
                  {image.caption}
                  <span className="mt-0.5 block text-ink-faint/70">
                    {image.attribution}
                  </span>
                </figcaption>
              </figure>
            </Reveal>
          )}
        </div>
      </Container>
    </Section>
  );
}
