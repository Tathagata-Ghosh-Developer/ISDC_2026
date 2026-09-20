import type { Metadata } from "next";
import Image from "next/image";
import { Container, Section, SectionHeading } from "@/components/Section";
import Reveal, { Stagger, StaggerItem } from "@/components/Reveal";
import { FACTS, ERAS, factsByEra, type Era } from "@/lib/content/facts";
import EraRail from "@/components/EraRail";

export const metadata: Metadata = {
  title: "Itihash",
  description:
    "The history of Durga Puja from the Devi Mahatmya to the UNESCO inscription: ninety sourced facts across fifteen centuries, including the ones the festival has quietly forgotten.",
};

type EraBlock = {
  era: Era;
  bangla: string;
  span: string;
  title: string;
  prose: string[];
  image?: { src: string; alt: string; caption: string };
};

const BLOCKS: EraBlock[] = [
  {
    era: "Ancient",
    bangla: "প্রাচীন",
    span: "before 1200",
    title: "A goddess assembled out of everyone else's weapons",
    prose: [
      "The text every Bengali household still reads at Mahalaya is not an independent scripture. The Devi Mahatmya is chapters 81 to 93 of the Markandeya Purana, inserted into a much older work somewhere between 400 and 600 CE. It is the first Sanskrit text to argue that the Goddess is not a consort or an attendant but the ground of reality itself, and it makes the argument through three battle narratives rather than through philosophy.",
      "The buffalo demon is older than the text. Terracottas from Nagar in Rajasthan show a goddess killing a buffalo in the first century BCE or thereabouts, and a dated inscription places a Mahishasuramardini image at Udayagiri Cave 6 in 401 CE. What the Devi Mahatmya adds is the theology: each god surrenders his weapon, and out of that collective disarmament a single figure is assembled who can do what none of them could.",
      "Bengal's own oldest Durgas are Pala and Sena stone, and they are not the goddess Bengalis now picture. The family group, the painted arch, the clay, the four-day calendar, all of that is still centuries away.",
    ],
    image: {
      src: "/media/art/durga-manuscript.jpg",
      alt: "An illuminated manuscript folio showing Durga slaying the buffalo demon",
      caption: "Mahishasuramardini in an illuminated manuscript folio",
    },
  },
  {
    era: "Medieval",
    bangla: "মধ্যযুগ",
    span: "1200, 1757",
    title: "Autumn, out of season and on purpose",
    prose: [
      "The story that explains why Bengal worships in autumn is a Bengali addition. In Krittibas Ojha's fifteenth-century Bengali Ramayana, Rama wakes the goddess out of season to ask for help against Ravana, akalbodhan, the untimely awakening. It is not in Valmiki's Sanskrit original. By the texts, Durga's proper season is spring, and Basanti Puja is the older rite. The exception swallowed the rule.",
      "The ritual manuals that make a four-day festival possible arrive in the same centuries: the Kalika Purana and the Brihaddharma Purana set out bodhon, adhibas, the Nabapatrika, the forty-eight minutes of Sandhi Puja. Bengal's smriti scholars then argue the details for three hundred years.",
      "Who held the first grand household Puja is genuinely contested. Raja Kangshanarayan of Taherpur around 1580 and Bhabananda Majumdar of Nadia are both named; the Sabarna Roy Choudhury family's Puja at Barisha, begun in 1610, has the strongest claim to unbroken continuity, and predates the city of Calcutta itself.",
    ],
  },
  {
    era: "Colonial",
    bangla: "ঔপনিবেশিক",
    span: "1757, 1900",
    title: "The Puja becomes a party, then a subscription",
    prose: [
      "In eighteenth-century Calcutta the Puja turned into the chief instrument of social competition among the new Bengali merchant elite. Households hired nautch troupes, laid on English food and drink, and invited Company officials. The story that Robert Clive attended Nabakrishna Deb's Puja in 1757 is repeated everywhere and rests on almost nothing: Deb became Clive's munshi after the battle, and the evidence is a single anonymous painting. By 1840 the Company was uneasy enough to forbid its own servants from attending.",
      "The scale was industrial. By 1839 Calcutta was producing something in the order of seven thousand idols a year. The lion beneath the goddess had a horse's face for most of this period, because the artisans making it had never seen a lion; the face changed only after real lions reached the Calcutta zoo in the 1880s.",
      "Then the money democratised. Twelve friends turned away from a household Puja at Guptipara in Hooghly pooled subscriptions and ran their own, baro-yari, twelve friends, the word that still means community Puja. Sources put it at 1761 or 1790. Either way it is the hinge: the festival stops belonging to families who can afford it.",
      "Not everyone approved. Debendranath Tagore abolished Durga Puja at Jorasanko on Brahmo principle, which is why the most famous Bengali family of the century kept no idol.",
    ],
    image: {
      src: "/media/art/company-school-durbar.jpg",
      alt: "A Company-school watercolour of a household Puja with a nautch performance",
      caption: "A thakurdalan during Puja, Company school watercolour",
    },
  },
  {
    era: "Modern",
    bangla: "আধুনিক",
    span: "1900, 1990",
    title: "Everyone's goddess, and a voice on the radio",
    prose: [
      "The baroyari Puja became the sarbojanin, of all people, in the first decades of the twentieth century. Bhowanipore's Sanatan Dharmotsahini Sabha ran a subscription Puja from 1909 or 1910; Baghbazar from 1919 is the one usually credited with fixing the modern civic form. The nationalist movement found the iconography ready-made, and Durga and Bharat Mata became difficult to tell apart on a poster.",
      "In 1931 All India Radio broadcast Mahishasuramardini before dawn on Mahalaya, with Birendra Krishna Bhadra reciting the Chandi. It has opened the season almost every year since. In 1976 the station replaced it with a new production fronted by the film star Uttam Kumar. Listeners were so angry that AIR offices were stoned, and the original recording was restored within the same season.",
      "Craft changed under pressure. A fire in Kumartuli in the late 1930s destroyed the workshops days before the Puja, and Gopeshwar Pal rebuilt by breaking the single ekchala frame into separate figures that could be made fast and in parallel. The split family group that now looks traditional was an emergency measure.",
    ],
    image: {
      src: "/media/art/nandalal-bose-durga.jpg",
      alt: "Nandalal Bose's Durga, painted in the mid-1940s",
      caption: "Nandalal Bose, Durga, mid-1940s",
    },
  },
  {
    era: "Contemporary",
    bangla: "সমকালীন",
    span: "1990, now",
    title: "An art biennale that happens to be a religious rite",
    prose: [
      "The turn came when pandals stopped imitating temples and started commissioning artists. Meera Mukherjee's 1990 Durga for Bakul Bagan, dressed in a Santhal sari, is the serious precedent; Bosepukur Sitala Mandir's breakthrough around the turn of the millennium is when the idea became a citywide competition. A pandal may now be built of jute, terracotta, bicycle parts or discarded plastic, and the bamboo scaffolding underneath is unchanged from a century ago.",
      "The economics are not a side effect. A British Council study with Queen Mary University of London and IIT Kharagpur, from 2019 fieldwork, valued the creative economy around Durga Puja at ₹32,377 crore, about 2.58 per cent of West Bengal's gross domestic product.",
      "In December 2021 UNESCO inscribed the festival on the Representative List of the Intangible Cultural Heritage of Humanity. The title is Durga Puja in Kolkata, not of India, because the nominating team argued that the specific civic form of the city was what deserved recognition.",
      "And the rite keeps moving. In 2021 a Kolkata Puja was conducted start to finish by a team of women priests. Sindoor khela has opened at many pandals to widows, single and transgender women. The festival has always been argued about; that argument is the tradition.",
    ],
    image: {
      src: "/media/puja/archive-1.jpg",
      alt: "The idol at a recent IISc Sharodiya Durgotsab",
      caption: "The goddess in daker saj, IISc campus",
    },
  },
];

export default function ItihashPage() {
  return (
    <>
      <Section className="pt-[7.5rem] sm:pt-[9rem]">
        <Container>
          <SectionHeading
            eyebrow="ইতিহাস History"
            title="Fifteen centuries, and the parts that got lost"
            bangla="হারিয়ে যাওয়া ইতিহাস"
            lede="Durga Puja is often described as timeless, which is the one thing it has never been. Almost everything a Bengali now thinks is ancient about it was invented, argued over, or improvised under pressure at a datable moment. Ninety facts follow, each with its source, including the several that contradict what the festival tells itself."
          />
        </Container>
      </Section>

      <EraRail eras={ERAS} />

      {BLOCKS.map((block, i) => {
        const facts = factsByEra(block.era);
        return (
          <Section
            key={block.era}
            id={block.era.toLowerCase()}
            className={i % 2 === 1 ? "bg-paper-2/40" : ""}
          >
            <Container>
              <div className="grid gap-[2.618rem] lg:grid-cols-[1fr_1.618fr] lg:items-start">
                <Reveal className="lg:sticky lg:top-24">
                  <p className="bangla-display text-[2.618rem] leading-tight text-sindoor">
                    {block.bangla}
                  </p>
                  <p className="font-display mt-2 text-[1.272rem] text-ink">
                    {block.era}
                  </p>
                  <p className="mt-1 text-[0.7rem] uppercase tracking-[0.24em] text-gold">
                    {block.span}
                  </p>
                  <div className="mt-5 h-px w-[3rem] bg-gold" />
                  <p className="mt-5 text-[0.7rem] uppercase tracking-[0.2em] text-ink-faint">
                    {facts.length} recorded facts
                  </p>

                  {block.image && (
                    <figure className="mt-8 hidden lg:block">
                      <div className="relative aspect-[4/5] w-full overflow-hidden">
                        <Image
                          src={block.image.src}
                          alt={block.image.alt}
                          fill
                          sizes="30vw"
                          className="sepia-plate object-cover"
                        />
                      </div>
                      <figcaption className="mt-2 text-[0.65rem] uppercase tracking-[0.18em] text-ink-faint">
                        {block.image.caption}
                      </figcaption>
                    </figure>
                  )}
                </Reveal>

                <div>
                  <Reveal>
                    <h2 className="font-display text-[1.618rem] font-normal leading-snug text-ink sm:text-[2.058rem]">
                      {block.title}
                    </h2>
                    <div className="mt-6 space-y-4">
                      {block.prose.map((p, j) => (
                        <p key={j} className="lede text-[0.98rem]">
                          {p}
                        </p>
                      ))}
                    </div>
                  </Reveal>

                  <Stagger className="mt-[2.618rem] grid gap-4 sm:grid-cols-2">
                    {facts.map((f) => (
                      <StaggerItem key={f.id}>
                        <article className="surface flex h-full flex-col p-5">
                          {f.year && (
                            <span className="font-display text-[0.95rem] text-gold">
                              {f.year}
                            </span>
                          )}
                          <h3 className="mt-1 text-[0.95rem] font-medium leading-snug text-ink">
                            {f.title}
                          </h3>
                          <p className="mt-2.5 flex-1 text-[0.82rem] leading-relaxed text-ink-soft">
                            {f.fact}
                          </p>
                          <p className="bangla mt-3 border-l-2 border-gold/40 pl-3 text-[0.82rem] leading-loose text-ink-soft">
                            {f.bangla}
                          </p>
                          <p className="mt-4 text-[0.58rem] uppercase tracking-[0.2em] text-ink-faint">
                            {f.source}
                          </p>
                        </article>
                      </StaggerItem>
                    ))}
                  </Stagger>
                </div>
              </div>
            </Container>
          </Section>
        );
      })}

      {/* ============================================================
          Ray, why this site is lettered the way it is
          ============================================================ */}
      <Section className="bg-paper-2/40">
        <Container>
          <SectionHeading
            eyebrow="রায় A note on the lettering"
            title="The man who drew the letters"
            bangla="সত্যজিৎ রায়"
            lede="Before Pather Panchali, Satyajit Ray spent thirteen years at an advertising agency in Calcutta as a visualiser. He designed book jackets, laid out the children's magazine his grandfather had founded, and lettered the title cards of his own films by hand."
          />

          <div className="mt-[2.618rem] grid gap-[2.618rem] lg:grid-cols-[1.618fr_1fr] lg:items-start">
            <Reveal>
              <div className="space-y-4">
                <p className="lede text-[0.98rem]">
                  He joined D. J. Keymer in April 1943 and stayed until the
                  success of Pather Panchali made him a film-maker full time.
                  Typography never left. He drew four Latin typefaces, and two
                  of them, Ray Roman and Ray Bizarre, won an international
                  competition in 1971. His Bengali lettering was brushwork: a
                  loaded stroke, tight counters, letters sized for a cinema
                  screen rather than a page.
                </p>
                <p className="lede text-[0.98rem]">
                  The goddess turns up in his work more than once. Devi, made in
                  1960, is about a young woman whose father-in-law dreams she is
                  an incarnation of the goddess, and about what that conviction
                  does to her. Joi Baba Felunath, from 1979, sends his detective
                  to Varanasi during Durga Puja, and the rite runs underneath
                  the whole mystery.
                </p>
                <p className="lede text-[0.98rem]">
                  This site is lettered in that direction on purpose. Bengali
                  headings are set in a brush face, the roman display carries
                  the high stroke contrast of Ray Roman, and the rules and ticks
                  are drawn rather than ruled. It is an homage, not a
                  reproduction: none of Ray's own typefaces are freely
                  licensed, so nothing here is his.
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.12}>
              <div className="surface p-6">
                <h3 className="eyebrow">In this palette</h3>
                <ul className="mt-5 space-y-4 text-[0.85rem] leading-relaxed text-ink-soft">
                  <li>
                    <span className="block text-ink">Brush Bengali</span>
                    For headings, the way a title card is lettered rather than
                    typeset.
                  </li>
                  <li>
                    <span className="block text-ink">High-contrast roman</span>
                    Thick stems, hairline joins, in the register of Ray Roman.
                  </li>
                  <li>
                    <span className="block text-ink">Flat fields of colour</span>
                    Scarlet, turmeric and near-black, placed off-centre and left
                    unmodelled, as on his posters and Sandesh covers.
                  </li>
                  <li>
                    <span className="block text-ink">Aged paper</span>
                    The stock everything in Bengal was printed on, including the
                    Puja annuals this site owes its facts to.
                  </li>
                </ul>
              </div>
            </Reveal>
          </div>
        </Container>
      </Section>

      <Section>
        <Container>
          <Reveal>
            <div className="surface p-7 sm:p-[2.618rem]">
              <h2 className="font-display text-[1.618rem] font-normal text-ink">
                On sources
              </h2>
              <p className="lede mt-4 max-w-[68ch] text-[0.92rem]">
                Every one of the {FACTS.length} facts on this page carries the
                source it came from. Where accounts conflict, the date of the
                Guptipara baroyari, who held the first grand household Puja,
                whether Clive attended anything at all, the conflict is stated
                rather than resolved in favour of the better story.
              </p>
              <p className="lede mt-3 max-w-[68ch] text-[0.92rem]">
                Several claims that circulate widely were checked and left out
                because no reliable source supports them. If you can source one
                of them properly, or you find an error here, tell a convenor and
                it will be corrected.
              </p>
            </div>
          </Reveal>
        </Container>
      </Section>
    </>
  );
}
