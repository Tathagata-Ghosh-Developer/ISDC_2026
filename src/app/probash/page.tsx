import type { Metadata } from "next";
import { ArrowUpRight, PenLine, Palette } from "lucide-react";
import { Container, Section, SectionHeading } from "@/components/Section";
import Reveal from "@/components/Reveal";
import { getConfig } from "@/lib/config";

export const metadata: Metadata = {
  title: "Probash",
  description:
    "Probash, the annual magazine of the IISc Sharodiya Durgotsab. Submissions for writing, art and the cover competition are open.",
};

export const revalidate = 600;

export default async function ProbashPage() {
  const config = await getConfig();

  return (
    <>
      <Section className="pt-[7.5rem] sm:pt-[9rem]">
        <Container>
          <div className="grid gap-[2.618rem] lg:grid-cols-[1.618fr_1fr] lg:items-end">
            <Reveal>
              <p className="eyebrow">প্রবাস The magazine</p>
              <h1 className="bangla-display mt-4 text-[3.33rem] leading-tight text-ink sm:text-[4.236rem]">
                প্রবাস
              </h1>
              <p className="font-display mt-2 text-[1.618rem] font-normal italic text-ink-soft">
                Probash
              </p>
              <p className="lede mt-6 max-w-[56ch]">
                The word means living away from home. Bengali has carried it for
                centuries as something closer to a condition than a location:
                the state of being elsewhere while the festival happens without
                you. This magazine is what the condition produces.
              </p>
              <p className="lede mt-4 max-w-[56ch]">
                Writing, poetry, photographs, illustration, recipes, arguments,
                and the sort of half-remembered childhood detail that only
                surfaces in October. In Bengali, in English, in both at once.
              </p>
            </Reveal>

            <Reveal delay={0.12}>
              <blockquote className="border-l-2 border-gold pl-6">
                <p className="bangla text-[1.272rem] leading-loose text-ink">
                  পুজো মানে ঘর, ঘরের আরেক রূপ। অচেনা মুখগুলোর মধ্যেও নিজের
                  মানুষকে খুঁজে নেওয়া।
                </p>
                <footer className="mt-4 text-[0.75rem] uppercase tracking-[0.2em] text-ink-faint">
                  Pujo means home, in another form
                </footer>
              </blockquote>
            </Reveal>
          </div>
        </Container>
      </Section>

      <Section className="!pt-[2.618rem]">
        <Container>
          <div className="grid gap-4 md:grid-cols-2">
            <SubmitCard
              Icon={PenLine}
              eyebrow="Open now"
              title="Send us something to publish"
              bangla="লেখা পাঠাও"
              href={config.links.magazineSubmission}
              body="Prose, poetry, memoir, photo essays, illustration, translation. There is no house style and no word limit worth arguing about. Bengali and English are equally welcome, and so is the mixture most of us actually speak."
              points={[
                "Original work only, and tell us if it has appeared elsewhere",
                "Bengali submissions in Unicode, not as images, so we can typeset them",
                "Photographs at the largest size you have",
              ]}
            />
            <SubmitCard
              Icon={Palette}
              eyebrow="Competition"
              title="Design the cover"
              bangla="প্রচ্ছদ প্রতিযোগিতা"
              href={config.links.coverCompetition}
              body="One cover is chosen for the printed magazine and credited on it. Any medium: painting, digital illustration, photography, collage, alpona, linocut. The only constraint is that it should survive being printed at magazine size."
              points={[
                "Portrait orientation, high resolution",
                "Your own work, made for this",
                "The shortlist is shown on Instagram before the final call",
              ]}
            />
          </div>
        </Container>
      </Section>

      <Section className="bg-paper-2/40">
        <Container>
          <SectionHeading
            eyebrow="কেন Why bother"
            title="A Puja magazine is not an afterthought"
            lede="Bengal invented the Sharadiya number, the fat annual literary issue published for the Puja, and it is where a great deal of the language's best writing first appeared. Serialised novels, debut poems, arguments that ran for years. Probash is a very small member of a very old tradition."
          />
          <Reveal className="mt-[2.618rem]">
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                {
                  t: "It outlives the four days",
                  d: "The pandal comes down in a week. The magazine sits on a shelf and gets found again in five years.",
                },
                {
                  t: "It is the only part anyone can keep",
                  d: "Bhog is eaten, the idol goes into the water, the lights come down. Print is the exception.",
                },
                {
                  t: "It is how the quiet people take part",
                  d: "Not everyone wants to carry bamboo or hold a microphone. Some people want to write something down.",
                },
              ].map((c) => (
                <div key={c.t} className="surface p-6">
                  <h3 className="font-display text-[1.1rem] text-ink">{c.t}</h3>
                  <p className="mt-3 text-[0.85rem] leading-relaxed text-ink-soft">
                    {c.d}
                  </p>
                </div>
              ))}
            </div>
          </Reveal>
        </Container>
      </Section>
    </>
  );
}

function SubmitCard({
  Icon,
  eyebrow,
  title,
  bangla,
  body,
  points,
  href,
}: {
  Icon: React.ComponentType<{ size?: number; className?: string }>;
  eyebrow: string;
  title: string;
  bangla: string;
  body: string;
  points: string[];
  href: string;
}) {
  return (
    <Reveal>
      <div className="surface flex h-full flex-col p-6 sm:p-8">
        <div className="flex items-center gap-3">
          <Icon size={18} className="text-gold" />
          <span className="text-[0.6rem] uppercase tracking-[0.24em] text-gold">
            {eyebrow}
          </span>
        </div>
        <h2 className="font-display mt-5 text-[1.618rem] font-normal leading-snug text-ink">
          {title}
        </h2>
        <p className="bangla-display mt-1 text-[1.2rem] text-sindoor">{bangla}</p>
        <p className="mt-4 text-[0.88rem] leading-relaxed text-ink-soft">{body}</p>
        <ul className="mt-5 space-y-2">
          {points.map((p) => (
            <li
              key={p}
              className="flex gap-2.5 text-[0.8rem] leading-relaxed text-ink-soft"
            >
              <span className="mt-1.5 h-1 w-1 shrink-0 rotate-45 bg-gold" />
              {p}
            </li>
          ))}
        </ul>
        <a
          href={href}
          target="_blank"
          rel="noreferrer noopener"
          className="btn btn-primary mt-auto pt-3 !mt-8"
        >
          Open the form <ArrowUpRight size={14} />
        </a>
      </div>
    </Reveal>
  );
}
