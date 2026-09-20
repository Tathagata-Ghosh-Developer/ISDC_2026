import type { Metadata } from "next";
import Link from "next/link";
import { Container, Section, SectionHeading } from "@/components/Section";
import Reveal from "@/components/Reveal";
import BoardTable from "@/components/BoardTable";
import { getBoard } from "@/lib/db";
import { getConfig } from "@/lib/config";
import { formatINR, formatDate } from "@/lib/format";
import { DONOR_CATEGORIES } from "@/lib/site";

export const metadata: Metadata = {
  title: "Donation Board",
  description:
    "Every verified donation to the IISc Sharodiya Durgotsab, and every published expense, in one public ledger.",
};

export const revalidate = 60;

export default async function BoardPage() {
  const board = await getBoard();
  const config = await getConfig();

  const balance = board.total - board.spent;

  const byHead = new Map<string, number>();
  for (const e of board.expenses) {
    byHead.set(e.head, (byHead.get(e.head) ?? 0) + e.amount);
  }
  const heads = [...byHead.entries()].sort((a, b) => b[1] - a[1]);
  const maxHead = heads[0]?.[1] ?? 0;

  return (
    <>
      <Section className="pt-[7.5rem] sm:pt-[9rem]">
        <Container>
          <SectionHeading
            eyebrow="খাতা · The ledger"
            title="The donation board"
            bangla="দানপত্র"
            lede="Money in on the left, money out on the right, both updated as the treasurer works. A donation appears here only after it has been matched against the bank statement."
          />

          <Reveal className="mt-[2.618rem]">
            <div className="grid gap-px overflow-hidden border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
              <Stat label="Raised" bangla="সংগৃহীত" value={formatINR(board.total)} tone="sindoor" />
              <Stat label="Donors" bangla="দাতা" value={String(board.count)} />
              <Stat label="Spent" bangla="ব্যয়" value={formatINR(board.spent)} />
              <Stat
                label="In hand"
                bangla="উদ্বৃত্ত"
                value={formatINR(balance)}
                tone={balance < 0 ? "sindoor" : "leaf"}
              />
            </div>
          </Reveal>

          {!board.ready && (
            <Reveal className="mt-8">
              <p className="surface p-6 text-[0.88rem] leading-relaxed text-ink-soft">
                The ledger is not connected yet. Nothing on this page is a
                sample or a placeholder figure — it will fill with real entries
                the moment the committee links the database, and not before.
              </p>
            </Reveal>
          )}
        </Container>
      </Section>

      {/* ---------------- donors ---------------- */}
      <Section className="!pt-0">
        <Container>
          <div className="grid gap-[2.618rem] lg:grid-cols-[1.618fr_1fr] lg:items-start">
            <div>
              <Reveal>
                <h2 className="font-display text-[1.618rem] font-normal text-ink">
                  Who gave
                </h2>
                <p className="lede mt-2 text-[0.9rem]">
                  Listed newest first. Donors who asked to stay anonymous appear
                  without a name, but their amount is still counted, so the
                  totals above remain true.
                </p>
              </Reveal>

              <div className="mt-6">
                <BoardTable entries={board.entries} />
              </div>
            </div>

            <div className="space-y-5 lg:sticky lg:top-24">
              <Reveal>
                <div className="surface p-6">
                  <h3 className="eyebrow">Where it came from</h3>
                  <ul className="mt-5 space-y-3">
                    {DONOR_CATEGORIES.map((c) => {
                      const row = board.byCategory[c.value];
                      const amount = row?.total ?? 0;
                      const share = board.total > 0 ? amount / board.total : 0;
                      return (
                        <li key={c.value}>
                          <div className="flex items-baseline justify-between gap-3 text-[0.82rem]">
                            <span className="text-ink">
                              {c.label}
                              <span className="bangla ml-1.5 text-[0.72rem] text-ink-faint">
                                {c.bangla}
                              </span>
                            </span>
                            <span className="tabular-nums text-ink-soft">
                              {formatINR(amount)}
                            </span>
                          </div>
                          <div className="mt-1.5 h-1 w-full bg-line">
                            <div
                              className="h-1 bg-gold"
                              style={{ width: `${Math.round(share * 100)}%` }}
                            />
                          </div>
                          <span className="mt-1 block text-[0.65rem] text-ink-faint">
                            {row?.count ?? 0} donors
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </Reveal>

              <Reveal delay={0.08}>
                <div className="surface p-6">
                  <h3 className="eyebrow">Where it went</h3>
                  {heads.length === 0 ? (
                    <p className="mt-4 text-[0.8rem] leading-relaxed text-ink-faint">
                      No expenses published yet. Bills go up here as they are
                      settled, head by head.
                    </p>
                  ) : (
                    <ul className="mt-5 space-y-3">
                      {heads.map(([head, amount]) => (
                        <li key={head}>
                          <div className="flex items-baseline justify-between gap-3 text-[0.82rem]">
                            <span className="text-ink">{head}</span>
                            <span className="tabular-nums text-ink-soft">
                              {formatINR(amount)}
                            </span>
                          </div>
                          <div className="mt-1.5 h-1 w-full bg-line">
                            <div
                              className="h-1 bg-terracotta"
                              style={{
                                width: `${maxHead > 0 ? Math.round((amount / maxHead) * 100) : 0}%`,
                              }}
                            />
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </Reveal>

              <Reveal delay={0.16}>
                <div className="surface p-6">
                  <h3 className="eyebrow">Audit it yourself</h3>
                  <p className="mt-4 text-[0.8rem] leading-relaxed text-ink-soft">
                    Receipt numbers run in an unbroken sequence, so a missing
                    number would be obvious. The committee account is operated
                    jointly and its statement is available to any member of the
                    Institute community on request.
                  </p>
                  <p className="mt-3 text-[0.8rem] leading-relaxed text-ink-soft">
                    Last year&apos;s audited accounts and this year&apos;s
                    running ledger are both open. If a figure here does not
                    match your own record, write to a convenor and we will
                    correct it in public.
                  </p>
                  <Link href="/daan" className="btn btn-ghost mt-6 w-full">
                    Add your donation
                  </Link>
                </div>
              </Reveal>
            </div>
          </div>
        </Container>
      </Section>

      {/* ---------------- expenses ---------------- */}
      {board.expenses.length > 0 && (
        <Section className="bg-paper-2/40">
          <Container>
            <SectionHeading
              eyebrow="ব্যয় · Expenses"
              title="Published bills"
              lede="Each line is a settled payment. Vendor names are listed so the figures can be checked against the market rate."
            />
            <Reveal className="mt-8 overflow-x-auto">
              <table className="w-full min-w-[42rem] border-collapse text-[0.85rem]">
                <thead>
                  <tr className="border-b border-line text-left text-[0.62rem] uppercase tracking-[0.2em] text-ink-faint">
                    <th className="py-3 pr-4 font-medium">Date</th>
                    <th className="py-3 pr-4 font-medium">Head</th>
                    <th className="py-3 pr-4 font-medium">Detail</th>
                    <th className="py-3 pr-4 font-medium">Vendor</th>
                    <th className="py-3 text-right font-medium">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {board.expenses.map((e) => (
                    <tr key={e.id} className="border-b border-line/60">
                      <td className="py-3 pr-4 text-ink-faint">
                        {formatDate(e.spent_on)}
                      </td>
                      <td className="py-3 pr-4 text-ink">{e.head}</td>
                      <td className="py-3 pr-4 text-ink-soft">
                        {e.description ?? "—"}
                      </td>
                      <td className="py-3 pr-4 text-ink-soft">{e.vendor ?? "—"}</td>
                      <td className="py-3 text-right tabular-nums text-ink">
                        {formatINR(e.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={4} className="py-4 pr-4 text-right text-ink-soft">
                      Total published spend
                    </td>
                    <td className="py-4 text-right font-medium tabular-nums text-sindoor">
                      {formatINR(board.spent)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </Reveal>
            <p className="mt-6 text-[0.72rem] text-ink-faint">
              Venue: {config.venue.address}
            </p>
          </Container>
        </Section>
      )}
    </>
  );
}

function Stat({
  label,
  bangla,
  value,
  tone = "ink",
}: {
  label: string;
  bangla: string;
  value: string;
  tone?: "ink" | "sindoor" | "leaf";
}) {
  const colour =
    tone === "sindoor"
      ? "text-sindoor"
      : tone === "leaf"
        ? "text-leaf"
        : "text-ink";
  return (
    <div className="bg-paper p-6">
      <span
        className={`font-display block text-[2.058rem] font-normal leading-none tabular-nums ${colour}`}
      >
        {value}
      </span>
      <span className="mt-2 block text-[0.62rem] uppercase tracking-[0.24em] text-ink-faint">
        {label}
      </span>
      <span className="bangla block text-[0.72rem] text-gold/80">{bangla}</span>
    </div>
  );
}
