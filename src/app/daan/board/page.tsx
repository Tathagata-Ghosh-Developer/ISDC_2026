import type { Metadata } from "next";
import Link from "next/link";
import { Container, Section, SectionHeading } from "@/components/Section";
import Reveal from "@/components/Reveal";
import Leaderboard from "@/components/Leaderboard";
import { getBoard } from "@/lib/db";

export const metadata: Metadata = {
  // Named people, exact amounts, a religious festival, an institute
  // domain, and no opt-out. Whatever the argument for publishing it to
  // anyone who visits, there is none for publishing it to Google for
  // ever. Anybody who wants to check the accounts can open the page.
  robots: { index: false, follow: false },
  title: "Donation Board",
  description:
    "Everyone who has given to the IISc Sharodiya Durgotsab, by name, on one public board.",
};

export const revalidate = 60;

export default async function BoardPage() {
  const board = await getBoard();

  return (
    <>
      <Section className="pt-[7.5rem] sm:pt-[9rem]">
        <Container>
          <SectionHeading
            as="h1"
            eyebrow="দানপত্র The board"
            title="Everyone who gave"
            bangla="দাতাদের নাম"
            lede="Students, faculty, post-docs, alumni and well-wishers on one list, ranked by what they gave. A name appears here once the treasurer has matched the payment against the bank statement."
          />
        </Container>
      </Section>

      <Section className="!pt-0">
        <Container>
          <div className="grid gap-[2.618rem] lg:grid-cols-[1.618fr_1fr] lg:items-start">
            <div>
              <Leaderboard entries={board.entries} />

              {!board.ready && (
                <Reveal className="mt-8">
                  <p className="surface p-6 text-[0.88rem] leading-relaxed text-ink-soft">
                    The board is not connected yet. Nothing here is a sample or
                    a placeholder figure. It fills with real names the moment
                    the committee links the database, and not before.
                  </p>
                </Reveal>
              )}
            </div>

            <div className="space-y-5 lg:sticky lg:top-24">
              <Reveal>
                <div className="surface p-6">
                  <h2 className="eyebrow">How a name gets here</h2>
                  <ol className="mt-5 space-y-4">
                    {[
                      {
                        n: "01",
                        t: "You transfer, or hand cash to a volunteer",
                        d: "Straight into the committee account. No gateway sits in the middle taking a cut.",
                      },
                      {
                        n: "02",
                        t: "The treasurer matches it to the statement",
                        d: "Usually within a day. A transaction reference makes it immediate.",
                      },
                      {
                        n: "03",
                        t: "A numbered receipt is issued",
                        d: "Receipt numbers run in an unbroken sequence and reach your WhatsApp.",
                      },
                      {
                        n: "04",
                        t: "Your name goes up",
                        d: "Everyone who gives is on this board, by name and amount. There is no opting out of a public account.",
                      },
                    ].map((s) => (
                      <li key={s.n} className="flex gap-4">
                        <span className="font-display shrink-0 text-[1.272rem] text-gold">
                          {s.n}
                        </span>
                        <span>
                          <span className="block text-[0.88rem] text-ink">
                            {s.t}
                          </span>
                          <span className="mt-0.5 block text-[0.78rem] text-ink-faint">
                            {s.d}
                          </span>
                        </span>
                      </li>
                    ))}
                  </ol>
                  <Link href="/daan" className="btn btn-primary mt-7 w-full">
                    Add your name
                  </Link>
                </div>
              </Reveal>

              <Reveal delay={0.08}>
                <div className="surface p-6">
                  <h2 className="eyebrow">If something looks wrong</h2>
                  <p className="mt-4 text-[0.82rem] leading-relaxed text-ink-soft">
                    A spelling, an amount, a missing entry. Message a convenor
                    and it gets corrected in public rather than quietly. Nothing
                    on this board is removed without a note.
                  </p>
                  <Link
                    href="/thikana#committee"
                    className="btn btn-ghost mt-6 w-full"
                  >
                    Reach the committee
                  </Link>
                </div>
              </Reveal>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
