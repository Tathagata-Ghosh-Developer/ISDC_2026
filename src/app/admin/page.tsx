import { headers } from "next/headers";
import DonationsPanel from "@/components/admin/DonationsPanel";
import { SITE } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function AdminDonationsPage() {
  // The receipt link in the WhatsApp message must point at whichever
  // host the console is being used from, not a hardcoded domain.
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "https";
  const origin = host ? `${proto}://${host}` : SITE.url;

  return (
    <div>
      <div className="mb-7">
        <h1 className="font-display text-[1.618rem] font-normal text-ink">
          Donations
        </h1>
        <p className="mt-1 max-w-[70ch] text-[0.85rem] leading-relaxed text-ink-soft">
          Each row is a donor telling us they have transferred money. Match it
          against the bank statement before verifying. Verifying issues the next
          receipt number in sequence and publishes the entry on the board.
        </p>
      </div>
      <DonationsPanel origin={origin} />
    </div>
  );
}
