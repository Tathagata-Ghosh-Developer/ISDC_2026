import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getDonation } from "@/lib/db";
import { getConfig } from "@/lib/config";
import { formatINR, formatDate, formatDateTime } from "@/lib/format";
import PrintButton from "@/components/PrintButton";
import { SITE } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Receipt",
  robots: { index: false, follow: false },
};

const AMOUNT_WORDS_ONES = [
  "", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine",
  "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen",
  "seventeen", "eighteen", "nineteen",
];
const AMOUNT_WORDS_TENS = [
  "", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety",
];

function underHundred(n: number): string {
  if (n < 20) return AMOUNT_WORDS_ONES[n];
  const t = Math.floor(n / 10);
  const r = n % 10;
  return AMOUNT_WORDS_TENS[t] + (r ? "-" + AMOUNT_WORDS_ONES[r] : "");
}

/** Indian numbering: crore, lakh, thousand, hundred. */
function inWords(amount: number): string {
  const rupees = Math.floor(amount);
  if (rupees === 0) return "zero";

  const parts: string[] = [];
  const units: [number, string][] = [
    [10000000, "crore"],
    [100000, "lakh"],
    [1000, "thousand"],
    [100, "hundred"],
  ];

  let rest = rupees;
  for (const [value, name] of units) {
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
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const donation = await getDonation(id);
  const config = await getConfig();

  if (!donation) notFound();

  const issued = donation.status === "verified" && donation.receipt_no;

  return (
    <div className="min-h-dvh px-4 pb-16 pt-[7rem] sm:pt-[8rem]">
      <div className="mx-auto w-full max-w-[44rem]">
        {!issued && (
          <div className="no-print surface mb-6 p-5">
            <p className="text-[0.88rem] leading-relaxed text-ink">
              {donation.status === "rejected"
                ? "This entry was not matched to a payment in the bank statement. If that is a mistake, please write to a convenor with your transaction reference."
                : "This donation is recorded but not verified yet. The treasurer matches entries against the bank statement, usually within a day. Your receipt number appears here once it clears."}
            </p>
          </div>
        )}

        {/* ---------------- the receipt plate ---------------- */}
        <article className="print-plate surface relative overflow-hidden p-7 sm:p-[2.618rem]">
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-1"
            style={{
              background:
                "linear-gradient(90deg, var(--c-sindoor), var(--c-haldi), var(--c-gold), var(--c-sindoor))",
            }}
          />

          <header className="flex flex-wrap items-start justify-between gap-4 border-b border-line pb-6">
            <div>
              <p className="bangla-display text-[1.4rem] text-ink">
                {SITE.nameBangla}
              </p>
              <h1 className="font-display text-[1.272rem] font-medium text-ink">
                {config.bank.accountName}
              </h1>
              <p className="mt-1 max-w-[34ch] text-[0.72rem] leading-relaxed text-ink-faint">
                {config.venue.address}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[0.6rem] uppercase tracking-[0.24em] text-ink-faint">
                Receipt
              </p>
              <p className="font-display text-[1.272rem] tabular-nums text-sindoor">
                {donation.receipt_no ?? "Pending"}
              </p>
              <p className="mt-1 text-[0.68rem] text-ink-faint">
                {formatDate(donation.verified_at ?? donation.created_at)}
              </p>
            </div>
          </header>

          <section className="grid gap-5 py-6 sm:grid-cols-2">
            <Row label="Received from" value={donation.name} />
            <Row
              label="Category"
              value={donation.category[0].toUpperCase() + donation.category.slice(1)}
            />
            {donation.sr_number && <Row label="SR number" value={donation.sr_number} />}
            <Row label="WhatsApp" value={`+91 ${donation.phone}`} />
            <Row label="Email" value={donation.email} />
            <Row label="Mode" value={donation.method.toUpperCase()} />
            {donation.reference && (
              <Row label="Transaction reference" value={donation.reference} />
            )}
            {donation.paid_on && (
              <Row label="Paid on" value={formatDate(donation.paid_on)} />
            )}
          </section>

          <section className="border-y border-line py-6">
            <p className="text-[0.6rem] uppercase tracking-[0.24em] text-ink-faint">
              Amount received
            </p>
            <p className="font-display mt-1 text-[2.618rem] font-normal leading-none tabular-nums text-sindoor">
              {formatINR(donation.amount)}
            </p>
            <p className="mt-2 text-[0.8rem] italic text-ink-soft">
              Rupees {inWords(donation.amount)} only
            </p>
          </section>

          <section className="pt-6">
            <p className="text-[0.8rem] leading-relaxed text-ink-soft">
              Received with thanks towards the expenses of{" "}
              {SITE.name} {SITE.year}. This contribution is voluntary and carries
              no consideration in return. No payment gateway was used, so the
              full amount reaches the committee account.
            </p>
            <p className="bangla mt-4 text-[0.95rem] leading-loose text-ink">
              আপনার অবদানের জন্য আন্তরিক কৃতজ্ঞতা। শুভ শারদীয়া।
            </p>

            <div className="mt-8 flex flex-wrap items-end justify-between gap-6">
              <div className="text-[0.68rem] leading-relaxed text-ink-faint">
                <p>Bank: {config.bank.bank}, {config.bank.branch}</p>
                <p>Account: {config.bank.accountNumber} IFSC {config.bank.ifsc}</p>
                {donation.verified_by && (
                  <p className="mt-1">
                    Verified by {donation.verified_by} on{" "}
                    {formatDateTime(donation.verified_at)}
                  </p>
                )}
              </div>
              <div className="text-right">
                <div className="mb-1 h-10 w-40 border-b border-line" />
                <p className="text-[0.6rem] uppercase tracking-[0.2em] text-ink-faint">
                  Treasurer, on behalf of the committee
                </p>
              </div>
            </div>
          </section>

          <p className="mt-8 border-t border-line pt-4 text-[0.6rem] leading-relaxed text-ink-faint">
            This receipt is computer generated and valid without a physical
            signature. Verify it at {SITE.url}/receipt/{donation.id}, the
            reference is unique to this donation. The committee is not
            registered under section 80G, so this contribution is not tax
            deductible.
          </p>
        </article>

        <div className="no-print mt-6 flex flex-wrap gap-3">
          <PrintButton />
          <Link href="/daan/board" className="btn btn-ghost">
            Donation board
          </Link>
          <Link href="/" className="btn btn-ghost">
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[0.6rem] uppercase tracking-[0.24em] text-ink-faint">
        {label}
      </p>
      <p className="mt-1 break-words text-[0.92rem] text-ink">{value}</p>
    </div>
  );
}
