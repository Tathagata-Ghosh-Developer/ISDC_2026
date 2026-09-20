"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import MagazineReader from "./MagazineReader";

type Issue = {
  id: string;
  year: string;
  title: string;
  bangla: string;
  file: string;
  pages: number;
  note: string;
};

/** Pick an issue, then read it. Both back issues live on the same shelf. */
export default function MagazineShelf({ issues }: { issues: Issue[] }) {
  const [active, setActive] = useState(issues[0]);

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-2">
        {issues.map((issue) => {
          const on = issue.id === active.id;
          return (
            <button
              key={issue.id}
              onClick={() => setActive(issue)}
              className={`relative border px-4 py-2.5 text-left transition-colors ${
                on
                  ? "border-sindoor text-ink"
                  : "border-line text-ink-soft hover:border-gold"
              }`}
            >
              <span className="bangla-display block text-[1.05rem]">
                {issue.bangla}
              </span>
              <span className="block text-[0.62rem] uppercase tracking-[0.2em] text-ink-faint">
                {issue.pages} pages
              </span>
              {on && (
                <motion.span
                  layoutId="issue-underline"
                  className="absolute inset-x-0 -bottom-px h-0.5 bg-sindoor"
                />
              )}
            </button>
          );
        })}
      </div>

      <p className="mb-5 max-w-[60ch] text-[0.85rem] leading-relaxed text-ink-soft">
        {active.note}
      </p>

      <MagazineReader key={active.id} file={active.file} title={active.title} />
    </div>
  );
}
