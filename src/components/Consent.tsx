"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";

/* ================================================================
   Asking, rather than taking.

   The committee wants to know who comes to this site and what they
   read. There are two ways to find that out. Taking it quietly caps
   what may lawfully be collected at things that are about nobody: a
   path, a day, a count. Asking for it allows a great deal more, kept
   for longer, joined into a journey, because the visitor agreed.

   So this asks. It is one short notice, it says what is collected in
   plain words before anybody agrees to anything, and No is as easy to
   press as Yes. Nothing detailed is recorded until Yes is pressed, and
   pressing No later deletes the visit that was recorded.

   The counting that needs no permission carries on either way, because
   nothing in it is about a person.
   ================================================================ */

const KEY = "isdc-consent";
export type Consent = "granted" | "denied";

export function readConsent(): Consent | null {
  try {
    const v = localStorage.getItem(KEY);
    return v === "granted" || v === "denied" ? v : null;
  } catch {
    return null;
  }
}

function writeConsent(v: Consent) {
  try {
    localStorage.setItem(KEY, v);
  } catch {
    /* private window */
  }
  window.dispatchEvent(new CustomEvent("isdc-consent", { detail: v }));
}

export default function ConsentNotice() {
  const [show, setShow] = useState(false);
  const [detail, setDetail] = useState(false);

  useEffect(() => {
    // Only ever shown to somebody who has not answered.
    const t = setTimeout(() => {
      if (readConsent() === null) setShow(true);
    }, 1200);
    return () => clearTimeout(t);
  }, []);

  function answer(v: Consent) {
    writeConsent(v);
    setShow(false);
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          role="dialog"
          aria-label="How this site counts visits"
          className="fixed inset-x-0 bottom-0 z-50 px-4 pb-4 sm:px-5 sm:pb-5"
        >
          <div className="surface mx-auto max-w-[44rem] p-5 shadow-[0_-8px_40px_rgba(42,26,16,0.18)] sm:p-6">
            <p className="bangla-display text-[1.15rem] leading-tight text-sindoor">
              একটু জিজ্ঞেস করি
            </p>
            <h2 className="font-display mt-1 text-[1.05rem] text-ink">
              May we see how you use this site?
            </h2>

            <p className="mt-3 text-[0.85rem] leading-relaxed text-ink-soft">
              We already count how many people visit each page, which
              involves nothing about anybody. If you say yes, we also record
              your path through the site for this visit: which pages, in what
              order, how long, and what you pressed. It helps a student
              committee work out what is worth writing next year.
            </p>

            {detail && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                className="overflow-hidden"
              >
                <div className="mt-4 border-l-2 border-gold/50 pl-4 text-[0.8rem] leading-relaxed text-ink-soft">
                  <p className="text-ink">If you say yes, we record</p>
                  <ul className="mt-1.5 space-y-1">
                    <li>the pages you open, in order, and how long on each</li>
                    <li>how far down each page you read</li>
                    <li>what you press: play, copy, directions, the forms</li>
                    <li>
                      the site or link that sent you here, and the campaign tag
                      if there was one
                    </li>
                    <li>
                      your screen size, language, time zone, browser and whether
                      you prefer a dark screen
                    </li>
                  </ul>
                  <p className="mt-3 text-ink">What we never record</p>
                  <ul className="mt-1.5 space-y-1">
                    <li>your name, unless you type it into a form yourself</li>
                    <li>your IP address, hashed or otherwise</li>
                    <li>
                      any fingerprint, and nothing that follows you to another
                      website
                    </li>
                  </ul>
                  <p className="mt-3">
                    The visit is a random number kept in this browser. We cannot
                    turn it back into a person. Everything is deleted after six
                    months, and saying no later deletes it at once.
                  </p>
                </div>
              </motion.div>
            )}

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button onClick={() => answer("granted")} className="btn btn-primary">
                Yes, that is fine
              </button>
              <button onClick={() => answer("denied")} className="btn btn-ghost">
                No thank you
              </button>
              <button
                onClick={() => setDetail((d) => !d)}
                className="text-[0.75rem] uppercase tracking-[0.16em] text-ink-faint underline-offset-4 hover:text-gold hover:underline"
              >
                {detail ? "Less" : "What exactly?"}
              </button>
              <Link
                href="/thikana#write-to-us"
                className="ml-auto text-[0.7rem] text-ink-faint hover:text-gold"
              >
                Questions
              </Link>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
