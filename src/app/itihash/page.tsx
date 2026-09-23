import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Container, Section, SectionHeading } from "@/components/Section";
import Reveal, { Stagger, StaggerItem } from "@/components/Reveal";
import { Parallax } from "@/components/Depth";
import { FACTS, ERAS, factsByEra, type Era } from "@/lib/content/facts";
import EraRail from "@/components/EraRail";

export const metadata: Metadata = {
  title: "Itihash",
  description:
    "The history of Durga Puja from the Devi Mahatmya to the UNESCO inscription, ninety sourced facts across fifteen centuries, including the ones the festival has quietly forgotten.",
};

type EraBlock = {
  era: Era;
  bangla: string;
  span: string;
  title: string;
  prose: string[];
  image?: { src: string; alt: string; caption: string };
  /**
   * A second, wider run of pictures under the prose. The one in the
   * margin sets the era; these show what it actually looked like, and
   * each caption says what the object is rather than decorating it.
   */
  plates?: { src: string; alt: string; caption: string; note?: string }[];
};

const BLOCKS: EraBlock[] = [
  {
    era: "Ancient",
    bangla: "প্রাচীন",
    span: "before 1200",
    title: "A goddess assembled out of everyone else's weapons",
    prose: [
      "The text every Bengali household still reads at Mahalaya is not an independent scripture. The Devi Mahatmya is chapters 81 to 93 of the Markandeya Purana, inserted into a much older work somewhere between 400 and 600 CE. It is the first Sanskrit text to argue that the Goddess is not a consort or an attendant but the ground of reality itself, and it makes the argument through three battle narratives rather than through philosophy.",
      "The buffalo demon is older than the text. Terracottas from Nagar in Rajasthan show a goddess killing a buffalo in the first century BCE or thereabouts, and a dated inscription places a Mahishasuramardini image at Udayagiri Cave 6 in 401 CE. What the Devi Mahatmya adds is the theology, each god surrenders his weapon, and out of that collective disarmament a single figure is assembled who can do what none of them could.",
      "Bengal's own oldest Durgas are Pala and Sena stone, and they are not the goddess Bengalis now picture. The family group, the painted arch, the clay, the five-day calendar, all of that is still centuries away.",
    ],
    image: {
      src: "/media/art/durga-manuscript.jpg",
      alt: "An illuminated manuscript folio showing Durga slaying the buffalo demon",
      caption: "Mahishasuramardini in an illuminated manuscript folio",
    },
    plates: [
      {
        src: "/media/art/durga-sandstone-rajasthan.jpg",
        alt: "A sandstone relief of Durga killing the buffalo demon, Rajasthan",
        caption: "Durga and the buffalo demon, sandstone, Rajasthan",
        note: "Eight arms, a trident through the buffalo's flank, and the demon emerging from its neck. The composition is fixed centuries before Bengal takes it up, and every clay pratima on a Kolkata ground is still quoting it.",
      },
      {
        src: "/media/art/durga-stone-pala.jpg",
        alt: "A stone Mahishasuramardini carved in the Pala and Sena manner",
        caption: "Mahishasuramardini in stone, before Bengal worked in clay",
        note: "Bengal's oldest Durgas are stone, and they are not the goddess Bengalis now picture. No family group, no painted arch, no five-day calendar. Everything that now reads as timeless is still centuries away from this.",
      },
      {
        src: "/media/art/durga-rock-relief.jpg",
        alt: "A rock-cut relief of Mahishasuramardini, the goddess riding a lion into the buffalo demon's army",
        caption: "Mahishasuramardini, rock-cut relief",
        note: "Carved into living rock rather than assembled from clay. She is a battlefield here, not a household guest, and the lion is doing as much of the work as she is.",
      },
    ],
  },
  {
    era: "Medieval",
    bangla: "মধ্যযুগ",
    span: "1200, 1757",
    title: "Autumn, out of season and on purpose",
    prose: [
      "The story that explains why Bengal worships in autumn is a Bengali addition. In Krittibas Ojha's fifteenth-century Bengali Ramayana, Rama wakes the goddess out of season to ask for help against Ravana, akalbodhan, the untimely awakening. It is not in Valmiki's Sanskrit original. By the texts, Durga's proper season is spring, and Basanti Puja is the older rite. The exception swallowed the rule.",
      "The ritual manuals that make a five-day festival possible arrive in the same centuries, the Kalika Purana and the Brihaddharma Purana set out bodhon, adhibas, the Nabapatrika, the forty-eight minutes of Sandhi Puja. Bengal's smriti scholars then argue the details for three hundred years.",
      "Who held the first grand household Puja is genuinely contested. Raja Kangshanarayan of Taherpur around 1580 and Bhabananda Majumdar of Nadia are both named; the Sabarna Roy Choudhury family's Puja at Barisha, begun in 1610, has the strongest claim to unbroken continuity, and predates the city of Calcutta itself.",
    ],
    image: {
      src: "/media/art/durga-painting-rajput.jpg",
      alt: "A painting of Durga on her lion driving a spear into the buffalo demon",
      caption: "Durga and Mahishasura, painted",
    },
    plates: [
      {
        src: "/media/art/durga-folio-aged.jpg",
        alt: "A painted folio of the family group, the paper foxed and cracked with age",
        caption: "The family group on paper, foxed and cracked",
        note: "Painted for a household rather than a temple, and kept until the paper gave out. Most of what Bengal made for its own walls has not survived, which is why the printed versions dominate the record.",
      },
      {
        src: "/media/art/durga-arch-teal.jpg",
        alt: "An ornate painted ek-chala with smaller figures set into the arch",
        caption: "An arch carrying its own register of smaller figures",
        note: "The chalchitra is not decoration. It is where the rest of the story goes, in horizontal registers, so that a single frame can hold more than the five figures standing in front of it.",
      },
      {
        src: "/media/art/durga-oleograph.jpg",
        alt: "A printed lithograph of the whole family group under a painted arch",
        caption: "The family group under a single arch, printed",
        note: "This is the arrangement Bengal settles on and then argues about for four hundred years. One arch, one frame, the whole family in a single piece, with Ganesha and Kartikeya at her feet and the demon under the lion.",
      },
    ],
  },
  {
    era: "Colonial",
    bangla: "ঔপনিবেশিক",
    span: "1757, 1900",
    title: "The Puja becomes a party, then a subscription",
    prose: [
      "In eighteenth-century Calcutta the Puja turned into the chief instrument of social competition among the new Bengali merchant elite. Households hired nautch troupes, laid on English food and drink, and invited Company officials. The story that Robert Clive attended Nabakrishna Deb's Puja in 1757 is repeated everywhere and rests on almost nothing, Deb became Clive's munshi after the battle, and the evidence is a single anonymous painting. The other thing everybody repeats is that by 1840 the Company had forbidden its own servants to attend. No such order exists. What exists for 1840 is a hostile column in the Bengal Hurkaru of 7 October, and Europeans were still going in 1855. Official unease is real and datable, the 1833 despatch, the Lords debating idolatry in August 1840, the order of March 1841 pulling troops and gun salutes out of Hindu festivals. A newspaper campaign has been promoted into a prohibition.",
      "The scale was industrial. By 1839 Calcutta was producing something in the order of seven thousand idols a year. The lion beneath the goddess had a horse's face for most of this period, because the artisans making it had never seen a lion; the face changed only after real lions reached the Calcutta zoo in the 1880s.",
      "Then the money democratised, and here the familiar story needs handling with tongs. Twelve men of Guptipara in Hooghly, shut out of a household Puja, raised a subscription and ran their own; baro plus yaar gives baroyari, the word that still means community Puja. Tapati Guha-Thakurta, who recounts it, hedges every clause of it and gives no firmer date than the end of the eighteenth century. Rachel Fell McDermott adds the detail nobody quotes: the first recorded baroiyari was to Jagaddhatri, not to Durga. And the cause was fiscal rather than democratic. The Permanent Settlement of 1793 left zamindars unable to collect from their own tenants, and the subscription Puja is what the collapse of that patronage produced. The best documented case is not Guptipara but Bankura in 1793, where people of all castes applied to the East India Company for permission to raise money and hold one.",
      "Not everyone approved. Debendranath Tagore abolished Durga Puja at Jorasanko on Brahmo principle, which is why the most famous Bengali family of the century kept no idol.",
    ],
    image: {
      src: "/media/art/company-school-durbar.jpg",
      alt: "A Company-school watercolour of a household Puja with a nautch performance",
      caption: "A thakurdalan during Puja, Company school watercolour",
    },
    plates: [
      {
        src: "/media/art/thakur-dalan-photograph.jpg",
        alt: "A photograph of a household Puja in a thakur dalan, late nineteenth or early twentieth century",
        caption: "A household Puja in its thakur dalan, late nineteenth or early twentieth century",
        note: "A photograph rather than a painting, and the difference shows. Priests, family and servants stand where they stood, the ekchala fills the whole arch of the hall, and nobody is posing for posterity. This is what the paintings on either side of it were describing.",
      },
      {
        src: "/media/art/thakur-dalan-priests.jpg",
        alt: "Priests at work in a pillared thakur dalan during the Puja",
        caption: "Priests in the thakur dalan, the hall a Bengali house kept for this",
        note: "A household that could afford a Puja built a room for it and used that room five days a year. The architecture is the clearest surviving evidence of how much the festival mattered to the people paying for it.",
      },
      {
        src: "/media/art/puja-gathering-archival.jpg",
        alt: "A household Puja photographed with the whole assembly present",
        caption: "The whole assembly, photographed",
        note: "Everyone in the frame knew they were being photographed, which in the 1800s meant standing still for a long time. Nobody is worshipping in this picture. They are being counted.",
      },
      {
        src: "/media/art/durga-ivory-murshidabad.jpg",
        alt: "A ten-armed Mahishasuramardini Durga carved in ivory, Murshidabad, late nineteenth century",
        caption: "Ten-armed Mahishasuramardini, ivory, Murshidabad, late nineteenth century",
        note: "Murshidabad's ivory carvers worked for the same patrons who were hiring the nautch troupes. A goddess made of clay for the courtyard, and the same goddess in ivory for the drawing room, at a scale that could be given as a gift.",
      },
    ],
  },
  {
    era: "Modern",
    bangla: "আধুনিক",
    span: "1900, 1990",
    title: "Everyone's goddess, and a voice on the radio",
    prose: [
      "The baroyari Puja became the sarbojanin, of all people, in the first decades of the twentieth century. Bhowanipore's Sanatan Dharmotsahini Sabha ran a subscription Puja from 1909 or 1910, and Baghbazar, founded in 1918 or 1919, is the one usually credited with fixing the modern civic form. It was founded against the exclusiveness of the old family Pujas rather than against the British, and Guha-Thakurta dates its nationalist fame to 1937, when a swadeshi fair and a display of Bengali wrestling were held beside it. The word sarbojanin arrives in 1926, and its documented motive is not anti-colonial either: Hindu leaders wanted celebrations open to every caste, in answer both to Gandhi on untouchability and to a perceived Muslim threat. The Ananda Bazar Patrika of 19 October 1926 recorded the immediate cost, that Muslims who had joined the celebrations for five or six hundred years were no longer doing so. The nationalist phase was real, brief, and confined to a handful of north Calcutta Pujas between about 1926 and 1939.",
      "By the popular account, Mahishasuramardini was first broadcast before dawn on Mahalaya in 1931, with Birendra Krishna Bhadra reciting the Chandi, though the year is disputed and the broadcaster was not yet called All India Radio. It has opened the season almost every year since. In 1976 the station replaced it with a new production fronted by the film star Uttam Kumar. Listeners were so angry that AIR offices were stoned, and the original recording was restored within the same season.",
      "Craft changed under pressure. A fire in Kumartuli in the late 1930s destroyed the workshops days before the Puja, and Gopeshwar Pal rebuilt by breaking the single ekchala frame into separate figures that could be made fast and in parallel. The split family group that now looks traditional was an emergency measure.",
    ],
    image: {
      src: "/media/art/nandalal-bose-durga.jpg",
      alt: "Nandalal Bose's Durga, painted in the mid-1940s",
      caption: "Nandalal Bose, Durga, mid-1940s",
    },
    plates: [
      {
        src: "/media/art/pratima-priests-archival.jpg",
        alt: "An ek-chala pratima with its priests, early twentieth century",
        caption: "An ek-chala and its priests, early twentieth century",
        note: "Still one frame, still one arch, and the split into separate figures that now looks traditional is still ahead of it.",
      },
      {
        src: "/media/art/daker-saj-archival.jpg",
        alt: "Daker saj photographed under working light",
        caption: "Daker saj under whatever light there was",
        note: "Beaten foil photographs badly and looks extraordinary in a lamplit pandal, which is a good part of why it was worth posting in from Germany.",
      },
      {
        src: "/media/art/durga-tiger-modern.jpg",
        alt: "A twentieth-century painted Durga whose mount is a tiger",
        caption: "A twentieth-century Durga, mounted on a tiger",
        note: "The mount is a tiger here rather than a lion. Both appear across Bengal, and artisans who had seen neither animal drew whichever the workshop had drawn last.",
      },
      {
        src: "/media/art/pratima-crowd-archival.jpg",
        alt: "The pratima in its arch with a crowd pressed to the rail",
        caption: "The crowd at the rail",
        note: "The sarbojanin in practice: not a courtyard with invited guests but a rail, and everybody behind it.",
      },
    ],
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
      "A local footnote, and not a small one. Bengaluru's first Sarbojanin Durga Puja was held in 1950, and the Bengalee Association's own history records that it took place under the initiative and tutelage of a few professors of the Indian Institute of Science. The association itself was registered nine years later, in 1959. The Puja on this campus is three years old. The Puja that came out of this campus is seventy six.",
    ],
    image: {
      src: "/media/puja/archive-1.jpg",
      alt: "The idol at a recent IISc Sharodiya Durgotsab",
      caption: "The goddess in daker saj, IISc campus",
    },
    plates: [
      {
        src: "/media/art/ekchala-daker-saj.jpg",
        alt: "An ek-chala pratima under an arch of beaten silver foil and coloured pith",
        caption: "Ek-chala under daker saj, the ornament posted in from Germany",
        note: "Daker saj is named for the post. The beaten foil arrived by mail from Germany in the nineteenth century and the name stuck to the technique long after the supply moved to Bengal. The arch is not decoration, it is the frame that makes the family one object.",
      },
    ],
  },
];

export default function ItihashPage() {
  return (
    <>
      <Section className="pt-[7.5rem] sm:pt-[9rem]">
        <Container>
          <SectionHeading
            as="h1"
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
                <Reveal>
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
                    <figure className="mt-8">
                      <Parallax depth={26} className="relative aspect-[4/5] w-full overflow-hidden">
                        <Image
                          src={block.image.src}
                          alt={block.image.alt}
                          fill
                          sizes="30vw"
                          className="sepia-plate object-cover"
                        />
                      </Parallax>
                      <figcaption className="mt-2 text-[0.65rem] uppercase tracking-[0.18em] text-ink-faint">
                        {block.image.caption}
                      </figcaption>
                    </figure>
                  )}

                  {/* Every picture for this era, in the left column.
                      The right column is text and only text, so a
                      laptop reader's eye has one place to look for
                      each. On a phone they simply stack. */}
                  {block.plates && (
                    <Stagger className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-1">
                      {block.plates.map((pl) => (
                        <StaggerItem key={pl.src}>
                          <figure className="group h-full">
                            <div className="relative aspect-[4/5] w-full overflow-hidden border border-line bg-ink">
                              <Image
                                src={pl.src}
                                alt={pl.alt}
                                fill
                                sizes="(max-width: 1024px) 50vw, 30vw"
                                className="sepia-plate object-cover transition-transform duration-[1600ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
                              />
                            </div>
                            <figcaption className="mt-2.5">
                              <span className="block text-[0.68rem] uppercase tracking-[0.16em] text-gold">
                                {pl.caption}
                              </span>
                              {pl.note && (
                                <span className="mt-1.5 block text-[0.8rem] leading-relaxed text-ink-soft">
                                  {pl.note}
                                </span>
                              )}
                            </figcaption>
                          </figure>
                        </StaggerItem>
                      ))}
                    </Stagger>
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
                  competition in 1971. His Bengali lettering was brushwork, a
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
                  reproduction. None of Ray&apos;s own typefaces are freely
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

      {/* ---------------- the chapter of its own ---------------- */}
      <Section className="bg-paper-2/40">
        <Container>
          <Reveal>
            <Link
              href="/itihash/biplob"
              className="group grid gap-[2.618rem] border border-line bg-paper p-7 transition-colors hover:border-gold sm:p-[2.618rem] lg:grid-cols-[1.618fr_1fr] lg:items-center"
            >
              <div>
                <p className="eyebrow">একটি অধ্যায় A chapter of its own</p>
                <h2 className="bangla-display mt-3 text-[1.618rem] leading-tight text-sindoor sm:text-[2.058rem]">
                  পুজো ও বিপ্লব
                </h2>
                <p className="font-display mt-1 text-[1.272rem] text-ink transition-colors group-hover:text-sindoor">
                  The Puja and the revolutionaries
                </p>
                <p className="lede mt-5 text-[0.95rem]">
                  Bankim and Bande Mataram, the Swadeshi boycott fought over
                  the tinsel on the idols, oaths sworn before a goddess with a
                  sword on the head, Netaji as a Puja secretary, and the women
                  the Shakti idiom was used about and by. Ten sections, each
                  marked with how well it is evidenced, because the story is
                  told everywhere and sourced almost nowhere.
                </p>
              </div>
              <p className="border-l-2 border-gold/50 pl-5 text-[0.85rem] leading-relaxed text-ink-soft">
                Researched from the Sedition Committee Report of 1918, J. C.
                Ker&apos;s intelligence volumes, the Parliamentary Return of
                1849 and Kalpana Datta&apos;s own memoir. What the documents
                say is stranger than the legend, and in places contradicts it.
              </p>
            </Link>
          </Reveal>
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
                because no reliable source supports them. Three of them had to
                be taken off this page after it was first written. Clive at
                Shobhabazar in 1757 rests on a single anonymous painting. The
                Company order of 1840 forbidding Europeans to attend has never
                been produced by anyone, and the thing that actually happened in
                October 1840 was a newspaper column. And four Bengali scientists
                are named in every account of this campus and never worked here;
                the real link is Jnan Chandra Ghosh, Director from August 1939 to December 1948.
              </p>
              <p className="lede mt-3 max-w-[68ch] text-[0.92rem]">
                One more thing is worth saying plainly, because it cuts against
                what this festival likes to believe about itself. The evidence
                that the community Puja was a vehicle of the freedom movement is
                thinner than its retelling. The colonial intelligence files
                watched Shivaji, Ganpati, Birashtami and Kali, and Rachel Fell
                McDermott finds that the organisations which condoned violence
                worked through Kali rather than her sister. Much of the
                scholarly authority for the nationalist story traces back, in
                the footnotes of the scholars themselves, to popular trade books
                rather than to archives. Where this page tells that story it
                says who is claiming what.
              </p>
              <p className="lede mt-3 max-w-[68ch] text-[0.92rem]">
                If you can source one of them properly, or you find an error
                here, tell a convenor and it will be corrected.
              </p>
            </div>
          </Reveal>
        </Container>
      </Section>
    </>
  );
}
