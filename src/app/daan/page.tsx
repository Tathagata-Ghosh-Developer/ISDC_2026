import type { Metadata } from "next";
import Image from "next/image";
import fs from "node:fs";
import path from "node:path";
import { Building2, QrCode, ShieldCheck } from "lucide-react";
import { Container, Section, SectionHeading } from "@/components/Section";
import Reveal from "@/components/Reveal";
import DonateForm from "@/components/DonateForm";
import CopyField from "@/components/CopyField";
import { getConfig } from "@/lib/config";
import { dbReady } from "@/lib/db";

export const metadata: Metadata = {
  title: "Donate",
  description:
    "Support the IISc Sharodiya Durgotsab. Transfer directly to the committee account, no payment gateway, no fees, and a numbered receipt for every rupee.",
};

// Cached at the edge and rebuilt at most once a minute. This is the page
// behind the QR code at the pandal, and rendering it afresh for every
// scan meant a server function and a database read per visitor, which
// is exactly what falls over when a thousand people scan at once.
//
// The warning below depends on dbReady, which is whether the Supabase
// keys are set, not whether the database answers. Keys only change with
// a redeploy, so a cached copy is never wrong about it. Bank details
// edited in the console refresh this page at once (revalidatePath in
// /api/admin/config).
export const revalidate = 60;

export default async function DonatePage() {
  const config = await getConfig();

  // The QR is dropped in by the committee when the bank issues it.
  const qrExists = fs.existsSync(
    path.join(process.cwd(), "public", config.bank.qrImage.replace(/^\//, "")),
  );

  return (
    <>
      {/* The bank account on this page is real and works whether or not
          this site is ready to record anything. Until the ledger is
          connected, a donation would leave the payer with no row, no
          receipt and no entry on the board. Say so before they scan
          anything, not after. */}
      {!dbReady && (
        <div className="border-b-2 border-sindoor bg-sindoor/10 px-5 py-4">
          <div className="mx-auto max-w-[1440px]">
            <p className="font-display text-[1.05rem] text-sindoor">
              Please do not send money yet.
            </p>
            <p className="mt-1.5 max-w-[80ch] text-[0.85rem] leading-relaxed text-ink">
              The committee is still connecting the ledger, so a payment made
              now would not be recorded and no receipt could be issued. The
              account details below are correct and the account is live, which
              is exactly why this warning is here. Come back once this notice
              is gone, or hand your donation to a committee member in person.
            </p>
          </div>
        </div>
      )}
      <Section className="pt-[7.5rem] sm:pt-[9rem]">
        <Container>
          <SectionHeading
            as="h1"
            eyebrow="দান Donate"
            title="Every rupee, on the record"
            bangla="স্বচ্ছ হিসেব, প্রকাশ্য খাতা"
            lede="There is no payment gateway here, which means no percentage disappears into processing fees. You transfer straight into the committee's bank account. We check it against the statement, send you a numbered receipt on WhatsApp, and publish your name and amount on the donation board."
          />

        </Container>
      </Section>

      <Section className="!pt-0">
        <Container>
          <div className="grid gap-[2.618rem] lg:grid-cols-[1fr_1.618fr] lg:items-start">
            {/* -------- how to pay -------- */}
            <Reveal className="lg:sticky lg:top-24">
              <div className="surface p-6 sm:p-7">
                <h2 className="font-display flex items-center gap-2 text-[1.272rem] text-ink">
                  <Building2 size={17} className="text-gold" />
                  Step one, transfer
                </h2>
                <p className="mt-2 text-[0.8rem] leading-relaxed text-ink-soft">
                  Use your own banking app. Add your name in the remarks so the
                  treasurer can match it quickly.
                </p>

                <dl className="mt-6 space-y-3">
                  <CopyField label="Account name" value={config.bank.accountName} />
                  <CopyField
                    label="Account number"
                    value={config.bank.accountNumber}
                    mono
                  />
                  <CopyField label="IFSC" value={config.bank.ifsc} mono />
                  <CopyField
                    label="Bank"
                    value={`${config.bank.bank}, ${config.bank.branch}`}
                  />
                  {config.bank.upiId && (
                    <CopyField label="UPI ID" value={config.bank.upiId} mono />
                  )}
                  <CopyField label="Merchant name" value={config.bank.merchantName} />
                </dl>

                <div className="mt-7 border-t border-line pt-6">
                  <h3 className="flex items-center gap-2 text-[0.68rem] uppercase tracking-[0.22em] text-ink-soft">
                    <QrCode size={14} className="text-gold" />
                    Scan to pay
                  </h3>
                  {qrExists ? (
                    <div className="mt-4 w-full max-w-[17rem] bg-white p-2">
                      <Image
                        src={config.bank.qrImage}
                        alt="Bank issued UPI QR code for the committee account"
                        width={976}
                        height={1280}
                        className="h-auto w-full"
                      />
                    </div>
                  ) : (
                    <p className="mt-3 border border-solid border-line p-4 text-[0.78rem] leading-relaxed text-ink-faint">
                      The QR code is being issued by the bank and will appear
                      here. Until then, please use the account details above,
                      which reach the same account.
                    </p>
                  )}
                </div>

                <div className="mt-7 flex gap-2 border-t border-line pt-6 text-[0.75rem] leading-relaxed text-ink-soft">
                  <ShieldCheck size={15} className="mt-0.5 shrink-0 text-leaf" />
                  <p>
                    The account is operated jointly, so no single committee
                    member can move money alone. Before you send anything,
                    check these details against the ones posted on our
                    Instagram or ask a convenor on WhatsApp. A page telling you
                    it is trustworthy is not evidence that it is, and you
                    should hold any site asking for money to that standard,
                    including this one.
                  </p>
                </div>
              </div>

              <div className="mt-4 text-[0.75rem] leading-relaxed text-ink-faint">
                <p>
                  Prefer to give cash? Find a fundraising volunteer at the mess
                  counters, or any committee member at the pandal. They will
                  record it under your name and you will get the same receipt.
                </p>
              </div>
            </Reveal>

            {/* -------- tell us -------- */}
            <div>
              <Reveal>
                <h2 className="font-display text-[1.618rem] font-normal text-ink">
                  Step two, tell us about it
                </h2>
                <p className="lede mt-2 max-w-[56ch] text-[0.95rem]">
                  This is how your receipt finds you. Nothing here charges your
                  card; the form only records what you have already sent.
                </p>
              </Reveal>

              <div className="mt-6">
                <DonateForm
                  suggested={[...config.donation.suggested]}
                  note={config.donation.note}
                />
              </div>

              <Reveal className="mt-8">
                <div className="surface p-6">
                  <h3 className="eyebrow">What happens next</h3>
                  <ol className="mt-5 space-y-4">
                    {[
                      {
                        n: "01",
                        t: "The treasurer matches your entry to the bank statement.",
                        d: "Usually within a day. A transaction reference makes it immediate.",
                      },
                      {
                        n: "02",
                        t: "A numbered receipt is issued.",
                        d: "Receipt numbers run in sequence, so gaps would be visible to anyone checking.",
                      },
                      {
                        n: "03",
                        t: "It reaches your WhatsApp.",
                        d: "A link to your receipt, which you can print or save as PDF.",
                      },
                      {
                        n: "04",
                        t: "Your name goes on the board.",
                        d: "Everyone who gives is recorded there, by name and amount. The board is open to the committee and signed-in members.",
                      },
                    ].map((s) => (
                      <li key={s.n} className="flex gap-4">
                        <span className="font-display shrink-0 text-[1.272rem] font-normal text-gold">
                          {s.n}
                        </span>
                        <span>
                          <span className="block text-[0.88rem] text-ink">{s.t}</span>
                          <span className="mt-0.5 block text-[0.78rem] text-ink-faint">
                            {s.d}
                          </span>
                        </span>
                      </li>
                    ))}
                  </ol>
                </div>
              </Reveal>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}

