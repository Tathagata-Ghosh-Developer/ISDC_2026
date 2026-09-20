import type { Metadata } from "next";
import fs from "node:fs";
import path from "node:path";
import Link from "next/link";
import { Container, Section, SectionHeading } from "@/components/Section";
import Reveal from "@/components/Reveal";
import SoundDesk from "@/components/SoundDesk";
import SongShelf from "@/components/SongShelf";
import { AMBIENCE, COLLECTIONS } from "@/lib/content/music";

export const metadata: Metadata = {
  title: "Gaan",
  description:
    "The listening room. A mixing desk of dhak, conch, rain and adda, and eighty nine Bengali songs of the Puja, from the city and from the village.",
};

export const revalidate = 3600;

/** Prefer a local copy when the committee has downloaded one. */
function resolveSources() {
  return AMBIENCE.map((layer) => {
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
      src: exists ? `/media/audio/${layer.id}.mp3` : layer.remoteUrl,
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
            eyebrow="গান The listening room"
            title="Build the Pujo you can hear"
            bangla="শব্দের মণ্ডপ"
            lede="Two things live on this page. A mixing desk of real recordings, so you can put the dhak under the rain and the conch over both. And the songs, which are the actual reason a Bengali knows autumn has arrived."
          />
        </Container>
      </Section>

      {/* ---------------- the desk ---------------- */}
      <Section className="!pt-0">
        <Container>
          <div className="mb-6 flex flex-wrap items-baseline justify-between gap-3 border-b border-line pb-4">
            <div>
              <h2 className="bangla-display text-[1.618rem] text-ink">আবহ</h2>
              <p className="font-display text-[1.05rem] text-ink-soft">
                The mixing desk
              </p>
            </div>
            <p className="max-w-[52ch] text-[0.78rem] leading-relaxed text-ink-faint">
              Nothing plays until you move a fader. Every layer is a freely
              licensed recording, credited underneath it, and most were recorded
              at a real Puja rather than made in a studio.
            </p>
          </div>

          <SoundDesk layers={layers} />

          <p className="mt-4 text-[0.72rem] leading-relaxed text-ink-faint">
            {hosted} of {layers.length} layers are served from this site. The
            rest stream from where they were published, so they depend on that
            host being reachable. Running{" "}
            <code className="text-gold">npm run fetch:audio</code> pulls local
            copies of all of them.
          </p>
        </Container>
      </Section>

      {/* ---------------- the songs ---------------- */}
      <Section className="bg-paper-2/40">
        <Container>
          <SectionHeading
            eyebrow="গানের তাক The shelves"
            title={`${songs} Bengali songs, and not one in any other language`}
            bangla="শহর আর গ্রাম, একসঙ্গে"
            lede="Mahalaya, the Agomoni songs about a daughter coming home, the Puja records the city grew up on, the Baul and Bhatiali of the villages along the river, and the funny ones, because a Pujo without a joke is a committee meeting."
          />

          <div className="mt-[2.618rem]">
            <SongShelf collections={COLLECTIONS.map((c) => ({ ...c }))} />
          </div>
        </Container>
      </Section>

      {/* ---------------- the rules ---------------- */}
      <Section>
        <Container>
          <div className="grid gap-[2.618rem] lg:grid-cols-2">
            <Reveal>
              <h2 className="font-display text-[1.618rem] font-normal text-ink">
                Why the songs are embedded and never hosted
              </h2>
              <p className="lede mt-4 text-[0.95rem]">
                Every one of these recordings belongs to somebody. Saregama, the
                artists, their estates. A student committee putting files of
                them on its own server would be taking something that is not
                ours, however affectionately.
              </p>
              <p className="lede mt-4 text-[0.95rem]">
                So each song plays from the rights holder&apos;s own upload,
                which means they get the view and we get to keep our conscience.
                Every video was checked to be the right song and to permit
                embedding at all, because about a quarter of the obvious uploads
                quietly do not.
              </p>
              <p className="lede mt-4 text-[0.95rem]">
                The Mahalaya recitation is the same story, only stricter. The
                broadcast belongs to Prasar Bharati and the 1966 recording to
                Saregama, and none of it has fallen into the public domain. It
                sits on the{" "}
                <Link href="/mahalaya" className="text-gold hover:text-sindoor">
                  Mahalaya page
                </Link>
                , embedded, as it should be.
              </p>
            </Reveal>

            <Reveal delay={0.1}>
              <div className="surface p-6">
                <h3 className="eyebrow">Two gaps we could not fill</h3>
                <p className="mt-4 text-[0.85rem] leading-relaxed text-ink-soft">
                  There is no freely licensed recording anywhere of the{" "}
                  <span className="bangla-display text-[1rem] text-ink">
                    কাঁসর
                  </span>
                  , the flat bell metal disc, or of Bengali{" "}
                  <span className="bangla-display text-[1rem] text-ink">
                    উলুধ্বনি
                  </span>
                  . The desk uses stand-ins for both and says so on the fader.
                </p>
                <p className="mt-3 text-[0.85rem] leading-relaxed text-ink-soft">
                  Ten minutes of recording at this year&apos;s pandal, released
                  into the public domain, would fix that for everyone who ever
                  builds a page like this. If you are coming with a phone, that
                  is a genuinely useful thing to do.
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
