import type { Metadata } from "next";
import Link from "next/link";
import { Container, Section, SectionHeading } from "@/components/Section";
import Reveal from "@/components/Reveal";
import Leaderboard from "@/components/Leaderboard";
import AdminLogin from "@/components/admin/AdminLogin";
import { getBoard } from "@/lib/db";
import { authConfigured, currentSession } from "@/lib/auth";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "Donation Board",
  description: "The donation board of the IISc Sharodiya Durgotsab, for signed-in members.",
};

// Behind a login since 25 September 2026, at the committee's decision.
// Rendered per request, never cached: a cached copy of this page is a
// copy of every donor's name and amount, served to whoever asks next.
export const dynamic = "force-dynamic";

export default async function BoardPage() {
  const session = await currentSession();

  // Nobody signed in: no names, no amounts, no database read at all.
  if (!session) {
    return (
      <Section className="pt-[7.5rem] sm:pt-[9rem]">
        <Container>
          <SectionHeading
            as="h1"
            eyebrow="দানপত্র The board"
            title="The donation board"
            bangla="দাতাদের নাম"
            lede="The list of donors is open to the committee and to members with an account. Sign in to see it. If you have given and want to check your own entry, your receipt link has everything, or message a convenor."
          />
          <div className="mt-[2.618rem] grid place-items-center">
            <AdminLogin configured={authConfigured()} />
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/daan" className="btn btn-primary">
              Donate
            </Link>
            <Link href="/thikana#committee" className="btn btn-ghost">
              Reach the committee
            </Link>
          </div>
        </Container>
      </Section>
    );
  }

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
                        d: "Everyone who gives is on this board, by name and amount, for signed-in members to see.",
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
