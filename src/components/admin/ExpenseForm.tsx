"use client";

import { useState } from "react";
import { Check, Loader2, Paperclip, Plus, X } from "lucide-react";
import {
  LIMITS,
  PAID_FROM,
  PAID_FROM_LABEL,
  PAYMENT_MODES,
  PAYMENT_MODE_LABEL,
  RECEIPT_ACCEPT,
  checkReceiptFile,
  megabytes,
  readExpense,
  statusOf,
  type Expense,
  type PaidFrom,
} from "@/lib/expenses";
import { formatDate } from "@/lib/format";

/**
 * Sends bills to an expense one at a time. One file per request keeps
 * every request under Vercel's 4.5 MB ceiling; the size has already been
 * checked here in the browser, and is checked again on the server.
 */
export async function uploadReceipts(
  id: string,
  files: File[],
  onProgress?: (done: number) => void,
): Promise<{ expense: Expense | null; problems: string[] }> {
  let expense: Expense | null = null;
  const problems: string[] = [];
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const local = checkReceiptFile(file);
    if (local) {
      problems.push(local);
      continue;
    }
    const form = new FormData();
    form.append("id", id);
    form.append("file", file);
    const res = await fetch("/api/admin/expenses/receipts", { method: "POST", body: form }).catch(() => null);
    const data = res
      ? ((await res.json().catch(() => ({}))) as { expense?: Expense; error?: string })
      : {};
    if (res?.status === 413 && !data.error) {
      problems.push(`“${file.name}” is too large to send. Each bill can be at most 4 MB.`);
    } else if (!res || !res.ok || !data.expense) {
      problems.push(`“${file.name}”: ${data.error ?? "could not be uploaded. Check the connection and try again."}`);
    } else {
      expense = data.expense;
    }
    onProgress?.(i + 1);
  }
  return { expense, problems };
}

/** Picks bills, refusing in plain words anything the server would refuse. */
export function BillPicker({
  files,
  onChange,
  label = "Bills and receipts",
}: {
  files: File[];
  onChange: (files: File[]) => void;
  label?: string;
}) {
  const [problem, setProblem] = useState<string | null>(null);

  function add(list: FileList | null) {
    if (!list) return;
    const ok: File[] = [];
    const refused: string[] = [];
    for (const f of Array.from(list)) {
      const p = checkReceiptFile(f);
      if (p) refused.push(p);
      else ok.push(f);
    }
    setProblem(refused.length ? refused.join(" ") : null);
    onChange([...files, ...ok]);
  }

  return (
    <div>
      <Lbl>{label}</Lbl>
      <label className="mt-2 flex cursor-pointer items-center gap-2 border border-dashed border-line px-3 py-3 text-[0.8rem] text-ink-soft transition-colors hover:border-gold hover:text-ink">
        <Paperclip size={14} className="shrink-0 text-gold" />
        <span>
          Add a photo or PDF of the bill
          <span className="block text-[0.68rem] text-ink-faint">
            JPEG, PNG, WebP, HEIC or PDF, up to 4 MB each
          </span>
        </span>
        <input
          type="file"
          multiple
          accept={RECEIPT_ACCEPT}
          className="sr-only"
          onChange={(e) => {
            add(e.target.files);
            e.target.value = "";
          }}
        />
      </label>
      {problem && (
        <p className="mt-2 text-[0.75rem] leading-relaxed text-sindoor" role="alert">
          {problem}
        </p>
      )}
      {files.length > 0 && (
        <ul className="mt-2 space-y-1">
          {files.map((f, i) => (
            <li key={`${f.name}-${i}`} className="flex items-center justify-between gap-2 text-[0.75rem] text-ink-soft">
              <span className="min-w-0 truncate">{f.name}</span>
              <span className="flex shrink-0 items-center gap-2 tabular-nums text-ink-faint">
                {megabytes(f.size)} MB
                <button
                  type="button"
                  aria-label={`Remove ${f.name}`}
                  onClick={() => onChange(files.filter((_, j) => j !== i))}
                  className="grid h-6 w-6 place-items-center border border-line hover:border-sindoor hover:text-sindoor"
                >
                  <X size={11} />
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

type Props = {
  /** The line being edited, or null for a new one. */
  editing: Expense | null;
  heads: string[];
  payers: { name: string; contact: string | null }[];
  /** False until the database migration has run; saving is then refused. */
  ledger: boolean;
  onSaved: (expense: Expense, problems: string[]) => void;
  onCancel?: () => void;
};

/**
 * Entering a line, or correcting one. The same rules as the server run
 * here first (src/lib/expenses.ts), so a mistake is explained before
 * anything is sent.
 */
export default function ExpenseForm({ editing, heads, payers, ledger, onSaved, onCancel }: Props) {
  const settled = editing ? statusOf(editing) === "reimbursed" : false;
  const [paidFrom, setPaidFrom] = useState<PaidFrom>(editing?.paid_from ?? "committee_account");
  const [owed, setOwed] = useState<"pending" | "not_needed">(
    editing && statusOf(editing) === "pending" ? "pending" : "not_needed",
  );
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // A member paying from their own pocket is owed it back unless they
  // say otherwise; a sponsor paying the vendor directly is not.
  function choosePaidFrom(v: PaidFrom) {
    setPaidFrom(v);
    setOwed(v === "member" ? "pending" : "not_needed");
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const val = (k: string) => String(fd.get(k) ?? "");
    const someoneElse = paidFrom !== "committee_account";

    const payload: Record<string, unknown> = {
      head: val("head"),
      amount: val("amount"),
      spent_on: val("spent_on"),
      vendor: val("vendor"),
      invoice_no: val("invoice_no"),
      description: val("description"),
      bill_url: val("bill_url"),
      paid_from: paidFrom,
      paid_by_name: someoneElse ? val("paid_by_name") : null,
      paid_by_contact: someoneElse ? val("paid_by_contact") : null,
      payment_mode: val("payment_mode"),
      payment_ref: val("payment_ref"),
      notes: val("notes"),
      published: fd.get("published") === "on",
    };
    if (!settled) payload.reimbursement_status = someoneElse ? owed : "not_needed";

    const local = readExpense(payload, { settled });
    if (typeof local === "string") {
      setError(local);
      return;
    }

    setBusy("Saving");
    setError(null);
    const res = await fetch("/api/admin/expenses", {
      method: editing ? "PATCH" : "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(editing ? { id: editing.id, action: "edit", fields: payload } : payload),
    }).catch(() => null);
    const data = res
      ? ((await res.json().catch(() => ({}))) as { expense?: Expense; error?: string })
      : {};
    if (!res || !res.ok || !data.expense) {
      setBusy(null);
      setError(data.error ?? "Could not save that. Check the connection and try again.");
      return;
    }

    let saved = data.expense;
    let problems: string[] = [];
    if (files.length) {
      setBusy(`Uploading 1 of ${files.length}`);
      const up = await uploadReceipts(saved.id, files, (done) =>
        setBusy(done < files.length ? `Uploading ${done + 1} of ${files.length}` : "Finishing"),
      );
      if (up.expense) saved = up.expense;
      problems = up.problems;
    }

    setBusy(null);
    setFiles([]);
    if (!editing) {
      form.reset();
      setPaidFrom("committee_account");
      setOwed("not_needed");
    }
    onSaved(saved, problems);
  }

  const someoneElse = paidFrom !== "committee_account";

  return (
    <form onSubmit={submit} className="surface p-5 sm:p-6" noValidate>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-display text-[1.272rem] text-ink">
          {editing ? `Correcting: ${editing.head}` : "Record an expense"}
        </h2>
        {editing && (
          <span className="text-[0.7rem] text-ink-faint">
            Entered{editing.created_by ? ` by ${editing.created_by}` : ""}
            {editing.created_at ? `, ${formatDate(editing.created_at)}` : ""}. Your change is recorded under your name.
          </span>
        )}
      </div>

      <fieldset disabled={Boolean(busy)} className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <label className="block">
          <Lbl>Head *</Lbl>
          <input
            name="head"
            required
            maxLength={LIMITS.head}
            list="expense-heads"
            defaultValue={editing?.head ?? ""}
            className="field mt-2"
            placeholder="Pandal"
          />
          <datalist id="expense-heads">
            {heads.map((h) => (
              <option key={h} value={h} />
            ))}
          </datalist>
        </label>

        <label className="block">
          <Lbl>Amount, in rupees *</Lbl>
          <input
            name="amount"
            type="number"
            step="0.01"
            min="0"
            required
            inputMode="decimal"
            defaultValue={editing ? String(editing.amount) : ""}
            className="field mt-2"
          />
        </label>

        <label className="block">
          <Lbl>Date paid</Lbl>
          <input name="spent_on" type="date" defaultValue={editing?.spent_on ?? ""} className="field mt-2" />
        </label>

        <label className="block">
          <Lbl>Vendor</Lbl>
          <input
            name="vendor"
            maxLength={LIMITS.vendor}
            defaultValue={editing?.vendor ?? ""}
            className="field mt-2"
            placeholder="Who was paid"
          />
        </label>

        <label className="block">
          <Lbl>Bill or invoice number</Lbl>
          <input
            name="invoice_no"
            maxLength={LIMITS.invoice_no}
            defaultValue={editing?.invoice_no ?? ""}
            className="field mt-2"
            placeholder="As printed on the bill"
          />
        </label>

        <label className="block">
          <Lbl>Paid from *</Lbl>
          <select
            name="paid_from"
            value={paidFrom}
            onChange={(e) => choosePaidFrom(e.target.value as PaidFrom)}
            className="field mt-2"
          >
            {PAID_FROM.map((p) => (
              <option key={p} value={p} disabled={settled && p === "committee_account"}>
                {PAID_FROM_LABEL[p]}
              </option>
            ))}
          </select>
        </label>

        <label className="block sm:col-span-2 lg:col-span-3">
          <Lbl>What it covered</Lbl>
          <textarea
            name="description"
            rows={2}
            maxLength={LIMITS.description}
            defaultValue={editing?.description ?? ""}
            className="field mt-2 resize-y"
            placeholder="Forty bamboo poles and the cloth for the side walls"
          />
        </label>

        {someoneElse && (
          <>
            <label className="block">
              <Lbl>{paidFrom === "member" ? "Member who paid *" : paidFrom === "sponsor" ? "Sponsor" : "Who paid"}</Lbl>
              <input
                name="paid_by_name"
                maxLength={LIMITS.paid_by_name}
                list="expense-payers"
                defaultValue={editing?.paid_by_name ?? ""}
                className="field mt-2"
                placeholder={paidFrom === "sponsor" ? "Name of the sponsor" : "Full name"}
              />
              <datalist id="expense-payers">
                {payers.map((p) => (
                  <option key={p.name} value={p.name} />
                ))}
              </datalist>
            </label>

            <label className="block">
              <Lbl>Their phone or email</Lbl>
              <input
                name="paid_by_contact"
                maxLength={LIMITS.paid_by_contact}
                defaultValue={editing?.paid_by_contact ?? ""}
                className="field mt-2"
                inputMode="email"
                placeholder="For repaying them"
              />
            </label>

            <label className="block">
              <Lbl>Refund</Lbl>
              {settled ? (
                <p className="mt-2 border border-leaf/50 px-3 py-2.5 text-[0.78rem] text-leaf">
                  Reimbursed{editing?.reimbursed_on ? ` on ${formatDate(editing.reimbursed_on)}` : ""}
                  {editing?.reimbursed_by ? ` by ${editing.reimbursed_by}` : ""}. Undo it from the ledger to change this.
                </p>
              ) : (
                <select
                  value={owed}
                  onChange={(e) => setOwed(e.target.value as "pending" | "not_needed")}
                  className="field mt-2"
                >
                  <option value="pending">Still owed to them</option>
                  <option value="not_needed">No refund needed</option>
                </select>
              )}
            </label>
          </>
        )}

        <label className="block">
          <Lbl>How the vendor was paid</Lbl>
          <select name="payment_mode" defaultValue={editing?.payment_mode ?? ""} className="field mt-2">
            <option value="">Not recorded</option>
            {PAYMENT_MODES.map((m) => (
              <option key={m} value={m}>
                {PAYMENT_MODE_LABEL[m]}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <Lbl>UTR or cheque number</Lbl>
          <input
            name="payment_ref"
            maxLength={LIMITS.payment_ref}
            defaultValue={editing?.payment_ref ?? ""}
            className="field mt-2"
            placeholder="The payment's reference"
          />
        </label>

        <label className="block">
          <Lbl>Bill link</Lbl>
          <input
            name="bill_url"
            type="url"
            maxLength={LIMITS.bill_url}
            defaultValue={editing?.bill_url ?? ""}
            className="field mt-2"
            placeholder="https:// if the bill is online"
          />
        </label>

        <label className="block sm:col-span-2 lg:col-span-2">
          <Lbl>Notes for the committee</Lbl>
          <textarea
            name="notes"
            rows={2}
            maxLength={LIMITS.notes}
            defaultValue={editing?.notes ?? ""}
            className="field mt-2 resize-y"
            placeholder="Advance or final payment, who agreed the price, anything an auditor would ask"
          />
        </label>

        <div>
          <BillPicker files={files} onChange={setFiles} />
          {editing && (editing.receipt_keys?.length ?? 0) > 0 && (
            <p className="mt-2 text-[0.7rem] text-ink-faint">
              {editing.receipt_keys!.length} already attached; open the line in the ledger to see or remove them.
            </p>
          )}
        </div>

        <label className="flex items-start gap-2.5 text-[0.8rem] text-ink-soft sm:col-span-2 lg:col-span-3">
          <input
            type="checkbox"
            name="published"
            defaultChecked={editing ? editing.published : true}
            className="mt-0.5 accent-[var(--c-sindoor)]"
          />
          <span>
            Publish the head, amount and date
            <span className="block text-[0.7rem] text-ink-faint">
              Nothing else on this line is ever shown outside this console: not the payer, their contact, the bills or the refund.
            </span>
          </span>
        </label>
      </fieldset>

      {!ledger && (
        <p className="mt-4 border border-gold/60 p-3 text-[0.78rem] text-ink-soft">
          Saving is switched off until the database update has been run.
        </p>
      )}

      {error && (
        <p className="mt-4 border border-sindoor/40 p-3 text-[0.8rem] text-sindoor" role="alert">
          {error}
        </p>
      )}

      <div className="mt-5 flex flex-wrap gap-2">
        <button disabled={Boolean(busy) || !ledger} className="btn btn-primary">
          {busy ? (
            <Loader2 size={14} className="animate-spin" />
          ) : editing ? (
            <Check size={14} />
          ) : (
            <Plus size={14} />
          )}
          {busy ?? (editing ? "Save changes" : "Add to the ledger")}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} disabled={Boolean(busy)} className="btn btn-ghost">
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

export function Lbl({ children }: { children: React.ReactNode }) {
  return <span className="text-[0.62rem] uppercase tracking-[0.22em] text-ink-soft">{children}</span>;
}
