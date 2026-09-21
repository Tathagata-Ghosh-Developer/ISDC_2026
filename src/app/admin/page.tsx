import { redirect } from "next/navigation";
import DonationsPanel from "@/components/admin/DonationsPanel";
import { currentSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminDonationsPage() {
  const session = await currentSession();
  // The layout shows the sign-in form when there is no session at
  // all, so anyone arriving here with a viewer account is simply in
  // the wrong room and gets sent to the one they came for.
  if (!session) return null;
  if (session.role === "viewer") redirect("/daan/board");

  const admin = session.role === "admin";

  return (
    <div>
      <div className="mb-7">
        <h1 className="font-display text-[1.618rem] font-normal text-ink">
          Donations
        </h1>
        <p className="mt-1 max-w-[70ch] text-[0.85rem] leading-relaxed text-ink-soft">
          {admin
            ? "Each row is someone telling us they have transferred money. Match it against the bank statement before verifying. Verifying issues the next receipt number in sequence and puts the name on the board."
            : "Enter donations collected in person here, and check on the ones already entered. Verifying is an administrator's job, because that is what issues the receipt number."}
        </p>
      </div>
      <DonationsPanel role={session.role} />
    </div>
  );
}
