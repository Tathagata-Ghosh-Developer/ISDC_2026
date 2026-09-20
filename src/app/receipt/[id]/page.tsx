import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDonation } from "@/lib/db";
import { getConfig } from "@/lib/config";
import { formatINR, formatDate, formatDateTime } from "@/lib/format";
import PrintButton from "@/components/PrintButton";
import Logo from "@/components/Logo";
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
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const donation = await getDonation(id);
  const config = await getConfig();

  if (!donation) notFound();

  const issued = donation.status === "verified" && donation.receipt_no;

  return (
    <div className="min-h-dvh px-4 pb-16 pt-[6rem] sm:pt-[7rem]">
      <div className="mx-auto w-full max-w-[46rem]">
        {!issued && (
          <div className="no-print surface mb-6 p-5">
            <p className="text-[0.88rem] leading-relaxed text-ink">
              {donation.status === "rejected"
                ? "This entry was not matched to a payment in the bank statement. If that is a mistake, write to a convenor with your transaction reference."
                : "This donation is recorded but not verified yet. The treasurer matches entries against the bank statement, usually within a day. The receipt number appears here once it clears."}
            </p>
          </div>
        )}

        <article className="print-plate surface relative overflow-hidden">
          {/* the coloured edge a printed bill book has */}
          <div
            className="h-2 w-full"
            style={{
              background:
                "linear-gradient(90deg, var(--c-sindoor), var(--c-haldi), var(--c-gold), var(--c-sindoor))",
            }}
          />

          <div className="p-7 sm:p-[2.618rem]">
            {/* ---------------- head ---------------- */}
            <header className="flex flex-wrap items-start justify-between gap-5 border-b border-line pb-6">
              <div className="flex items-start gap-4">
                <Logo size={62} />
                <div>
                  <p className="bangla-display text-[1.272rem] leading-tight text-ink">
                    {SITE.nameBangla}
                  </p>
                  <h1 className="font-display text-[1.1rem] font-semibold text-ink">
                    {config.bank.accountName}
                  </h1>
                  <p className="mt-1 text-[0.72rem] leading-relaxed text-ink-faint">
                    {RECEIPT.heading}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p className="font-display text-[1.618rem] uppercase tracking-[0.3em] text-ink">
                  Receipt
                </p>
                <p className="font-display mt-1 text-[1.272rem] tabular-nums text-sindoor">
                  {donation.receipt_no ?? "Pending"}
                </p>
                <p className="mt-1 text-[0.72rem] text-ink-faint">
                  {formatDate(donation.verified_at ?? donation.created_at)}
                </p>
              </div>
            </header>

            {/* ---------------- body ---------------- */}
            <section className="grid gap-5 py-7 sm:grid-cols-2">
              <Row label="Received with thanks from" value={donation.name} wide />
              <Row label="Contact number" value={`+91 ${donation.phone}`} />
              <Row
                label="Category"
                value={
                  donation.category[0].toUpperCase() + donation.category.slice(1)
                }
              />
              {donation.sr_number && (
                <Row label="SR number" value={donation.sr_number} />
              )}
              <Row label="Email" value={donation.email} />
              <Row label="Paid by" value={donation.method.toUpperCase()} />
              {donation.reference && (
                <Row label="Transaction reference" value={donation.reference} />
              )}
              {donation.paid_on && (
                <Row label="Date of payment" value={formatDate(donation.paid_on)} />
              )}
            </section>

            {/* ---------------- amount ---------------- */}
            <section className="flex flex-wrap items-end justify-between gap-6 border-y border-line py-6">
              <div>
                <p className="text-[0.6rem] uppercase tracking-[0.24em] text-ink-faint">
                  Amount
                </p>
                <p className="font-display mt-1 text-[2.618rem] font-semibold leading-none tabular-nums text-sindoor">
                  {formatINR(donation.amount)}
                </p>
                <p className="mt-2 text-[0.82rem] italic text-ink-soft">
                  Rupees {inWords(donation.amount)} only
                </p>
              </div>
              <div className="text-right">
                <p className="text-[0.6rem] uppercase tracking-[0.24em] text-ink-faint">
                  Towards
                </p>
                <p className="font-display mt-1 text-[1.272rem] text-ink">
                  {RECEIPT.towards}
                </p>
              </div>
            </section>

            {/* ---------------- foot ---------------- */}
            <section className="pt-7">
              <p className="max-w-[62ch] text-[0.8rem] leading-relaxed text-ink-soft">
                {RECEIPT.note}
              </p>
              <p className="bangla-display mt-4 text-[1.05rem] leading-loose text-ink">
                আপনার অবদানের জন্য আন্তরিক কৃতজ্ঞতা। শুভ শারদীয়া।
              </p>

              <div className="mt-9 flex flex-wrap items-end justify-between gap-8">
                <div className="text-[0.68rem] leading-relaxed text-ink-faint">
                  <p>
                    {config.bank.bank}, {config.bank.branch}
                  </p>
                  <p>
                    Account {config.bank.accountNumber}, IFSC {config.bank.ifsc}
                    {config.bank.upiId ? `, UPI ${config.bank.upiId}` : ""}
                  </p>
                  {donation.verified_by && (
                    <p className="mt-1">
                      Verified by {donation.verified_by} on{" "}
                      {formatDateTime(donation.verified_at)}
                    </p>
                  )}
                </div>

                <div className="flex gap-8">
                  {RECEIPT.signatories.map((s) => (
                    <div key={s.name} className="text-center">
                      {s.image ? (
                        <Image
                          src={s.image}
                          alt=""
                          width={140}
                          height={48}
                          className="mx-auto mb-1 h-12 w-auto object-contain"
                        />
                      ) : (
                        <div className="mb-1 h-12 w-36" />
                      )}
                      <div className="h-px w-36 bg-line" />
                      <p className="mt-1.5 text-[0.75rem] text-ink">{s.name}</p>
                      <p className="text-[0.58rem] uppercase tracking-[0.2em] text-ink-faint">
                        {s.role}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <p className="mt-9 border-t border-line pt-4 text-[0.6rem] leading-relaxed text-ink-faint">
              Computer generated and valid without a physical signature. Check it
              at {SITE.url}/receipt/{donation.id}, a reference unique to this
              donation. The committee is not registered under section 80G, so
              this contribution is not tax deductible.
            </p>
          </div>
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

function Row({
  label,
  value,
  wide = false,
}: {
  label: string;
  value: string;
  wide?: boolean;
}) {
  return (
    <div className={wide ? "sm:col-span-2" : ""}>
      <p className="text-[0.6rem] uppercase tracking-[0.24em] text-ink-faint">
        {label}
      </p>
      <p
        className={`mt-1 break-words text-ink ${wide ? "font-display text-[1.272rem]" : "text-[0.92rem]"}`}
      >
        {value}
      </p>
    </div>
  );
}
