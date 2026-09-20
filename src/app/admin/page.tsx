import DonationsPanel from "@/components/admin/DonationsPanel";

export const dynamic = "force-dynamic";

export default function AdminDonationsPage() {
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
      <DonationsPanel />
    </div>
  );
}
