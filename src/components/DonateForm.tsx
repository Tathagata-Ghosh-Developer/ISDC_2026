"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Loader2, AlertCircle } from "lucide-react";
import { DONOR_CATEGORIES } from "@/lib/site";
import { formatINR, normalisePhone } from "@/lib/format";

type Props = {
  suggested: number[];
  note: string;
};

type State =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "done"; id: string; name: string; amount: number }
  | { kind: "error"; message: string };

const METHODS = [
  { value: "upi", label: "UPI" },
  { value: "neft", label: "NEFT" },
  { value: "imps", label: "IMPS" },
  { value: "cash", label: "Cash" },
  { value: "cheque", label: "Cheque" },
  { value: "other", label: "Other" },
];

export default function DonateForm({ suggested, note }: Props) {
  const [state, setState] = useState<State>({ kind: "idle" });
  const [category, setCategory] = useState("student");
  const [amount, setAmount] = useState("");
  const [anonymous, setAnonymous] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (state.kind === "sending") return;

    const form = e.currentTarget;
    const fd = new FormData(form);
    fd.set("phone", normalisePhone(String(fd.get("phone") ?? "")));

    setState({ kind: "sending" });
    try {
      const res = await fetch("/api/donations", { method: "POST", body: fd });
      const data = (await res.json()) as {
        ok?: boolean;
        id?: string;
        error?: string;
      };
      if (!res.ok || !data.ok || !data.id) {
        setState({
          kind: "error",
          message: data.error ?? "We could not record that. Please try again.",
        });
        return;
      }
      setState({
        kind: "done",
        id: data.id,
        name: String(fd.get("name") ?? ""),
        amount: Number(fd.get("amount") ?? 0),
      });
      form.reset();
    } catch {
      setState({
        kind: "error",
        message: "Network trouble. Check your connection and try again.",
      });
    }
  }

  if (state.kind === "done") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="surface p-7 text-center sm:p-[2.618rem]"
      >
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full border border-gold text-gold">
          <Check size={22} />
        </div>
        <h3 className="font-display mt-6 text-[1.618rem] font-normal text-ink">
          Recorded. Thank you.
        </h3>
        <p className="bangla mt-2 text-[1.1rem] text-sindoor">
          আপনার অবদানের জন্য ধন্যবাদ
        </p>
        <p className="lede mx-auto mt-5 max-w-[46ch] text-[0.9rem]">
          We have your entry for {formatINR(state.amount)}. The treasurer checks
          it against the bank statement, usually within a day. Once it clears,
          a numbered receipt reaches your WhatsApp and your name appears on the
          donation board.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link href="/daan/board" className="btn btn-ghost">
            See the board
          </Link>
          <button
            onClick={() => setState({ kind: "idle" })}
            className="btn btn-ghost"
          >
            Record another
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="surface p-6 sm:p-[2.618rem]">
      <fieldset disabled={state.kind === "sending"} className="space-y-5">
        <legend className="sr-only">Donation details</legend>

        {/* who */}
        <div>
          <Label>I am a</Label>
          <div className="mt-2 flex flex-wrap gap-2">
            {DONOR_CATEGORIES.map((c) => (
              <label key={c.value} className="cursor-pointer">
                <input
                  type="radio"
                  name="category"
                  value={c.value}
                  checked={category === c.value}
                  onChange={() => setCategory(c.value)}
                  className="peer sr-only"
                />
                <span className="block border border-line px-3 py-2 text-[0.78rem] transition-colors peer-checked:border-sindoor peer-checked:bg-sindoor peer-checked:text-paper-3">
                  {c.label}
                  <span className="bangla ml-1.5 text-[0.7rem] opacity-70">
                    {c.bangla}
                  </span>
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            label="SR number"
            hint={
              category === "student"
                ? "Your IISc SR number"
                : "IISc ID, or leave blank"
            }
          >
            <input
              name="sr_number"
              className="field"
              placeholder="e.g. 04-01-00-10-12-23-1-12345"
              autoComplete="off"
            />
          </Field>

          <Field label="Full name" required>
            <input
              name="name"
              required
              maxLength={120}
              className="field"
              placeholder="As it should read on the receipt"
              autoComplete="name"
            />
          </Field>

          <Field label="Email" required>
            <input
              name="email"
              type="email"
              required
              className="field"
              placeholder="you@iisc.ac.in"
              autoComplete="email"
            />
          </Field>

          <Field label="WhatsApp number" required hint="Ten digits. The receipt is sent here.">
            <input
              name="phone"
              type="tel"
              required
              inputMode="numeric"
              className="field"
              placeholder="9876543210"
              autoComplete="tel"
            />
          </Field>
        </div>

        {/* amount */}
        <div>
          <Label required>Amount transferred</Label>
          <p className="mt-1 text-[0.72rem] text-ink-faint">{note}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {suggested.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setAmount(String(s))}
                className={`border px-3 py-2 text-[0.78rem] tabular-nums transition-colors ${
                  amount === String(s)
                    ? "border-sindoor bg-sindoor text-paper-3"
                    : "border-line text-ink-soft hover:border-gold"
                }`}
              >
                ₹{s.toLocaleString("en-IN")}
              </button>
            ))}
          </div>
          <input
            name="amount"
            type="number"
            required
            min={1}
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="field mt-3"
            placeholder="Enter any amount"
            inputMode="decimal"
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Paid by" required>
            <select name="method" required className="field" defaultValue="upi">
              {METHODS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </Field>

          <Field
            label="Transaction reference"
            hint="UTR, UPI reference or receipt number. Speeds up verification."
          >
            <input name="reference" className="field" placeholder="e.g. 4312XXXXXXXX" />
          </Field>

          <Field label="Date of payment">
            <input name="paid_on" type="date" className="field" />
          </Field>

          <Field label="Screenshot of payment" hint="Optional. Helps us match it faster.">
            <input
              name="proof"
              type="file"
              accept="image/*,application/pdf"
              className="field !py-2 text-[0.78rem]"
            />
          </Field>
        </div>

        {/* board */}
        <div className="border-t border-line pt-5">
          <Label>On the public donation board</Label>
          <p className="mt-2 text-[0.75rem] leading-relaxed text-ink-faint">
            The board is a public page. Anyone can open it, and your name, the
            amount and any line you write will be visible to them. It is not
            indexed by search engines, but it is not private either. Your
            email, phone number and SR number are never shown there.
          </p>

          <label className="mt-4 flex items-start gap-3 text-[0.82rem] text-ink-soft">
            <input
              type="checkbox"
              name="anonymous"
              checked={anonymous}
              onChange={(e) => setAnonymous(e.target.checked)}
              className="mt-1 accent-[var(--c-sindoor)]"
            />
            <span>
              Keep me off the board. The amount is still counted in the
              committee&apos;s accounts, and your receipt is unaffected.
            </span>
          </label>

          {!anonymous && (
            <div className="mt-4">
              <Field label="Name to display" hint="Leave blank to use your full name.">
                <input name="display_name" className="field" maxLength={80} />
              </Field>
            </div>
          )}

          <div className="mt-4">
            <Field label="A line for the board" hint="Optional, 140 characters.">
              <textarea
                name="message"
                maxLength={140}
                rows={2}
                className="field resize-none"
                placeholder="Shubho Sharodiya from the Physics department…"
              />
            </Field>
          </div>
        </div>

        <AnimatePresence>
          {state.kind === "error" && (
            <motion.p
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-start gap-2 border border-sindoor/40 bg-sindoor/8 p-3 text-[0.8rem] text-sindoor"
              role="alert"
            >
              <AlertCircle size={15} className="mt-0.5 shrink-0" />
              {state.message}
            </motion.p>
          )}
        </AnimatePresence>

        <button type="submit" className="btn btn-primary w-full">
          {state.kind === "sending" ? (
            <>
              <Loader2 size={15} className="animate-spin" /> Recording
            </>
          ) : (
            "I have transferred, record it"
          )}
        </button>

        <div className="space-y-2 border-t border-line pt-5 text-[0.7rem] leading-relaxed text-ink-faint">
          <p>
            Submitting this form records your declaration. It does not move
            money and it does not charge anything. Make the transfer first
            using the account details alongside, then tell us about it here.
          </p>
          <p>
            What we do with it. Your name, email, phone number and SR number go
            to the committee treasurer so the payment can be matched and a
            receipt sent. A screenshot, if you upload one, is stored privately
            and is visible only to the committee. Nothing is sold, shared or
            used for anything else, and you can ask a convenor to remove your
            entry at any time.
          </p>
        </div>
      </fieldset>
    </form>
  );
}

function Label({
  children,
  required,
}: {
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <span className="block text-[0.68rem] uppercase tracking-[0.22em] text-ink-soft">
      {children}
      {required && <span className="ml-1 text-sindoor">*</span>}
    </span>
  );
}

function Field({
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
      <Label required={required}>{label}</Label>
      <div className="mt-2">{children}</div>
      {hint && <p className="mt-1.5 text-[0.68rem] text-ink-faint">{hint}</p>}
    </label>
  );
}
