import Link from "next/link";
import { Container, Section } from "@/components/Section";
import { SITE, CONTACTS } from "@/lib/site";

/**
 * A receipt link that does not resolve.
 *
 * Calling notFound() from inside a dynamic segment does not fall
 * through to the site's own not-found page; without this file the
 * donor gets a blank white screen. That is the worst possible answer
 * to somebody who has already sent money and is trying to check on
 * it, so this page is written for exactly that person.
 */
export default function ReceiptNotFound() {
  return (
    <Section className="pt-[7.5rem] sm:pt-[9rem]">
      <Container>
        <div className="mx-auto max-w-[60ch] text-center">
          <p className="bangla-display text-[2.618rem] leading-tight text-sindoor">
            রসিদ পাওয়া গেল না
          </p>
          <h1 className="font-display mt-3 text-[1.618rem] font-normal text-ink sm:text-[2.058rem]">
            That receipt link does not open anything
          </h1>

          <p className="lede mt-6 text-[0.98rem]">
            Nothing is wrong with your donation. This page only means the link
            itself did not match a record, and there are three ordinary reasons
            for that.
          </p>

          <ul className="mt-7 space-y-4 text-left">
            {[
              [
                "The link was cut short",
                "Receipt links are long and messaging apps break them across lines. Copy the whole thing, including everything after the last slash.",
              ],
              [
                "It is from a previous year",
                "Each year's committee runs its own ledger. A link from an earlier Puja will not open here.",
              ],
              [
                "The entry was withdrawn",
                "If a declared payment was never found in the bank statement, the treasurer marks it so and the link stops resolving.",
              ],
            ].map(([t, d]) => (
              <li key={t} className="border-l-2 border-gold/50 pl-5">
                <span className="block text-[0.95rem] text-ink">{t}</span>
                <span className="mt-1 block text-[0.85rem] leading-relaxed text-ink-soft">
                  {d}
                </span>
              </li>
            ))}
          </ul>

          <div className="surface mt-9 p-6 text-left">
            <p className="text-[0.88rem] leading-relaxed text-ink-soft">
              If you have paid and cannot find your receipt, message a convenor
              with the amount and the date, and the transaction reference if you
              have it. They can find the entry from any of those and send the
              link again.
            </p>
            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
              {CONTACTS.map((c) => (
                <a
                  key={c.phone}
                  href={`https://wa.me/91${c.phone}`}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-[0.85rem] text-gold hover:text-sindoor"
                >
                  {c.name} · +91 {c.phone}
                </a>
              ))}
              <a
                href={`mailto:${SITE.email}`}
                className="text-[0.85rem] text-gold hover:text-sindoor"
              >
                {SITE.email}
              </a>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/daan/board" className="btn btn-ghost">
              The donation board
            </Link>
            <Link href="/" className="btn btn-ghost">
              Back to the beginning
            </Link>
          </div>
        </div>
      </Container>
    </Section>
  );
}
