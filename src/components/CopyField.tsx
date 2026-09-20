"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

/** A labelled value with a copy button, for bank details. */
export default function CopyField({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard blocked; the value is visible and selectable anyway */
    }
  }

  return (
    <div className="flex items-start justify-between gap-3 border-b border-line pb-3 last:border-0">
      <div className="min-w-0">
        <dt className="text-[0.6rem] uppercase tracking-[0.22em] text-ink-faint">
          {label}
        </dt>
        <dd
          className={`mt-1 break-words text-[0.88rem] text-ink ${
            mono ? "font-mono tracking-wide" : ""
          }`}
        >
          {value}
        </dd>
      </div>
      <button
        onClick={copy}
        aria-label={`Copy ${label}`}
        className="mt-3 grid h-7 w-7 shrink-0 place-items-center border border-line text-ink-faint transition-colors hover:border-gold hover:text-gold"
      >
        {copied ? <Check size={12} className="text-leaf" /> : <Copy size={12} />}
      </button>
    </div>
  );
}
