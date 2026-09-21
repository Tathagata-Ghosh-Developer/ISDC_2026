import type { Metadata } from "next";
import fs from "node:fs";
import path from "node:path";
import Link from "next/link";
import Image from "next/image";
import { Container, Section, SectionHeading } from "@/components/Section";
import Reveal from "@/components/Reveal";
import ListeningRoom from "@/components/gaan/ListeningRoom";
import { AMBIENCE, COLLECTIONS } from "@/lib/content/music";
import { DESK_LAYERS } from "@/lib/content/desk";

export const metadata: Metadata = {
  title: "Music",
  description:
    "The listening room. Twelve faders of dhak, conch, rain, adda and river, and eighty nine Bengali songs of the Puja, from the city and from the village.",
};

export const revalidate = 3600;

const ON_DESK = new Set(DESK_LAYERS.map((l) => l.id));

/** A local copy when the committee has fetched one, the original otherwise. */
function resolveSources() {
  return AMBIENCE.filter((l) => ON_DESK.has(l.id))
    .sort(
      (a, b) =>
        DESK_LAYERS.findIndex((l) => l.id === a.id) -
        DESK_LAYERS.findIndex((l) => l.id === b.id),
    )
    .map((layer) => {
      const local = path.join(
        process.cwd(),
        "public",
        "media",
        "audio",
        `${layer.id}.mp3`,
      );
      const exists = fs.existsSync(local);
      return {
        ...layer,
        local: exists,
        // Always same-origin. A local file is served directly; anything
        // else goes through a proxy on this server, so the browser's
        // content policy and the visitor's network never come into it.
        src: exists ? `/media/audio/${layer.id}.mp3` : `/api/audio/${layer.id}`,
      };
    });
}

export default function GaanPage() {
  const layers = resolveSources();
  const hosted = layers.filter((l) => l.local).length;
  const songs = COLLECTIONS.reduce((n, c) => n + c.tracks.length, 0);

  return (
    <>
      <Section className="pt-[7.5rem] sm:pt-[9rem]">
        <Container>
          <SectionHeading
            eyebrow="গান Music"
            title="One tap, and the Pujo is on"
            bangla="এক গান, এক আড্ডা, এক শরৎ"
            lede="A shelf chosen by the clock in Kolkata, playing by itself, the way a radio in a tea shop does. Underneath it, twelve faders of dhak, conch, rain and river, so you can build the room the songs are playing in. No signing in, nothing to install."
          />
        </Container>
      </Section>

      <Section className="!pt-0">
        <Container>
          <ListeningRoom
            layers={layers}
            collections={COLLECTIONS.map((c) => ({ ...c }))}
          />
        </Container>
      </Section>

      {/* ---------------- from the city to the river ---------------- */}
      <Section className="!py-0">
        <div className="relative overflow-hidden border-y border-line">
          <div className="flex gap-px bg-line">
            {[
              { src: "/media/puja2025/07.jpg", cap: "শহর", sub: "The pandal" },
              { src: "/media/iisc/main-building-sunset.jpg", cap: "ক্যাম্পাস", sub: "The Institute" },
              { src: "/media/art/old-kolkata-puja-night.jpg", cap: "কলকাতা", sub: "A Puja at night, nineteenth century" },
              { src: "/media/puja2025/21.jpg", cap: "মণ্ডপ", sub: "Last year, here" },
              { src: "/media/art/company-school-durbar.jpg", cap: "গ্রাম", sub: "Along the river" },
            ].map((f, i) => (
              <figure
                key={f.src}
                className="relative aspect-[3/4] min-w-0 flex-1 bg-ink"
              >
                <Image
                  src={f.src}
                  alt={f.sub}
                  fill
                  sizes="20vw"
                  className={`object-cover ${i % 2 ? "sepia-plate" : ""}`}
                />
                <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/85 to-transparent p-3">
                  <span className="bangla-display block text-[1rem] leading-tight text-paper-3">
                    {f.cap}
                  </span>
                  <span className="hidden text-[0.55rem] uppercase tracking-[0.16em] text-paper-3/70 sm:block">
                    {f.sub}
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </Section>

      <Section className="bg-paper-2/40">
        <Container>
          <div className="grid gap-[2.618rem] lg:grid-cols-[1.618fr_1fr] lg:items-center">
            <div>
              <video
                src="/media/video/cultural-night.mp4"
                poster="/media/video/cultural-night.jpg"
                controls
                playsInline
                preload="none"
                className="w-full border border-line bg-ink"
              />
            </div>
            <div>
              <h2 className="bangla-display text-[1.618rem] text-ink">
                এই গানগুলো এখানেই বাজে
              </h2>
              <p className="font-display mt-1 text-[1.05rem] text-ink-soft">
                These are the songs that play here
              </p>
              <p className="lede mt-5 text-[0.95rem]">
                Last year&apos;s cultural evening on this ground, with the same
                repertoire the shelves above carry. The Pujo sounds the same on
                a Bengaluru campus as it does in a north Kolkata lane and in a
                village where the pandal is bamboo and the river is the Ganga.
                That is the entire argument of this page.
              </p>
            </div>
          </div>
        </Container>
      </Section>

      {/* ---------------- provenance ---------------- */}
      <Section className="bg-paper-2/40">
        <Container>
          <SectionHeading
            eyebrow="কোথা থেকে Where these came from"
            title="Recorded at a real Puja, by people who said we could"
            lede={`Every layer is CC0 or Creative Commons Attribution, checked one at a time. The dhak was recorded in Kolkata on Dashami with dhakis from Barasat. ${hosted} of ${layers.length} are served from this site; the rest stream from where they were published.`}
          />

          <div className="mt-[2.618rem] grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {layers.map((l) => (
              <Reveal key={l.id}>
                <article className="surface flex h-full flex-col p-5">
                  <span className="bangla-display text-[1.15rem] text-ink">
                    {l.bangla}
                  </span>
                  <span className="text-[0.6rem] uppercase tracking-[0.18em] text-gold">
                    {l.licence}
                  </span>
                  <p className="mt-3 flex-1 text-[0.8rem] leading-relaxed text-ink-soft">
                    {l.description}
                  </p>
                  {l.caveat && (
                    <p className="mt-2 text-[0.72rem] leading-relaxed text-sindoor">
                      {l.caveat}
                    </p>
                  )}
                  <a
                    href={l.sourceUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="mt-4 text-[0.62rem] leading-relaxed text-ink-faint hover:text-gold"
                  >
                    {l.attribution}
                  </a>
                </article>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      {/* ---------------- the rules ---------------- */}
      <Section>
        <Container>
          <div className="grid gap-[2.618rem] lg:grid-cols-2">
            <Reveal>
              <h2 className="font-display text-[1.618rem] font-normal text-ink">
                {songs} songs, and none of them ours
              </h2>
              <p className="lede mt-4 text-[0.95rem]">
                Every recording on the shelves belongs to somebody. Saregama,
                the artists, their estates. So each one plays from the rights
                holder&apos;s own upload, which means they get the view and we
                get to keep our conscience.
              </p>
              <p className="lede mt-4 text-[0.95rem]">
                Each video was checked twice over: that it is the right
                recording, and that it permits embedding at all. About a quarter
                of the obvious uploads quietly do not, and fail silently inside
                a frame while playing perfectly on their own page.
              </p>
              <p className="lede mt-4 text-[0.95rem]">
                Mahishasuramardini is the strictest case of all, and it has{" "}
                <Link href="/mahalaya" className="text-gold hover:text-sindoor">
                  its own page
                </Link>{" "}
                with a radio on it.
              </p>
            </Reveal>

            <Reveal delay={0.1}>
              <div className="surface p-6">
                <h3 className="eyebrow">Two gaps we could not fill</h3>
                <p className="mt-4 text-[0.85rem] leading-relaxed text-ink-soft">
                  There is no freely licensed recording anywhere of the{" "}
                  <span className="bangla-display text-[1rem] text-ink">
                    কাঁসর
                  </span>{" "}
                  or of Bengali{" "}
                  <span className="bangla-display text-[1rem] text-ink">
                    উলুধ্বনি
                  </span>
                  . Those two faders use stand-ins and the desk says so.
                </p>
                <p className="mt-3 text-[0.85rem] leading-relaxed text-ink-soft">
                  Ten minutes of recording at this year&apos;s pandal, released
                  into the public domain, would fix that for everyone who ever
                  builds a page like this one. If you are coming with a phone,
                  that is a genuinely useful thing to carry.
                </p>
                <Link href="/jogdan" className="btn btn-ghost mt-6 w-full">
                  Volunteer for it
                </Link>
              </div>
            </Reveal>
          </div>
        </Container>
      </Section>
    </>
  );
}
