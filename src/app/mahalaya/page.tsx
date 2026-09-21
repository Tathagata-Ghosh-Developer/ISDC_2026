import type { Metadata } from "next";
import Link from "next/link";
import { Radio as RadioIcon } from "lucide-react";
import RadioSet, { type Station } from "@/components/Radio";
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

/**
 * The dial.
 *
 * Ten Akashvani stations, identified out of Prasar Bharati's own live
 * player at akashvani.gov.in/radio/live.php, which embeds a list of
 * 293 stations pairing each name with its stream. Not guessed from a
 * stream number: the numbering looks contiguous and is not. The index
 * one place below Kolkata Geetanjali is FM Gold Delhi, and putting a
 * Delhi feed on a Kolkata dial is exactly the sort of mistake that
 * nobody would ever notice and everybody would deserve.
 *
 * Every one of these streams responds, carries two bitrates, and
 * sends an open CORS header, so playing them here would be a few
 * lines of work. We do not, and the reason is worth writing down.
 *
 * Prasar Bharati's published terms grant use "for personal or
 * educational purposes" and then say, in the same clause, that "you
 * may not reproduce, republish, post, transmit or distribute any
 * material on Prasar Bharati website". Embedding a live feed is
 * transmitting it. The bar is absolute rather than commercial-only,
 * so being a non-profit student committee with an attribution line
 * does not cure it. Their hyperlinking policy asks for permission
 * even to link. TuneIn and the community aggregators carry these
 * streams anyway; that is tolerance rather than permission, and a
 * named committee of a named institute should not lean on it.
 *
 * So the dial tunes, and hands you to Akashvani's own player. The one
 * thing that does play here is Mahishasuramardini itself, from
 * Saregama's own upload, because Saregama owns the 1966 master and
 * permits the embed. That is the recording everybody actually came
 * for, and it is the one we can legitimately give them.
 *
 * If the committee writes to Prasar Bharati and gets an answer, the
 * streams are listed below ready to be switched on.
 */
const STATIONS: Station[] = [
  {
    id: "maitree",
    name: "Akashvani Maitree",
    bangla: "মৈত্রী",
    frequency: "594 kHz",
    short: "MAITREE",
    dial: 0.06,
    listenUrl: "https://akashvani.gov.in/radio/live.php",
    note: "The Bengali service beamed across the border, and the only station on this dial whose audience is mostly in another country.",
  },
  {
    id: "kolkata-a",
    name: "Akashvani Kolkata A",
    bangla: "গীতাঞ্জলি",
    frequency: "657 kHz",
    short: "KOL A",
    dial: 0.17,
    listenUrl: "https://akashvani.gov.in/radio/live.php",
    youtubeId: "YQyo8QeoYhc",
    startSeconds: 6,
    note: "Geetanjali. The primary Kolkata channel, and the one that originates Mahishasuramardini at four on Mahalaya morning.",
  },
  {
    id: "kolkata-b",
    name: "Akashvani Kolkata B",
    bangla: "সঞ্চয়িতা",
    frequency: "1008 kHz",
    short: "KOL B",
    dial: 0.28,
    listenUrl: "https://akashvani.gov.in/radio/live.php",
    note: "Sanchayita, the second Kolkata channel, named after the Tagore anthology that sits on most Bengali bookshelves.",
  },
  {
    id: "bangla",
    name: "Akashvani Bangla",
    bangla: "আকাশবাণী বাংলা",
    frequency: "National",
    short: "BANGLA",
    dial: 0.39,
    listenUrl: "https://akashvani.gov.in/radio/live.php",
    note: "The Bengali national stream, with no transmitter of its own. It exists only because somebody decided the language should have a channel rather than a frequency.",
  },
  {
    id: "shantiniketan",
    name: "Akashvani Shantiniketan",
    bangla: "শান্তিনিকেতন",
    frequency: "Medium wave",
    short: "SHANTI",
    dial: 0.5,
    listenUrl: "https://akashvani.gov.in/radio/live.php",
    note: "From Tagore's own town. Worth finding on a dial for the same reason it is worth going there.",
  },
  {
    id: "murshidabad",
    name: "Akashvani Murshidabad",
    bangla: "মুর্শিদাবাদ",
    frequency: "Medium wave",
    short: "MURSHID",
    dial: 0.6,
    listenUrl: "https://akashvani.gov.in/radio/live.php",
    note: "The old capital of Bengal, and the town whose ivory carvers made goddesses for the same households that were hiring the nautch troupes.",
  },
  {
    id: "siliguri",
    name: "Akashvani Siliguri",
    bangla: "শিলিগুড়ি",
    frequency: "Medium wave",
    short: "SILIGURI",
    dial: 0.69,
    listenUrl: "https://akashvani.gov.in/radio/live.php",
    note: "North Bengal, where the plains end. A different Bengali on the air, and a different Puja at the other end of the state.",
  },
  {
    id: "kurseong",
    name: "Akashvani Kurseong",
    bangla: "কার্সিয়াং",
    frequency: "Medium wave",
    short: "KURSEONG",
    dial: 0.78,
    listenUrl: "https://akashvani.gov.in/radio/live.php",
    note: "In the hills above Darjeeling. Broadcasts in Nepali and Bengali both, which is the honest sound of that district.",
  },
  {
    id: "vividh-bharati",
    name: "Vividh Bharati Kolkata",
    bangla: "বিবিধ ভারতী",
    frequency: "100.1 MHz",
    short: "VIVIDH",
    dial: 0.88,
    listenUrl: "https://akashvani.gov.in/radio/live.php",
    note: "Film songs, ten kilowatts, and the station that taught two generations of India what a request programme was.",
  },
  {
    id: "rainbow",
    name: "FM Rainbow Kolkata",
    bangla: "এফএম রেনবো",
    frequency: "107.0 MHz",
    short: "RAINBOW",
    dial: 0.96,
    listenUrl: "https://akashvani.gov.in/radio/live.php",
    note: "The city's own FM service, at the far end of the band where the needle runs out of dial.",
  },
];


const TIMELINE = [
  {
    year: "The 1930s",
    title: "The first broadcast",
    body: "Akashvani's Calcutta station begins putting out a pre dawn programme of Chandi recitation, song and narration. It is live, because there is nothing yet to record it onto. The exact first year is genuinely disputed: 1931 is the popular answer, All India Radio's own writing says 1936 or 1937, and nobody has produced a schedule that settles it.",
  },
  {
    year: "The makers",
    title: "Three men and a choir",
    body: "Bani Kumar writes the script. Pankaj Kumar Mullick composes and directs the music. Birendra Krishna Bhadra recites. Around them sing Dwijen Mukhopadhyay, Supriti Ghosh, Sandhya Mukhopadhyay and others, in a studio, before sunrise, every year.",
  },
  {
    year: "1962 to 1966",
    title: "Committed to tape",
    body: "The last live performance is usually placed in 1962 and the definitive studio recording in 1966. From then on the voice a Bengali hears at four in the morning is the same voice their grandparents heard performed live, which is the whole reason it cannot be replaced.",
  },
  {
    year: "1976",
    title: "The year Bengal refused",
    body: "All India Radio replaces the programme with a new production fronted by the film star Uttam Kumar. The reaction is immediate and furious. Offices are stoned, the new version is abandoned, and the original recording returns within the same season. It has not been touched since.",
  },
];

export default async function MahalayaPage() {
  const config = await getConfig();
  const { audioUrl, youtubeId, startSeconds, caption } = config.mahalaya;
  const mahalaya = config.schedule.find((d) => d.id === "mahalaya");

  return (
    <>
      <Section className="pt-[7.5rem] sm:pt-[9rem]">
        <Container>
          <SectionHeading
            as="h1"
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

      {/* ---------------- the wireless ---------------- */}
      <Section className="!pt-0">
        <Container>
          <div className="mb-6 flex flex-wrap items-baseline justify-between gap-3 border-b border-line pb-4">
            <div>
              <h2 className="bangla-display text-[1.618rem] text-ink">বেতার</h2>
              <p className="font-display text-[1.05rem] text-ink-soft">
                The wireless
              </p>
            </div>
            <p className="max-w-[52ch] text-[0.78rem] leading-relaxed text-ink-faint">
              Ten Akashvani stations, read out of Prasar Bharati&apos;s own
              player. Turn the knob and the static clears as you come onto one.
              Listening live means going to Akashvani&apos;s own player and
              choosing the station there, because their terms forbid anyone
              else transmitting the feed and they publish no direct link to a
              single station. Mahishasuramardini itself plays here, from the
              rights holder&apos;s own upload.
            </p>
          </div>

          <RadioSet
            stations={STATIONS}
            broadcast="Mahishasuramardini runs about ninety minutes from four in the morning, and Mahalaya falls on Saturday 10 October 2026. Akashvani Kolkata originates it and other stations carry it. Prasar Bharati has not published this year's schedule yet, so treat the hour as the one it has always been rather than as an announcement."
          />
        </Container>
      </Section>

      {/* ---------------- listen ---------------- */}
      <Section className="!pt-0">
        <Container>
          <Reveal>
            <div className="surface overflow-hidden">
              <div className="flex flex-wrap items-center gap-3 border-b border-line px-6 py-4">
                <RadioIcon size={17} className="text-gold" />
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
                      src={`https://www.youtube-nocookie.com/embed/${youtubeId}?start=${startSeconds}&rel=0`}
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
            lede="Every year since the 1930s, and identical since the recording was made. Bengal has treated any attempt to improve it as a provocation, and has been proved right once already."
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
                  Tarpan, on the riverbank. Water offered to the dead of one&apos;s
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
