"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ExternalLink, Loader2, Plus, X } from "lucide-react";
import DonorFields, { readDonorForm } from "./DonorFields";
import type { Role } from "@/lib/roles";

type Saved = { receipt_no?: string | null; receipt_token?: string; name?: string };

/**
 * For donations taken in person: cash at a desk, a cheque, a transfer
 * someone made without filling the form.
 *
 * Whoever enters it, the entry is verified as it is saved, so the
 * receipt number exists before the donor walks away. Only the
 * administrator may choose to hold one back for checking first.
 */
export default function AddDonor({
  onAdded,
  role,
}: {
  onAdded: () => void;
  role: Exclude<Role, "viewer">;
}) {
  // A fund raiser is here to do exactly this, so the form starts open.
  const [open, setOpen] = useState(role === "fundraiser");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [twin, setTwin] = useState(false);
  const [saved, setSaved] = useState<Saved | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  async function save(confirmDuplicate: boolean) {
    const form = formRef.current;
    if (!form || !form.reportValidity()) return;
    const fd = new FormData(form);

    setBusy(true);
    setError(null);
    setSaved(null);

    const res = await fetch("/api/admin/donations", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        ...readDonorForm(fd),
        verify: role === "admin" ? fd.get("verify") === "on" : true,
        confirm_duplicate: confirmDuplicate,
      }),
    }).catch(() => null);

    const data = res
      ? ((await res.json().catch(() => ({}))) as {
          error?: string;
          warning?: string;
          duplicate?: boolean;
          pending?: boolean;
          donation?: Saved;
        })
      : {};

    setBusy(false);

    if (!res) {
      setError("No connection. Nothing was saved; try again when the network is back.");
      return;
    }
    if (data.duplicate) {
      setTwin(true);
      setError(data.error ?? "This looks like an entry made a moment ago.");
      return;
    }
    if (!res.ok) {
      setTwin(false);
      setError(data.error ?? "Could not save that.");
      return;
    }

    setTwin(false);
    if (data.warning) setError(data.warning);
    setSaved(data.donation ?? { receipt_no: null });
    form.reset();
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
            ref={formRef}
            onSubmit={(e) => {
              e.preventDefault();
              void save(false);
            }}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="surface mt-4 overflow-hidden"
          >
            <fieldset disabled={busy} className="space-y-4 p-6">
              <p className="text-[0.8rem] leading-relaxed text-ink-soft">
                Write the name the way the donor would want it on the board;
                everyone who gives appears there. Take their WhatsApp number so
                the committee can send the receipt.
              </p>

              <DonorFields />

              {role === "admin" ? (
                <label className="flex items-center gap-2.5 text-[0.82rem] text-ink-soft">
                  <input
                    type="checkbox"
                    name="verify"
                    defaultChecked
                    className="accent-[var(--c-sindoor)]"
                  />
                  Verify now and issue a receipt number
                </label>
              ) : (
                <p className="border-l-2 border-leaf/50 pl-3 text-[0.78rem] leading-relaxed text-ink-soft">
                  Saving verifies it and issues the next receipt number at once,
                  under your name. Only enter money you actually have in hand or
                  have seen arrive.
                </p>
              )}

              {error && (
                <div
                  className="border border-sindoor/40 p-3 text-[0.8rem] text-sindoor"
                  role="alert"
                >
                  <p>{error}</p>
                  {twin && (
                    <button
                      type="button"
                      onClick={() => void save(true)}
                      className="btn btn-ghost mt-3 !border-sindoor/50 !py-1.5 !text-[0.65rem] !text-sindoor"
                    >
                      It is a different donation, save it anyway
                    </button>
                  )}
                </div>
              )}

              {saved && (
                <div
                  className="flex flex-wrap items-center gap-x-4 gap-y-2 border border-leaf/40 p-3 text-[0.82rem] text-leaf"
                  role="status"
                >
                  <span className="flex items-center gap-2">
                    <Check size={14} />
                    {saved.receipt_no
                      ? `Verified. Receipt ${saved.receipt_no}`
                      : "Saved, waiting to be verified"}
                  </span>
                  {saved.receipt_token && (
                    <a
                      href={`/receipt/${saved.receipt_token}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 underline underline-offset-4 hover:text-sindoor"
                    >
                      Show the donor their receipt <ExternalLink size={12} />
                    </a>
                  )}
                </div>
              )}

              <button className="btn btn-primary !py-2 !text-[0.68rem]">
                {busy ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
                Save and issue receipt
              </button>
            </fieldset>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
