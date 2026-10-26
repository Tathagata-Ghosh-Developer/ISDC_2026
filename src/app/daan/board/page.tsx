import type { Metadata } from "next";
import Link from "next/link";
import { Container, Section, SectionHeading } from "@/components/Section";
import Reveal from "@/components/Reveal";
import Leaderboard from "@/components/Leaderboard";
import LiveRefresh from "@/components/LiveRefresh";
import { getBoard } from "@/lib/db";
import { currentSession } from "@/lib/auth";
import { MERCH } from "@/lib/site";

/**
 * Meme Theory's thank-you code for the committee: 20% off, once per
 * person. Shown only to signed-in members, and kept in the environment
 * because the repository is public.
 */
const MEMBER_CODE = process.env.MEMBER_MERCH_CODE?.trim();

export const metadata: Metadata = {
  // Open to everyone again from 27 October 2026, at the committee's
  // decision. Still kept out of search results and the sitemap: the
  // names are for people who come looking, not for search engines.
  robots: { index: false, follow: false },
  title: "Donation Board",
  description: "Everyone who gave to the IISc Sharodiya Durgotsab 2026, by name and amount.",
};

// Rendered per request so a donation verified a minute ago is already
// here, and so the members-only note below never lands in a shared cache.
export const dynamic = "force-dynamic";

export default async function BoardPage() {
  const session = await currentSession();

  const board = await getBoard();

  return (
    <>
      <LiveRefresh seconds={60} />
      <Section className="page-top">
        <Container>
          <SectionHeading
            as="h1"
            eyebrow="দানপত্র The board"
            title="Everyone who gave"
            bangla="দাতাদের নাম"
            lede="Shubho Bijoya, and thank you. Students, faculty, post-docs, alumni and well-wishers who made Sharodiya Durgotsab 2026 happen, on one list, ranked by what they gave. A name appears here once the treasurer has matched the payment against the bank statement."
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
              {session && MEMBER_CODE && (
                <Reveal>
                  <div className="surface border-gold/40 p-6">
                    <h2 className="eyebrow">For the committee</h2>
                    <p className="mt-4 text-[0.82rem] leading-relaxed text-ink-soft">
                      Meme Theory&apos;s thank-you to everyone in the committee:
                      20% off everything at memetheory.in, the official T-shirt
                      included.
                    </p>
                    <p className="mt-4 font-display text-[1.272rem] tracking-wide text-sindoor">
                      {MEMBER_CODE}
                    </p>
                    <p className="mt-1 text-[0.72rem] text-ink-faint">
                      Once per person. Please keep it within the committee.
                    </p>
                    <a
                      href={MERCH.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-ghost mt-5 w-full"
                    >
                      The T-shirt
                    </a>
                  </div>
                </Reveal>
              )}

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
                        d: "Everyone who gives is on this board, by name and amount, for anyone to see.",
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
                    and it gets corrected. Nothing on this board is removed
                    without a note.
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
