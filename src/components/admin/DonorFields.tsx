"use client";

import { DONOR_CATEGORIES } from "@/lib/site";

export const METHODS = ["cash", "upi", "neft", "imps", "cheque", "other"] as const;

/** What the form holds, as the donations route expects it. */
export type DonorInput = {
  name: string;
  display_name: string;
  amount: string;
  category: string;
  phone: string;
  email: string;
  sr_number: string;
  method: string;
  reference: string;
  paid_on: string;
  message: string;
};

export const EMPTY_DONOR: DonorInput = {
  name: "",
  display_name: "",
  amount: "",
  category: "student",
  phone: "",
  email: "",
  sr_number: "",
  method: "cash",
  reference: "",
  paid_on: "",
  message: "",
};

/** Reads the fields below out of a submitted form. */
export function readDonorForm(fd: FormData) {
  const s = (k: string) => String(fd.get(k) ?? "").trim();
  return {
    name: s("name"),
    display_name: s("display_name"),
    amount: Number(s("amount")),
    category: s("category"),
    phone: s("phone"),
    email: s("email") === "not given" ? "" : s("email"),
    sr_number: s("sr_number"),
    method: s("method"),
    reference: s("reference"),
    paid_on: s("paid_on"),
    message: s("message"),
  };
}

/**
 * The donor's details, shared by entering a donation and correcting
 * one, so the two can never drift apart.
 */
export default function DonorFields({
  initial = EMPTY_DONOR,
  full = false,
}: {
  initial?: DonorInput;
  /** Editing shows the fields a desk entry rarely needs. */
  full?: boolean;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <Field label="Name" required>
        <input
          name="name"
          required
          className="field"
          maxLength={120}
          defaultValue={initial.name}
          autoComplete="off"
        />
      </Field>
      <Field label="Amount (₹)" required>
        <input
          name="amount"
          type="number"
          min="1"
          step="0.01"
          required
          className="field"
          inputMode="decimal"
          defaultValue={initial.amount}
        />
      </Field>
      <Field label="Category">
        <select name="category" className="field" defaultValue={initial.category}>
          {DONOR_CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </Field>
      <Field label="WhatsApp number" hint="for the receipt">
        <input
          name="phone"
          className="field"
          inputMode="numeric"
          maxLength={14}
          placeholder="10 digits"
          defaultValue={initial.phone === "0000000000" ? "" : initial.phone}
          autoComplete="off"
        />
      </Field>
      <Field label="Email">
        <input
          name="email"
          type="email"
          className="field"
          defaultValue={initial.email === "not given" ? "" : initial.email}
          autoComplete="off"
        />
      </Field>
      <Field label="SR number">
        <input name="sr_number" className="field" defaultValue={initial.sr_number} />
      </Field>
      <Field label="Paid by">
        <select name="method" className="field" defaultValue={initial.method}>
          {METHODS.map((m) => (
            <option key={m} value={m}>
              {m.toUpperCase()}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Reference" hint="UTR or cheque no.">
        <input name="reference" className="field" defaultValue={initial.reference} />
      </Field>
      <Field label="Date of payment">
        <input name="paid_on" type="date" className="field" defaultValue={initial.paid_on} />
      </Field>
      {full && (
        <>
          <Field label="Name on the board" hint="if different">
            <input
              name="display_name"
              className="field"
              maxLength={80}
              defaultValue={initial.display_name}
            />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Message">
              <input
                name="message"
                className="field"
                maxLength={140}
                defaultValue={initial.message}
              />
            </Field>
          </div>
        </>
      )}
    </div>
  );
}

export function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-[0.62rem] uppercase tracking-[0.2em] text-ink-soft">
        {label}
        {required && <span className="ml-1 text-sindoor">*</span>}
        {hint && (
          <span className="ml-1.5 normal-case tracking-normal text-ink-faint">{hint}</span>
        )}
      </span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}
