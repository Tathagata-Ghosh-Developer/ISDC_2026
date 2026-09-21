"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Loader2, Plus, X } from "lucide-react";
import { DONOR_CATEGORIES } from "@/lib/site";

const METHODS = ["cash", "upi", "neft", "imps", "cheque", "other"];

/**
 * For donations collected in person. Most of the mess-counter money
 * arrives as cash in someone's hand, and it still has to reach the
 * board with a receipt number like everything else.
 *
 * A committee member fills this in and the entry waits. Only an
 * administrator can verify it, and verifying is what mints the
 * receipt number, so the checkbox below is theirs alone.
 */
export default function AddDonor({
  onAdded,
  role,
}: {
  onAdded: () => void;
  role: "admin" | "committee";
}) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);

    setBusy(true);
    setError(null);
    setDone(null);

    const res = await fetch("/api/admin/donations", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name: fd.get("name"),
        email: fd.get("email"),
        phone: fd.get("phone"),
        sr_number: fd.get("sr_number"),
        category: fd.get("category"),
        amount: Number(fd.get("amount")),
        method: fd.get("method"),
        reference: fd.get("reference"),
        paid_on: fd.get("paid_on"),
        verify: role === "admin" && fd.get("verify") === "on",
      }),
    }).catch(() => null);

    const data = res
      ? ((await res.json().catch(() => ({}))) as {
          error?: string;
          donation?: { receipt_no?: string | null };
        })
      : {};

    if (!res || !res.ok) {
      setError(data.error ?? "Could not save that.");
      setBusy(false);
      return;
    }

    setDone(data.donation?.receipt_no ?? "saved");
    form.reset();
    setBusy(false);
    onAdded();
  }

  return (
    <div className="mb-6">
      <button
        onClick={() => setOpen((v) => !v)}
        className="btn btn-ghost !py-2 !text-[0.68rem]"
        aria-expanded={open}
      >
        {open ? <X size={13} /> : <Plus size={13} />}
        {open ? "Close" : "Enter a donation on someone's behalf"}
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.form
            onSubmit={submit}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="surface mt-4 overflow-hidden"
          >
            <fieldset disabled={busy} className="space-y-4 p-6">
              <p className="text-[0.8rem] leading-relaxed text-ink-soft">
                Use this for cash taken at a desk, a cheque handed over, or a
                transfer someone made without filling the form. It records who
                entered it. Everyone who gives appears on the board under the
                name written here, so write it the way the donor would.
              </p>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Field label="Name" required>
                  <input name="name" required className="field" maxLength={120} />
                </Field>
                <Field label="Amount" required>
                  <input
                    name="amount"
                    type="number"
                    min="1"
                    step="0.01"
                    required
                    className="field"
                    inputMode="decimal"
                  />
                </Field>
                <Field label="Category">
                  <select name="category" className="field" defaultValue="student">
                    {DONOR_CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="WhatsApp number">
                  <input name="phone" className="field" inputMode="numeric" />
                </Field>
                <Field label="Email">
                  <input name="email" type="email" className="field" />
                </Field>
                <Field label="SR number">
                  <input name="sr_number" className="field" />
                </Field>
                <Field label="Paid by">
                  <select name="method" className="field" defaultValue="cash">
                    {METHODS.map((m) => (
                      <option key={m} value={m}>
                        {m.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Reference">
                  <input name="reference" className="field" />
                </Field>
                <Field label="Date of payment">
                  <input name="paid_on" type="date" className="field" />
                </Field>
              </div>

              {role === "admin" ? (
                <div className="flex flex-wrap gap-5">
                  <label className="flex items-center gap-2.5 text-[0.82rem] text-ink-soft">
                    <input
                      type="checkbox"
                      name="verify"
                      defaultChecked
                      className="accent-[var(--c-sindoor)]"
                    />
                    Verify now and issue a receipt number
                  </label>
                </div>
              ) : (
                <p className="border-l-2 border-gold/50 pl-3 text-[0.78rem] leading-relaxed text-ink-soft">
                  This goes into the pending list. An administrator checks it
                  against the bank statement, and verifying is what issues the
                  receipt number and puts the name on the board.
                </p>
              )}

              {error && (
                <p className="border border-sindoor/40 p-3 text-[0.8rem] text-sindoor">
                  {error}
                </p>
              )}
              {done && (
                <p className="flex items-center gap-2 border border-leaf/40 p-3 text-[0.8rem] text-leaf">
                  <Check size={14} /> Saved
                  {done !== "saved" && ` as ${done}`}
                </p>
              )}

              <button className="btn btn-primary !py-2 !text-[0.68rem]">
                {busy ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
                Add to the board
              </button>
            </fieldset>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-[0.62rem] uppercase tracking-[0.2em] text-ink-soft">
        {label}
        {required && <span className="ml-1 text-sindoor">*</span>}
      </span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}
