import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDonationByToken } from "@/lib/db";
import { formatINR, formatDate, formatDateTime } from "@/lib/format";
import PrintButton from "@/components/PrintButton";
import Logo from "@/components/Logo";
import Stamp from "@/components/Stamp";
import { SITE, RECEIPT } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Receipt",
  robots: { index: false, follow: false },
};

/* ---------- amount in words, Indian numbering ---------- */

const ONES = [
  "", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine",
  "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen",
  "seventeen", "eighteen", "nineteen",
];
const TENS = [
  "", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty",
  "ninety",
];

function underHundred(n: number): string {
  if (n < 20) return ONES[n];
  const t = Math.floor(n / 10);
  const r = n % 10;
  return TENS[t] + (r ? " " + ONES[r] : "");
}

function inWords(amount: number): string {
  const rupees = Math.floor(amount);
  if (rupees === 0) return "zero";

  const parts: string[] = [];
  let rest = rupees;
  for (const [value, name] of [
    [10000000, "crore"],
    [100000, "lakh"],
    [1000, "thousand"],
    [100, "hundred"],
  ] as const) {
    const count = Math.floor(rest / value);
    if (count > 0) {
      parts.push(`${underHundred(count)} ${name}`);
      rest %= value;
    }
  }
  if (rest > 0) parts.push((parts.length ? "and " : "") + underHundred(rest));
  return parts.join(" ");
}

export default async function ReceiptPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const donation = await getDonationByToken(token);

  if (!donation) notFound();

  const issued = donation.status === "verified" && donation.receipt_no;
  const rejected = donation.status === "rejected";

  return (
    <div className="min-h-dvh px-4 pb-16 pt-[6rem] sm:pt-[7rem]">
      <div className="mx-auto w-full max-w-[46rem]">
        {!issued && (
          <div className="no-print surface mb-6 p-5">
            <p className="text-[0.88rem] leading-relaxed text-ink">
              {rejected
                ? "This entry was not matched to a payment in the bank statement. If that is a mistake, write to a convenor with your transaction reference and they will look again."
                : "This donation is recorded and is waiting to be checked against the bank statement, usually within a day. The receipt number appears here the moment it clears. Keep this link."}
            </p>
          </div>
        )}

        {/* ================================================================
            The committee's own bill book, rendered rather than scanned.

            The paper book has two halves: a counterfoil the committee
            keeps and a receipt the donor takes away. This is that second
            half, laid out field for field, so a donor holding the paper
            and a donor holding the phone are looking at the same thing.
            ================================================================ */}
        <article className="receipt-plate relative overflow-hidden border-2">
          {/* the crest, ghosted, exactly as it is printed behind the book */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 grid place-items-center overflow-hidden opacity-[0.03]"
          >
            <span className="block max-w-full">
              <Logo size={260} />
            </span>
          </div>

          <div className="relative p-6 sm:p-9">
            {/* ---------------- head ---------------- */}
            <header className="flex items-start gap-4">
              <Logo size={58} />
              <div className="min-w-0 flex-1 text-center">
                <p className="font-display text-[1.15rem] font-semibold leading-tight text-ink sm:text-[1.4rem]">
                  {SITE.name} &ndash; {SITE.year}
                </p>
                <p className="mt-0.5 text-[0.78rem] text-ink-soft">
                  {RECEIPT.heading}
                </p>
                <p className="mt-3 inline-block border-b-2 border-ink px-2 font-display text-[1.05rem] font-bold tracking-[0.12em] text-ink">
                  RECEIPT
                </p>
              </div>
              <span className="w-[58px] shrink-0" />
            </header>

            {/* ---------------- number and date ---------------- */}
            <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
              <div className="flex items-end gap-2">
                <span className="font-display text-[0.95rem] font-semibold text-ink">
                  No.
                </span>
                <span className="min-w-[10rem] border border-ink px-3 py-1.5 text-center font-display text-[0.95rem] tabular-nums text-ink">
                  {donation.receipt_no ?? "not yet issued"}
                </span>
              </div>
              <div className="flex items-end gap-2">
                <span className="text-[0.9rem] italic text-ink">Date :</span>
                <span className="min-w-[8rem] border-b border-ink pb-0.5 text-center text-[0.9rem] tabular-nums text-ink">
                  {formatDate(donation.verified_at ?? donation.created_at)}
                </span>
              </div>
            </div>

            {/* ---------------- the filled fields ---------------- */}
            <dl className="mt-7 space-y-5">
              <Field label="Received with thanks from">
                {donation.display_name?.trim() || donation.name}
              </Field>
              <Field label="Contact No.">
                {donation.phone && donation.phone !== "0000000000"
                  ? `+91 ${donation.phone}`
                  : donation.email !== "not given"
                    ? donation.email
                    : "not given"}
              </Field>
              <Field label="Amount">
                Rupees {inWords(donation.amount)} only
              </Field>
              <Field label="Towards">{RECEIPT.towards}</Field>
            </dl>

            {/* ---------------- the sum, and who received it ---------------- */}
            <div className="mt-8 flex flex-wrap items-end justify-between gap-6">
              <div className="flex items-center gap-3">
                <span className="font-display text-[1.272rem] font-bold text-ink">
                  Rs.
                </span>
                <span className="rounded-full border-2 border-ink px-6 py-2 font-display text-[1.272rem] font-semibold tabular-nums text-ink">
                  {formatINR(donation.amount)}
                </span>
              </div>

              <div className="text-right">
                <p className="text-[0.85rem] italic text-ink">Received by :</p>
                <div className="mt-1.5">
                  {RECEIPT.signatories.map((sig) => (
                    <p key={sig.name} className="text-[0.85rem] text-ink">
                      {sig.name}
                      <span className="ml-2 text-[0.68rem] uppercase tracking-[0.14em] text-ink-soft">
                        {sig.role}
                      </span>
                    </p>
                  ))}
                </div>
                {donation.verified_by && (
                  <p className="mt-1 text-[0.66rem] text-ink-faint">
                    entered by {donation.verified_by}
                  </p>
                )}
              </div>
            </div>

            {/* ---------------- the stamp ---------------- */}
            {issued && (
              <Stamp
                year={SITE.year}
                size={126}
                className="pointer-events-none absolute bottom-3 right-4 text-sindoor opacity-70 sm:bottom-6 sm:right-10"
              />
            )}

            {!issued && (
              <p className="mt-8 border-2 border-dashed border-ink/30 px-4 py-3 text-center text-[0.8rem] uppercase tracking-[0.2em] text-ink-soft">
                {rejected ? "not matched to a payment" : "awaiting verification"}
              </p>
            )}

            {/* ---------------- the small print ---------------- */}
            <footer className="mt-9 border-t border-ink/25 pt-4">
              <p className="text-[0.7rem] leading-relaxed text-ink-soft">
                {RECEIPT.note}
              </p>
              <div className="mt-3 flex flex-wrap justify-between gap-x-6 gap-y-1 text-[0.66rem] text-ink-faint">
                <span>
                  Paid by {donation.method.toUpperCase()}
                  {donation.reference ? `, reference ${donation.reference}` : ""}
                </span>
                <span>Recorded {formatDateTime(donation.created_at)}</span>
              </div>
              <p className="mt-2 text-[0.62rem] text-ink-faint">
                Verify this receipt at {SITE.url}/receipt/{donation.receipt_token}
              </p>
            </footer>
          </div>
        </article>

        <div className="no-print mt-6 flex flex-wrap gap-3">
          <PrintButton label="Print or save as PDF" />
          <Link href="/" className="btn btn-ghost">
            Home
          </Link>
        </div>

        <p className="no-print mt-5 text-[0.75rem] leading-relaxed text-ink-faint">
          This link is the only copy of your receipt and it is not listed
          anywhere. Anybody holding it can read it, so treat it the way you
          would treat the paper one.
        </p>
      </div>
    </div>
  );
}

/** One line of the bill book: a label, a rule, and what is written on it. */
function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end gap-x-2">
      <dt className="shrink-0 text-[0.9rem] italic text-ink">{label} :</dt>
      <dd className="min-w-0 flex-1 border-b border-ink pb-0.5 text-[0.95rem] text-ink">
        {children}
      </dd>
    </div>
  );
}
