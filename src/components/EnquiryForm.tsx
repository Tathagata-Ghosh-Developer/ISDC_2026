"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { Check, Loader2, Send } from "lucide-react";

/**
 * One form, four jobs.
 *
 * Sponsorship enquiries, sister institutes writing in, feedback on
 * the site itself, and anything else. The fields shift a little by
 * kind, the copy shifts with them, and everything lands in the same
 * committee inbox.
 */

export type EnquiryKind = "sponsor" | "institute" | "feedback" | "general";

type Copy = {
  namePlaceholder: string;
  orgLabel: string | null;
  subjectLabel: string | null;
  messageLabel: string;
  messagePlaceholder: string;
  button: string;
  done: string;
};

const COPY: Record<EnquiryKind, Copy> = {
  sponsor: {
    namePlaceholder: "Who we should write back to",
    orgLabel: "Company or organisation",
    subjectLabel: "What you have in mind",
    messageLabel: "Tell us about it",
    messagePlaceholder:
      "What you would like in return, what the budget looks like, and whether you need anything that is not on the list above. We would rather build something that suits you than sell you a tier.",
    button: "Send it to the committee",
    done: "Thank you. A convenor will write back within a day or two, usually sooner.",
  },
  institute: {
    namePlaceholder: "Your name",
    orgLabel: "Institute or society",
    subjectLabel: "Subject",
    messageLabel: "What would you like to ask",
    messagePlaceholder:
      "Whether you are bringing a group, performing, setting up a stall, or just want to know when bhog is served. All of it is welcome.",
    button: "Send",
    done: "Thank you. We will write back.",
  },
  feedback: {
    namePlaceholder: "Your name",
    orgLabel: null,
    subjectLabel: null,
    messageLabel: "What should be better",
    messagePlaceholder:
      "Something broken, something missing, something plainly wrong about the history, a photograph we should have used. Blunt is useful.",
    button: "Send feedback",
    done: "Noted, and thank you. This one genuinely gets read.",
  },
  general: {
    namePlaceholder: "Your name",
    orgLabel: "Where you are from",
    subjectLabel: "Subject",
    messageLabel: "Your message",
    messagePlaceholder: "",
    button: "Send",
    done: "Thank you. We will write back.",
  },
};

export default function EnquiryForm({
  kind,
  compact = false,
}: {
  kind: EnquiryKind;
  compact?: boolean;
}) {
  const pathname = usePathname();
  const copy = COPY[kind];
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    setBusy(true);
    setError(null);

    const res = await fetch("/api/enquiries", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        kind,
        name: fd.get("name"),
        organisation: fd.get("organisation"),
        email: fd.get("email"),
        phone: fd.get("phone"),
        subject: fd.get("subject"),
        message: fd.get("message"),
        website: fd.get("website"),
        page: pathname ?? "",
      }),
    }).catch(() => null);

    const data = res
      ? ((await res.json().catch(() => ({}))) as { ok?: boolean; error?: string })
      : {};

    setBusy(false);
    if (!res || !res.ok || !data.ok) {
      setError(data.error ?? "That did not send. Please try again.");
      return;
    }
    form.reset();
    setDone(true);
  }

  if (done) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="surface flex items-start gap-3 p-6"
      >
        <Check size={18} className="mt-0.5 shrink-0 text-leaf" />
        <div>
          <p className="text-[0.92rem] text-ink">{copy.done}</p>
          <button
            onClick={() => setDone(false)}
            className="mt-3 text-[0.72rem] uppercase tracking-[0.16em] text-gold hover:text-sindoor"
          >
            Send another
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <form onSubmit={submit} className={compact ? "" : "surface p-6 sm:p-8"}>
      <fieldset disabled={busy} className="space-y-4">
        {/* Never shown, never filled by a person. */}
        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="absolute h-0 w-0 overflow-hidden opacity-0"
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name" required>
            <input
              name="name"
              required
              maxLength={120}
              placeholder={copy.namePlaceholder}
              className="field"
            />
          </Field>

          {copy.orgLabel && (
            <Field label={copy.orgLabel}>
              <input name="organisation" maxLength={160} className="field" />
            </Field>
          )}

          <Field label="Email">
            <input name="email" type="email" maxLength={160} className="field" />
          </Field>

          <Field label="Phone or WhatsApp">
            <input name="phone" inputMode="tel" maxLength={16} className="field" />
          </Field>

          {copy.subjectLabel && (
            <div className="sm:col-span-2">
              <Field label={copy.subjectLabel}>
                <input name="subject" maxLength={160} className="field" />
              </Field>
            </div>
          )}
        </div>

        <Field label={copy.messageLabel} required>
          <textarea
            name="message"
            required
            rows={compact ? 3 : 5}
            maxLength={4000}
            placeholder={copy.messagePlaceholder}
            className="field resize-y"
          />
        </Field>

        <p className="text-[0.7rem] leading-relaxed text-ink-faint">
          One of an email address or a phone number is enough, and we need one
          of them to answer you. Nothing here is published, sold or passed on.
        </p>

        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              role="alert"
              className="border border-sindoor/40 bg-sindoor/8 p-3 text-[0.8rem] text-sindoor"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        <button className="btn btn-primary">
          {busy ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Send size={14} />
          )}
          {copy.button}
        </button>
      </fieldset>
    </form>
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
