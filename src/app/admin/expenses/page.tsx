import { redirect } from "next/navigation";
import ExpensesPanel from "@/components/admin/ExpensesPanel";
import { currentSession } from "@/lib/auth";
import { can } from "@/lib/roles";

export const dynamic = "force-dynamic";

export default async function AdminExpensesPage() {
  // The ledger names members who paid from their own pocket and how to
  // reach them, so it is the executive committee's alone. A fund raiser
  // or a viewer is sent back to the room they came for; the routes
  // behind this page refuse them again on their own.
  const session = await currentSession();
  if (!session) return null;
  if (!can(session.role, "manageExpenses")) redirect("/admin");

  return (
    <div>
      <div className="mb-7 print:hidden">
        <h1 className="font-display text-[1.618rem] font-normal text-ink">
          Expense ledger
        </h1>
        <p className="mt-1 max-w-[74ch] text-[0.85rem] leading-relaxed text-ink-soft">
          Every rupee the Puja spends, who paid the vendor, and the bill to
          prove it. When a member pays from their own pocket the line stays
          “still owed” until somebody marks it reimbursed, so nobody is
          forgotten and nobody is paid twice. Attach a photo or PDF of each
          bill and the audit can be done from this page. Only the executive
          committee can open it; at most the head, amount and date of a line
          ever leave it.
        </p>
      </div>
      <ExpensesPanel canDelete={can(session.role, "deleteExpense")} user={session.user} />
    </div>
  );
}
