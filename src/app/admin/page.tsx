import { redirect } from "next/navigation";
import DonationsPanel from "@/components/admin/DonationsPanel";
import { currentSession } from "@/lib/auth";
import { can } from "@/lib/roles";

export const dynamic = "force-dynamic";

export default async function AdminDonationsPage() {
  const session = await currentSession();
  // The layout shows the sign-in form when there is no session at
  // all, so anyone arriving here with a viewer account is simply in
  // the wrong room and gets sent to the one they came for.
  if (!session) return null;
  if (!can(session.role, "enterDonation")) redirect("/daan/board");

  const intro = {
    admin:
      "Each online row is someone telling us they have transferred money. Match it against the bank statement before verifying, which issues the next receipt number and puts the name on the board. Anything entered here by you, the committee or a fund raiser is verified as it is saved.",
    committee:
      "Enter donations you have in hand; they are verified as they are saved and the receipt number appears at once. Tick off each WhatsApp receipt as you send it, and use Receipt to send to see who is left. Correct a donor's details with Edit; every change is recorded.",
    fundraiser:
      "Enter each donation as you take it. It is verified as it is saved, and the receipt number appears at once, so you can show the donor their receipt before they leave. Below are the entries you have made.",
  } as const;
  const role = session.role as keyof typeof intro;

  return (
    <div>
      <div className="mb-7">
        <h1 className="font-display text-[1.618rem] font-normal text-ink">
          Donations
        </h1>
        <p className="mt-1 max-w-[70ch] text-[0.85rem] leading-relaxed text-ink-soft">
          {intro[role]}
        </p>
      </div>
      <DonationsPanel role={role} user={session.user} />
    </div>
  );
}
