import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Container, Section, SectionHeading } from "@/components/Section";
import Reveal from "@/components/Reveal";
import EnquiryForm from "@/components/EnquiryForm";
import PrintButton from "@/components/PrintButton";
import {
  SITE,
  SPONSOR_TIERS,
  SPONSOR_CONTACT,
  PUJA_DATES,
  COMMITTEE,
} from "@/lib/site";
import { IISC_FIGURES } from "@/lib/content/neighbours";
import { formatINR } from "@/lib/format";

export const metadata: Metadata = {
  title: "Sponsorship proposal",
  description:
    "The full sponsorship proposal for the IISc Sharodiya Durgotsab 2026: who comes, what a sponsor receives at each level, what we will not do, and the terms we work under.",
};

export const revalidate = 3600;

/* ================================================================
   The deck, as a page.

   A PDF is a file somebody has to download, cannot search, and reads
   badly on the phone most people will open it on. Everything the
   proposal document said is here instead, in the open, where it can
   be linked to a single clause and where the terms are as easy to
   read as the benefits. The PDF is still there for anyone who needs
   one for a procurement file.
   ================================================================ */

const REACH = [
  {
    figure: "5,621",
    label: "students on roll at IISc",
    note: "Annual Report 2024-25. Around half are doctoral, which means a population that stays on campus for years rather than months.",
  },
  {
    figure: "~4,000",
    label: "visitors across the five days",
    note: "Committee's own count from 2025: students, faculty, families, and a steady stream from the institutes around the campus.",
  },
  {
    figure: "14",
    label: "research institutes within eight kilometres",
    note: "NCBS, JNCASR, ICTS, RRI, IIA, ISI Bangalore, URSC and others. Their Bengali staff and students have come to this Puja for years.",
  },
  {
    figure: "5",
    label: "days, from Shashthi to Dashami",
    note: "Continuous footfall from morning arati to the cultural programme each night, with the heaviest evenings on Ashtami and Navami.",
  },
];

const NOT_DOING = [
  "We do not sell the deity, the rituals or the priest's time. Nothing is branded inside the sanctum.",
  "We do not share a visitor's phone number, email or any personal detail with a sponsor, ever, for any sum.",
  "We do not take sponsorship from tobacco, alcohol, betting, real-money gaming or unregulated lending.",
  "We do not claim to represent the Indian Institute of Science. We are a registered student committee of it, and a sponsorship here is not an endorsement by the Institute.",
  "We do not promise a guaranteed number of footfalls, impressions or leads, because we cannot measure them honestly and will not invent a figure.",
];

const MOU_CLAUSES = [
  {
    n: "1",
    head: "The parties",
    body: "This note records what was agreed between the IISc Sharodiya Durgotsab Committee, a registered student committee of the Indian Institute of Science, Bengaluru 560012, and the sponsor named above. It is a record of a mutual understanding, and neither party intends it to create a partnership, an agency or a joint venture.",
  },
  {
    n: "2",
    head: "What the sponsor gives",
    body: "The amount named above, paid by transfer to the committee's account before the first day of the festival, or goods and services of an agreed equivalent value delivered by a date both sides write in. The committee issues a numbered receipt for every rupee received, from the same unbroken sequence used for every other donation.",
  },
  {
    n: "3",
    head: "What the committee gives",
    body: "The entitlements listed for the agreed level, set out in full on this page, delivered across all five days of the festival. Where a bespoke arrangement replaces a listed level, the substitute entitlements are written out in an annexure and replace the list entirely rather than adding to it.",
  },
  {
    n: "4",
    head: "Artwork and approvals",
    body: "The sponsor supplies print-ready artwork by a date agreed in writing, and warrants that it owns or is licensed to use everything in it. The committee places that artwork as described and will not alter it beyond resizing. The committee may decline artwork that is unlawful, that disparages any community, or that would be out of place at a religious festival attended by children, and will say why in writing.",
  },
  {
    n: "5",
    head: "The Institute's name and marks",
    body: "Neither party may use the name, crest or marks of the Indian Institute of Science in its own publicity without the Institute's own written permission. The sponsor may state truthfully that it sponsored the IISc Sharodiya Durgotsab 2026. It may not state or imply that IISc endorses it, its goods or its services.",
  },
  {
    n: "6",
    head: "Personal data",
    body: "The committee collects personal data from donors and volunteers and does not pass any of it to a sponsor. A sponsor collecting data at its own stall does so as the data fiduciary for that data under the Digital Personal Data Protection Act 2023, must give its own notice and take its own consent, and indemnifies the committee against any claim arising from how it does so.",
  },
  {
    n: "7",
    head: "If the festival cannot be held",
    body: "If the festival is cancelled or materially curtailed by something outside either party's control, including an order of the Institute, of the state, or a public health restriction, the committee will either carry the sponsorship forward to the following year or refund the unspent balance, at the sponsor's choice. The committee will say which costs were already committed, with bills.",
  },
  {
    n: "8",
    head: "Accounts",
    body: "The committee publishes every donation it receives, by name and amount, on its public board, and publishes its expenditure alongside. A sponsor's contribution appears there in the same way as everyone else's. Anyone may tally the board against the committee's bank statement, which is the entire point of publishing it.",
  },
  {
    n: "9",
    head: "Ending it",
    body: "Either side may withdraw in writing up to thirty days before the first day of the festival. Money already spent on the sponsor's behalf, with bills produced, is deducted and the balance returned. After that date the committee has already committed the spend and cannot refund it, which is worth knowing before a signature.",
  },
  {
    n: "10",
    head: "Governing law",
    body: "Indian law applies and the courts at Bengaluru have jurisdiction. Before either party goes near a court, both agree to sit down once, in person, with the faculty advisor present.",
  },
];

export default function SponsorshipProposalPage() {
  const festival = new Date(PUJA_DATES.shashthi).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });

  const treasurers = COMMITTEE.filter((m) => m.role === "Treasurer");

  return (
    <>
      <Section className="pt-[7.5rem] sm:pt-[9rem]">
        <Container>
          <Link
            href="/sponsors"
            className="mb-6 inline-flex items-center gap-2 text-[0.7rem] uppercase tracking-[0.18em] text-ink-faint transition-colors hover:text-gold"
          >
            <ArrowLeft size={13} /> Sponsors
          </Link>

          <SectionHeading
            eyebrow="প্রস্তাব The proposal"
            title="What we are asking for, and what you get for it"
            bangla="স্পষ্ট কথা"
            lede="This is the whole proposal, terms included, on one page rather than in an attachment. Read the part about what we will not do before the part about what we will. It is shorter, and it is the part that tells you who you would be working with."
          />

          <div className="mt-7 flex flex-wrap gap-3">
            <PrintButton label="Print this proposal" />
            <a
              href={SPONSOR_CONTACT.deck}
              className="btn btn-ghost"
              target="_blank"
              rel="noreferrer noopener"
            >
              The one-page PDF
            </a>
            <a href="#talk" className="btn btn-primary">
              Talk to us
            </a>
          </div>
        </Container>
      </Section>

      {/* ---------------- who comes ---------------- */}
      <Section className="!pt-0">
        <Container>
          <div className="grid gap-px overflow-hidden border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
            {REACH.map((r) => (
              <div key={r.label} className="bg-paper p-6">
                <span className="font-display block text-[1.618rem] font-normal leading-none tabular-nums text-sindoor">
                  {r.figure}
                </span>
                <span className="mt-2 block text-[0.8rem] text-ink">
                  {r.label}
                </span>
                <span className="mt-2 block text-[0.72rem] leading-relaxed text-ink-faint">
                  {r.note}
                </span>
              </div>
            ))}
          </div>

          <p className="mt-5 max-w-[78ch] text-[0.8rem] leading-relaxed text-ink-soft">
            The Institute itself is the reason those numbers are worth
            something. It was ranked first among Indian universities in the
            NIRF 2026 rankings and second overall, and it is the
            highest-placed Indian institution in the Times Higher Education
            World University Rankings 2026. The audience on that ground is
            researchers, their families, and the people who run the laboratories
            around them. It is small, and it is not an audience most campaigns
            reach.
          </p>
        </Container>
      </Section>

      {/* ---------------- what we will not do ---------------- */}
      <Section className="bg-paper-2/40">
        <Container>
          <div className="grid gap-[2.618rem] lg:grid-cols-[1fr_1.618fr]">
            <Reveal>
              <h2 className="font-display text-[1.618rem] font-normal leading-tight text-ink">
                What we will not do
              </h2>
              <p className="bangla-display mt-2 text-[1.15rem] text-gold">
                যা আমরা করব না
              </p>
              <p className="mt-5 text-[0.85rem] leading-relaxed text-ink-soft">
                Every sponsorship deck lists what you get. Almost none of them
                lists what the organisers have already decided is not for sale.
                Ours does, because those lines are where a partnership actually
                goes wrong, and it is better to find out now.
              </p>
            </Reveal>

            <Reveal delay={0.1}>
              <ul className="space-y-4">
                {NOT_DOING.map((line, i) => (
                  <li key={i} className="flex gap-4">
                    <span className="font-display shrink-0 text-[1.1rem] text-sindoor">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="text-[0.88rem] leading-relaxed text-ink-soft">
                      {line}
                    </span>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </Container>
      </Section>

      {/* ---------------- the levels ---------------- */}
      <Section>
        <Container>
          <SectionHeading
            eyebrow="স্তর The levels"
            title="Six levels, and none of them fixed"
            lede="Take one as written, or take the parts of it you want and tell us what the rest should be. We would rather build something that suits you than sell you a tier you half need."
          />

          <div className="mt-[2.618rem] space-y-px bg-line">
            {SPONSOR_TIERS.map((t, i) => (
              <Reveal key={t.id}>
                <article className="grid gap-6 bg-paper p-6 md:grid-cols-[1fr_1.618fr] md:p-8">
                  <div>
                    <div className="flex items-baseline gap-3">
                      <span className="font-display text-[0.8rem] text-gold">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <h3 className="font-display text-[1.272rem] text-ink">
                        {t.name}
                      </h3>
                    </div>
                    <p className="bangla-display mt-1 text-[1.15rem] text-gold">
                      {t.bangla}
                    </p>
                    <p className="font-display mt-3 text-[1.618rem] tabular-nums text-sindoor">
                      {formatINR(t.amount)}
                    </p>
                    <p className="mt-2 text-[0.8rem] leading-relaxed text-ink-soft">
                      {t.headline}
                    </p>
                  </div>

                  <ul className="space-y-2 border-t border-line pt-5 md:border-l md:border-t-0 md:pl-8 md:pt-0">
                    {t.benefits.map((b) => (
                      <li
                        key={b}
                        className="flex gap-3 text-[0.84rem] leading-relaxed text-ink-soft"
                      >
                        <span className="mt-[0.55em] h-1 w-1 shrink-0 rounded-full bg-gold" />
                        {b}
                      </li>
                    ))}
                  </ul>
                </article>
              </Reveal>
            ))}
          </div>

          <Reveal>
            <div className="surface mt-6 p-6">
              <h3 className="eyebrow">Arrangements that are not on the list</h3>
              <div className="mt-3 grid gap-4 text-[0.84rem] leading-relaxed text-ink-soft sm:grid-cols-2">
                <p>
                  <span className="text-ink">In kind.</span> Printing, sound,
                  lighting, transport, food, chairs, a generator. Valued at what
                  it would have cost us and receipted the same way. Several of
                  our best arrangements have involved no money at all.
                </p>
                <p>
                  <span className="text-ink">One thing, done well.</span> The
                  bhog for one day. The children&apos;s competition. The whole
                  cultural evening on Navami. Named for you, and nothing else
                  asked of you.
                </p>
                <p>
                  <span className="text-ink">The souvenir.</span> Probash goes
                  to several hundred households and stays on shelves for
                  decades. A full page in it outlasts every banner on the
                  ground.
                </p>
                <p>
                  <span className="text-ink">Recruitment.</span> The honest
                  reason many firms come. Tell us plainly and we will arrange a
                  table and an introduction rather than pretend it is about
                  branding.
                </p>
              </div>
            </div>
          </Reveal>
        </Container>
      </Section>

      {/* ---------------- the MOU ---------------- */}
      <Section className="bg-paper-2/40">
        <Container>
          <SectionHeading
            eyebrow="সমঝোতা The terms"
            title="A memorandum of understanding, in advance"
            lede="This is the note we will send once something is agreed, filled in with your name and the amount. It is here first so that nobody discovers a clause after signing. If a line does not work for you, say so now and we will change it or explain why we cannot."
          />

          <Reveal>
            <div className="surface mt-[2.618rem] p-7 sm:p-10">
              <header className="border-b border-line pb-6 text-center">
                <p className="text-[0.6rem] uppercase tracking-[0.24em] text-gold">
                  Draft for discussion
                </p>
                <h3 className="font-display mt-3 text-[1.272rem] text-ink">
                  Memorandum of Understanding
                </h3>
                <p className="mt-1 text-[0.82rem] text-ink-soft">
                  {SITE.name} {SITE.year}, held at {SITE.venue.split(",")[0]}{" "}
                  from {festival}
                </p>
              </header>

              <div className="mt-7 grid gap-4 border-b border-line pb-6 text-[0.82rem] sm:grid-cols-3">
                {[
                  ["Sponsor", "name of the organisation"],
                  ["Level or arrangement", "as agreed"],
                  ["Amount or value", "in rupees"],
                ].map(([k, v]) => (
                  <div key={k}>
                    <span className="block text-[0.58rem] uppercase tracking-[0.2em] text-ink-faint">
                      {k}
                    </span>
                    <span className="mt-2 block border-b border-dotted border-line pb-1 italic text-ink-faint">
                      {v}
                    </span>
                  </div>
                ))}
              </div>

              <ol className="mt-7 space-y-6">
                {MOU_CLAUSES.map((c) => (
                  <li key={c.n} className="grid gap-3 sm:grid-cols-[2.5rem_1fr]">
                    <span className="font-display text-[1.05rem] text-gold">
                      {c.n}
                    </span>
                    <div>
                      <h4 className="text-[0.92rem] text-ink">{c.head}</h4>
                      <p className="mt-1.5 text-[0.84rem] leading-relaxed text-ink-soft">
                        {c.body}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>

              <div className="mt-10 grid gap-8 border-t border-line pt-8 sm:grid-cols-2">
                <div>
                  <span className="block h-10 border-b border-line" />
                  <span className="mt-2 block text-[0.62rem] uppercase tracking-[0.18em] text-ink-faint">
                    For the sponsor
                  </span>
                </div>
                <div>
                  <span className="block h-10 border-b border-line" />
                  <span className="mt-2 block text-[0.62rem] uppercase tracking-[0.18em] text-ink-faint">
                    For the committee
                    {treasurers.length > 0 && (
                      <>
                        {" "}
                        · {treasurers.map((t) => t.name).join(" or ")}, Treasurer
                      </>
                    )}
                  </span>
                </div>
              </div>

              <p className="mt-8 text-[0.7rem] leading-relaxed text-ink-faint">
                This draft is written to be read rather than to be won with. It
                is not legal advice, and a sponsor with a legal team should send
                it to them. If your own template is better, send it and we will
                read it properly.
              </p>
            </div>
          </Reveal>
        </Container>
      </Section>

      {/* ---------------- where the money goes ---------------- */}
      <Section>
        <Container>
          <div className="grid gap-[2.618rem] lg:grid-cols-2">
            <Reveal>
              <h2 className="font-display text-[1.618rem] font-normal text-ink">
                Where the money actually goes
              </h2>
              <p className="lede mt-4 text-[0.95rem]">
                The idol and its transport from Kumartuli. The pandal, the
                decorator and the lights. The priest and the ritual materials.
                Bhog for five days, which is the single largest line and the one
                nobody should ever have to pay for. The stage, the sound and the
                artists. Printing Probash.
              </p>
              <p className="lede mt-4 text-[0.95rem]">
                Every rupee of it is published as it is spent, next to every
                rupee that came in, on a board anybody can check against the
                bank statement. There is no payment gateway taking a cut, and
                there is no total shown on the public board because the
                committee would rather be checked line by line than trusted in
                aggregate.
              </p>
              <Link href="/daan/board" className="btn btn-ghost mt-7">
                The donation board
              </Link>
            </Reveal>

            <Reveal delay={0.1}>
              <div className="surface p-6">
                <h3 className="eyebrow">The Institute, in figures</h3>
                <dl className="mt-4 space-y-4">
                  {IISC_FIGURES.slice(0, 5).map((f) => (
                    <div key={f.label}>
                      <dt className="text-[0.62rem] uppercase tracking-[0.18em] text-ink-faint">
                        {f.label}
                      </dt>
                      <dd className="mt-0.5 text-[0.88rem] leading-relaxed text-ink">
                        {f.value}
                        <span className="ml-2 text-[0.7rem] text-ink-faint">
                          {f.year}
                        </span>
                      </dd>
                    </div>
                  ))}
                </dl>
                <p className="mt-5 border-t border-line pt-4 text-[0.7rem] leading-relaxed text-ink-faint">
                  Every figure here is sourced, and the sources are listed on
                  the sponsors page. We removed two claims from an earlier
                  version of this proposal because we could not source them.
                </p>
              </div>
            </Reveal>
          </div>
        </Container>
      </Section>

      {/* ---------------- talk to us ---------------- */}
      <Section id="talk" className="bg-paper-2/40">
        <Container>
          <div className="mx-auto max-w-[44rem]">
            <SectionHeading
              eyebrow="যোগাযোগ Talk to us"
              title="Start with what you want out of it"
              align="center"
              lede="Not which tier. What you actually want out of five days on this campus. It is a faster conversation and it usually ends somewhere better than the list."
            />
            <div className="mt-[2.618rem]">
              <EnquiryForm kind="sponsor" />
            </div>
            <p className="mt-6 text-center text-[0.78rem] leading-relaxed text-ink-faint">
              Or write directly to{" "}
              {SPONSOR_CONTACT.emails.map((e, i) => (
                <span key={e}>
                  {i > 0 && ", "}
                  <a href={`mailto:${e}`} className="text-gold hover:text-sindoor">
                    {e}
                  </a>
                </span>
              ))}
              .
            </p>
          </div>
        </Container>
      </Section>
    </>
  );
}
