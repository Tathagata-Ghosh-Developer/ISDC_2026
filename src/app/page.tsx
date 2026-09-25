import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Heart } from "lucide-react";
import { InstagramIcon, YoutubeIcon, WhatsappIcon } from "@/components/BrandIcons";
import Hero from "@/components/Hero";
import Reveal, { Stagger, StaggerItem } from "@/components/Reveal";
import { Container, Section, SectionHeading } from "@/components/Section";
import { FactMarquee, FactGrid } from "@/components/Facts";
import { getConfig } from "@/lib/config";
import { ART_FORMS } from "@/lib/content/artforms";
import TitleCard from "@/components/TitleCard";

export default async function Home() {
  const config = await getConfig();

  const bodhon = config.schedule.find((d) => d.id === "shashthi");

  return (
    <>
      <Hero
        hero={config.hero}
        countdownTo={config.dates.arrival}
        bodhonLabel={`until Ma reaches the campus, ${bodhon?.date ?? "16 October 2026"}`}
      />

      {/* ============================================================
          Ahwan, the invitation
          ============================================================ */}
      <Section id="ahwan">
        <Container>
          <div className="grid items-center gap-[2.618rem] lg:grid-cols-[1.618fr_1fr]">
            <Reveal>
              <p className="eyebrow">আহ্বান The invitation</p>
              <blockquote className="bangla mt-6 text-[1.272rem] leading-[2] text-ink sm:text-[1.5rem]">
                সেমেস্টার আর গবেষণার ব্যস্ত জীবন থেকে একটু সময় বার করে ক্ষণিকের
                জন্য চোখ দুটো বন্ধ করো, আর একটা গভীর শ্বাস নিয়ে দেখো, চোখের
                সামনে যেন ভেসে উঠছে শুভ্র শিউলি আর কাশফুল।
              </blockquote>
              <p className="lede mt-6 max-w-[58ch]">
                Close your eyes for a moment and the white of shiuli and kash
                appears, clouds turn from monsoon grey to drifting cotton, and
                the dhak is almost ready to sound. Bengalis begin the Puja a
                month early. Nobody is surprised by this.
              </p>
              <p className="lede mt-4 max-w-[58ch]">
                But you are far from home. That is the whole point. For five
                days this campus stops being an institute and becomes the
                courtyard of a house, one where nobody is a stranger, the
                khichuri is free, and the queue for anjali is the friendliest
                queue in Bengaluru.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/utsab" className="btn btn-ghost">
                  See the five days
                </Link>
                <Link href="/jogdan" className="btn btn-ghost">
                  Volunteer with us
                </Link>
              </div>
            </Reveal>

            <Reveal delay={0.15}>
              <div className="relative aspect-[4/5] w-full overflow-hidden">
                <Image
                  src="/media/art/old-kolkata-puja-night.jpg"
                  alt="A nineteenth-century painting of a Durga Puja at night in Kolkata"
                  fill
                  sizes="(max-width: 1024px) 100vw, 38vw"
                  className="sepia-plate object-cover"
                />
                <div className="vignette absolute inset-0" />
              </div>
              <p className="mt-3 text-[0.68rem] uppercase tracking-[0.22em] text-ink-faint">
                A Puja at night, Calcutta nineteenth century
              </p>
            </Reveal>
          </div>
        </Container>
      </Section>

      <FactMarquee />

      {/* ============================================================
          The five days
          ============================================================ */}
      <Section>
        <Container>
          <SectionHeading
            eyebrow="উৎসব The days"
            title="Six tithis, one long exhale"
            bangla="ষষ্ঠী থেকে দশমী"
            lede="From the waking of the goddess out of season to the mirror in which she is watched leaving. Timings firm up closer to the day; the shape does not change."
          />

          <Stagger className="mt-[2.618rem] grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {config.schedule.map((day) => (
              <StaggerItem key={day.id}>
                <Link
                  href={`/utsab#${day.id}`}
                  className="group surface flex h-full flex-col p-6 transition-all duration-500 hover:-translate-y-1 hover:border-gold"
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="bangla text-[1.272rem] font-semibold text-sindoor">
                      {day.tithiBangla}
                    </span>
                    <span className="text-[0.62rem] uppercase tracking-[0.22em] text-ink-faint">
                      {day.weekday}
                    </span>
                  </div>
                  <span className="font-display mt-1 text-[1.1rem] text-ink">
                    {day.tithi}
                  </span>
                  <span className="mt-0.5 text-[0.75rem] text-gold">
                    {day.date}
                  </span>
                  <p className="mt-4 flex-1 text-[0.85rem] leading-relaxed text-ink-soft">
                    {day.headline}
                  </p>
                  <span className="mt-5 inline-flex items-center gap-1 text-[0.68rem] uppercase tracking-[0.2em] text-ink-faint transition-colors group-hover:text-gold">
                    {day.rituals.length} rituals
                    <ArrowUpRight size={12} />
                  </span>
                </Link>
              </StaggerItem>
            ))}
          </Stagger>
        </Container>
      </Section>

      {/* ============================================================
          Two rivers
          ============================================================ */}
      <Section className="overflow-hidden">
        <Container>
          <div className="grid items-center gap-[2.618rem] lg:grid-cols-[1fr_1.618fr]">
            <Reveal className="order-2 lg:order-1">
              <div className="grid gap-4">
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image
                    src="/media/iisc/main-building-front.jpg"
                    alt="The Main Building of the Indian Institute of Science"
                    fill
                    sizes="(max-width: 1024px) 100vw, 38vw"
                    className="sepia-plate object-cover"
                  />
                </div>
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image
                    src="/media/art/company-school-puja.jpg"
                    alt="A Company-school painting of a household Durga Puja"
                    fill
                    sizes="(max-width: 1024px) 100vw, 38vw"
                    className="sepia-plate object-cover"
                  />
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.12} className="order-1 lg:order-2">
              <p className="eyebrow">দুই নদী Two rivers</p>
              <h2 className="font-display mt-3 text-[2.058rem] font-normal leading-[1.1] text-ink sm:text-[2.618rem]">
                One carries silt. One carries questions.
              </h2>
              <p className="lede mt-6 max-w-[56ch]">
                Durga Puja is a river festival. The clay comes from the
                riverbank, the Nabapatrika is bathed in the river, and on
                Dashami everything returns to it. Bengal measured its year by
                what the water brought and took away.
              </p>
              <p className="lede mt-4 max-w-[56ch]">
                An institute is the same arrangement with a different current.
                Knowledge is deposited, carried, argued over and eventually
                given back. This one was vested in 1909 and took its first
                students in 1911. C. V. Raman arrived as its first Indian
                Director in 1933, and from 1939 to 1948 the Director was Jnan
                Chandra Ghosh, a Bengali chemist trained under Prafulla Chandra
                Ray, who left here to found IIT Kharagpur.
              </p>
              <p className="lede mt-4 max-w-[56ch]">
                The campus was always a mixed inheritance. Its founder was a
                Parsi, its land was granted by a Hindu queen ruling as regent
                for a son still too young to rule, and the Tata Memorial that
                faces the Main Building carries an Avestan inscription, good
                thought, good word, good deed.
              </p>
              <p className="lede mt-4 max-w-[56ch]">
                So when a Puja happens here, nothing is being borrowed. On
                Nabami the old rite is Ayudha Puja, where you put down your
                instruments and garland them. A laboratory has never needed a
                translation for that.
              </p>
              <p className="lede mt-4 max-w-[56ch]">
                And there is a straighter line than that. Bengaluru&apos;s first
                Sarbojanin Durga Puja was held in 1950, and by the Bengalee
                Association&apos;s own account it happened under the initiative
                of a few professors of the Indian Institute of Science. The
                city&apos;s Pujo started here. We are only picking it back up.
              </p>
              <Link href="/itihash" className="btn btn-ghost mt-8">
                Read the long history
              </Link>
            </Reveal>
          </div>
        </Container>
      </Section>

      <TitleCard
        bangla="মৃন্ময়ী হয়ে ওঠেন চিন্ময়ী"
        roman="Clay becomes consciousness"
        caption="The idol is river clay on a bamboo frame. What changes it is the eyes, painted last, on Mahalaya, by an artisan who has fasted for it."
      />

      {/* ============================================================
          Art forms
          ============================================================ */}
      <Section className="bg-paper-2/40">
        <Container>
          <SectionHeading
            eyebrow="শিল্প The crafts"
            title="A festival is a commission"
            bangla="বাংলার শিল্পের মরশুম"
            lede="Behind five days of ritual sit a dozen trades, most of them seasonal, several of them endangered. These are the hands the Puja hires."
          />

          <Stagger className="mt-[2.618rem] grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {ART_FORMS.slice(0, 8).map((art) => (
              <StaggerItem key={art.id}>
                <Link
                  href={`/shilpa#${art.id}`}
                  className="group surface flex h-full flex-col p-5 transition-all duration-500 hover:-translate-y-1 hover:border-gold"
                >
                  <span className="text-[0.6rem] uppercase tracking-[0.24em] text-gold">
                    {art.category}
                  </span>
                  <span className="bangla mt-2 text-[1.1rem] font-semibold text-ink">
                    {art.bangla}
                  </span>
                  <span className="font-display text-[0.95rem] text-ink-soft">
                    {art.name}
                  </span>
                  <p className="mt-3 flex-1 text-[0.78rem] leading-relaxed text-ink-soft">
                    {art.didYouKnow}
                  </p>
                  <span
                    className={`mt-4 text-[0.6rem] uppercase tracking-[0.2em] ${
                      art.status === "Endangered" ? "text-sindoor" : "text-ink-faint"
                    }`}
                  >
                    {art.status}
                  </span>
                </Link>
              </StaggerItem>
            ))}
          </Stagger>

          <Reveal className="mt-8">
            <Link href="/shilpa" className="btn btn-ghost">
              All the art forms
            </Link>
          </Reveal>
        </Container>
      </Section>

      {/* ============================================================
          Donation
          ============================================================ */}
      <Section>
        <Container>
          <div className="surface relative overflow-hidden p-7 sm:p-[2.618rem] lg:p-[4.236rem]">
            <div
              className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full opacity-40 blur-3xl"
              style={{ background: "var(--c-glow)" }}
            />
            <div className="relative grid gap-[2.618rem] lg:grid-cols-[1.618fr_1fr]">
              <Reveal>
                <p className="eyebrow">দান Give</p>
                <h2 className="font-display mt-3 text-[2.058rem] font-normal leading-[1.1] text-ink sm:text-[2.618rem]">
                  Funded entirely by the people who show up
                </h2>
                <p className="lede mt-6 max-w-[54ch]">
                  {config.donation.note}
                </p>
                <p className="bangla mt-3 max-w-[54ch] text-[0.95rem] leading-loose text-ink-soft">
                  {config.donation.noteBangla}
                </p>
                <p className="lede mt-4 max-w-[54ch]">
                  There is no payment gateway, so no percentage is skimmed off.
                  You transfer directly to the committee account, we verify it
                  against the bank statement, and a numbered receipt reaches
                  your WhatsApp. Every verified rupee is recorded against your
                  name, like everybody else&apos;s.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link href="/daan" className="btn btn-primary">
                    <Heart size={14} /> Donate now
                  </Link>
                </div>
              </Reveal>

              <Reveal delay={0.12}>
                <div className="flex h-full flex-col justify-center gap-5 border-line lg:border-l lg:pl-[2.618rem]">
                  <p className="bangla-display text-[1.618rem] leading-relaxed text-ink">
                    যা মন চায়, তাই দিন
                  </p>
                  <p className="text-[0.88rem] leading-relaxed text-ink-soft">
                    There is no minimum and no suggested minimum. A hundred
                    rupees from a first year and twenty thousand from an alumnus
                    get the same receipt, under the same rules.
                  </p>
                </div>
              </Reveal>
            </div>
          </div>
        </Container>
      </Section>

      {/* ============================================================
          Facts
          ============================================================ */}
      <Section className="bg-paper-2/40">
        <Container>
          <SectionHeading
            eyebrow="জানা-অজানা Did you know"
            title="Things the Puja has quietly forgotten"
            lede="Scattered through this site are facts with sources attached. Here are three to start with."
          />
          <FactGrid count={3} offset={2} className="mt-[2.618rem]" />
          <Reveal className="mt-8">
            <Link href="/itihash" className="btn btn-ghost">
              The full history
            </Link>
          </Reveal>
        </Container>
      </Section>

      {/* ============================================================
          Community
          ============================================================ */}
      <Section>
        <Container>
          <SectionHeading
            eyebrow="যোগাযোগ Stay close"
            title="Come stand in the courtyard"
            bangla="আমাদের সঙ্গে থাকুন"
            align="center"
          />
          <Stagger className="mx-auto mt-[2.618rem] grid max-w-[900px] gap-4 sm:grid-cols-3">
            {[
              {
                href: config.links.whatsappGroup,
                Icon: WhatsappIcon,
                label: "WhatsApp group",
                bangla: "হোয়াটসঅ্যাপ",
                note: "Announcements, rehearsals, last-minute calls for hands.",
              },
              {
                href: config.links.instagram,
                Icon: InstagramIcon,
                label: "Instagram",
                bangla: "ইনস্টাগ্রাম",
                note: "Posters, reels, and the pandal going up in real time.",
              },
              {
                href: config.links.youtube,
                Icon: YoutubeIcon,
                label: "YouTube",
                bangla: "ইউটিউব",
                note: "Full cultural evenings and the arati, for anyone who could not come.",
              },
            ].map((c) => (
              <StaggerItem key={c.label}>
                <a
                  href={c.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="group surface flex h-full flex-col items-center p-6 text-center transition-all duration-500 hover:-translate-y-1 hover:border-gold"
                >
                  <c.Icon size={22} className="text-gold" />
                  <span className="font-display mt-4 text-[1.1rem] text-ink">
                    {c.label}
                  </span>
                  <span className="bangla text-[0.8rem] text-ink-faint">
                    {c.bangla}
                  </span>
                  <p className="mt-3 text-[0.78rem] leading-relaxed text-ink-soft">
                    {c.note}
                  </p>
                </a>
              </StaggerItem>
            ))}
          </Stagger>
        </Container>
      </Section>
    </>
  );
}

