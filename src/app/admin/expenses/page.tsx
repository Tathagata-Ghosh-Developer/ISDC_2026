import ExpensesPanel from "@/components/admin/ExpensesPanel";

export const dynamic = "force-dynamic";

export default function AdminExpensesPage() {
  return (
    <div>
      <div className="mb-7">
        <h1 className="font-display text-[1.618rem] font-light text-ink">
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
