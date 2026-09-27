"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Send, X } from "lucide-react";
import DhakiDa from "@/components/DhakiDa";
import { GUIDE } from "@/lib/guide";

type Msg = { role: "user" | "assistant"; content: string };

const EASE = [0.22, 1, 0.36, 1] as const;

const OPENERS = [
  "When is Sandhi Puja?",
  "How do I donate?",
  "What is Nabapatrika?",
  "Who can volunteer?",
];

/**
 * Dhaki-da, the site's AI guide, answering from this site's own content.
 * With no API key configured it still works, falling back to a
 * keyword search over the same material on the server.
 */
export default function PujoGuide() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scroller.current?.scrollTo({
      top: scroller.current.scrollHeight,
      behavior: "smooth",
    });
  }, [msgs, busy]);

  // Closing the panel when the reader navigates away. The path is the
  // event; there is nothing to derive it from within a single render.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setOpen(false), [pathname]);

  async function ask(text: string) {
    const question = text.trim();
    if (!question || busy) return;

    const next: Msg[] = [...msgs, { role: "user", content: question }];
    setMsgs(next);
    setInput("");
    setBusy(true);

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: next.slice(-8) }),
      });
      const data = (await res.json()) as { reply?: string; error?: string };
      setMsgs((m) => [
        ...m,
        {
          role: "assistant",
          content:
            data.reply ??
            data.error ??
            "Something went wrong. Try the pages in the menu above.",
        },
      ]);
    } catch {
      setMsgs((m) => [
        ...m,
        {
          role: "assistant",
          content:
            "I could not reach the server. Check your connection and try again.",
        },
      ]);
    } finally {
      setBusy(false);
    }
  }

  if (pathname?.startsWith("/admin")) return null;

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? `Close ${GUIDE.name}` : `Ask ${GUIDE.name}, the ${GUIDE.tag}`}
        title={GUIDE.alt}
        className="no-print fixed bottom-5 right-5 z-[90] grid h-14 w-14 place-items-center rounded-full border border-gold/50 bg-paper-3 text-gold shadow-lg transition-all duration-500 hover:scale-105 hover:border-gold sm:bottom-7 sm:right-7"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={open ? "x" : "s"}
            initial={{ opacity: 0, rotate: -40 }}
            animate={{ opacity: 1, rotate: 0 }}
            exit={{ opacity: 0, rotate: 40 }}
            transition={{ duration: 0.25 }}
          >
            {open ? <X size={18} /> : <DhakiDa size={48} title={null} />}
          </motion.span>
        </AnimatePresence>
      </button>

      <AnimatePresence>
        {open && (
          <motion.aside
            initial={{ opacity: 0, y: 18, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.97 }}
            transition={{ duration: 0.45, ease: EASE }}
            className="no-print surface fixed bottom-20 right-4 z-[90] flex max-h-[min(30rem,70dvh)] w-[min(23rem,calc(100vw-2rem))] flex-col overflow-hidden sm:bottom-24 sm:right-7"
          >
            <header className="flex items-center gap-3 border-b border-line px-4 py-3">
              <DhakiDa size={40} />
              <div className="min-w-0 flex-1">
                <p className="font-display text-[1rem] leading-tight text-ink">
                  {GUIDE.name}
                  <span className="bangla-display ml-2 text-[0.85rem] text-gold">{GUIDE.nameBn}</span>
                </p>
                <p className="mt-0.5 text-[0.55rem] uppercase tracking-[0.2em] text-ink-faint">
                  {GUIDE.tag} · answers from this site only
                </p>
              </div>
            </header>

            <div ref={scroller} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
              {msgs.length === 0 && (
                <div>
                  <p className="text-[0.82rem] leading-relaxed text-ink-soft">{GUIDE.greeting}</p>
                  <p className="bangla mt-2 text-[0.8rem] leading-relaxed text-ink-faint">{GUIDE.greetingBn}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {OPENERS.map((q) => (
                      <button
                        key={q}
                        onClick={() => ask(q)}
                        className="border border-line px-2.5 py-1.5 text-[0.7rem] text-ink-soft transition-colors hover:border-gold hover:text-gold"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {msgs.map((m, i) => (
                <div
                  key={i}
                  className={m.role === "user" ? "flex justify-end" : ""}
                >
                  <p
                    className={`max-w-[92%] whitespace-pre-wrap px-3 py-2 text-[0.82rem] leading-relaxed ${
                      m.role === "user"
                        ? "bg-sindoor text-paper-3"
                        : "border border-line bg-paper-2/50 text-ink"
                    }`}
                  >
                    {m.content}
                  </p>
                </div>
              ))}

              {busy && (
                <p className="flex gap-1 px-3 py-2 text-ink-faint" aria-label="Thinking">
                  {[0, 1, 2].map((i) => (
                    <motion.span
                      key={i}
                      className="inline-block h-1.5 w-1.5 rounded-full bg-gold"
                      animate={{ opacity: [0.25, 1, 0.25] }}
                      transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.18 }}
                    />
                  ))}
                </p>
              )}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                ask(input);
              }}
              className="flex items-center gap-2 border-t border-line p-3"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={`Ask ${GUIDE.name}…`}
                className="field !py-2 !text-[0.82rem]"
                aria-label="Your question"
              />
              <button
                type="submit"
                disabled={busy || !input.trim()}
                aria-label="Send"
                className="grid h-9 w-9 shrink-0 place-items-center bg-sindoor text-paper-3 transition-opacity disabled:opacity-40"
              >
                <Send size={15} />
              </button>
            </form>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
