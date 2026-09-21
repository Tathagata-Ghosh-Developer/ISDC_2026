import { redirect } from "next/navigation";
import ExpensesPanel from "@/components/admin/ExpensesPanel";
import { currentSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminExpensesPage() {
  // Expenses and the site's own copy are an administrator's to change.
  const session = await currentSession();
  if (!session) return null;
  if (session.role !== "admin") redirect("/admin");

  return (
    <div>
      <div className="mb-7">
        <h1 className="font-display text-[1.618rem] font-normal text-ink">
          Expenses
        </h1>
        <p className="mt-1 max-w-[70ch] text-[0.85rem] leading-relaxed text-ink-soft">
          Every line recorded here appears on the public board unless you
          untick it. Publishing what the Puja spends is what makes asking for
          donations honest.
        </p>
      </div>
      <ExpensesPanel />
    </div>
  );
}
