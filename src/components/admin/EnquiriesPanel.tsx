"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Eye, Loader2, RefreshCw, Trash2, TriangleAlert } from "lucide-react";
import { WhatsappIcon } from "@/components/BrandIcons";
import { formatDateTime } from "@/lib/format";

type Kind = "sponsor" | "institute" | "feedback" | "general";
type Status = "new" | "seen" | "done" | "spam";

export type Enquiry = {
  id: string;
  kind: Kind;
  name: string;
  organisation: string | null;
  email: string | null;
  phone: string | null;
  subject: string | null;
  message: string;
  page: string | null;
  status: Status;
  admin_note: string | null;
  handled_by: string | null;
  created_at: string;
};

const KINDS: { value: string; label: string }[] = [
  { value: "all", label: "Everything" },
  { value: "sponsor", label: "Sponsors" },
  { value: "institute", label: "Institutes" },
  { value: "feedback", label: "Feedback" },
  { value: "general", label: "Other" },
];

const STATUSES: { value: string; label: string }[] = [
  { value: "new", label: "Unread" },
  { value: "seen", label: "Read" },
  { value: "done", label: "Answered" },
  { value: "spam", label: "Spam" },
  { value: "all", label: "All" },
];

const KIND_LABEL: Record<Kind, string> = {
  sponsor: "Sponsorship",
  institute: "Another institute",
  feedback: "Feedback",
  general: "General",
};

export default function EnquiriesPanel({ role }: { role: "admin" | "committee" }) {
  const [rows, setRows] = useState<Enquiry[]>([]);
  const [kind, setKind] = useState("all");
  const [status, setStatus] = useState("new");
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const res = await fetch(
      `/api/admin/enquiries?kind=${kind}&status=${status}`,
    ).catch(() => null);
    if (!res || !res.ok) {
      setError("Could not load messages.");
      setLoading(false);
      return;
    }
    const data = (await res.json()) as { enquiries?: Enquiry[] };
    setRows(data.enquiries ?? []);
    setLoading(false);
  }, [kind, status]);

  // Fetching on mount and whenever the filter changes. The loader
  // raises its own loading flag before awaiting, which is what the
  // rule sees; the alternative is a spinner that appears one render
  // late.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  async function mark(id: string, next: Status) {
    setWorking(id);
    const res = await fetch("/api/admin/enquiries", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id, status: next }),
    }).catch(() => null);
    setWorking(null);
    if (!res || !res.ok) {
      setError("That did not go through.");
      return;
    }
    if (status === "all") {
      setRows((rs) => rs.map((r) => (r.id === id ? { ...r, status: next } : r)));
    } else {
      setRows((rs) => rs.filter((r) => r.id !== id));
    }
  }

  async function remove(id: string) {
    setWorking(id);
    const res = await fetch("/api/admin/enquiries", {
      method: "DELETE",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id }),
    }).catch(() => null);
    setWorking(null);
    if (!res || !res.ok) {
      setError("Could not delete that.");
      return;
    }
    setRows((rs) => rs.filter((r) => r.id !== id));
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex flex-wrap gap-1">
          {KINDS.map((k) => (
            <button
              key={k.value}
              onClick={() => setKind(k.value)}
              className={`border px-3 py-1.5 text-[0.7rem] uppercase tracking-[0.14em] transition-colors ${
                kind === k.value
                  ? "border-sindoor bg-sindoor text-paper-3"
                  : "border-line text-ink-faint hover:border-gold hover:text-gold"
              }`}
            >
              {k.label}
            </button>
          ))}
        </div>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="field !w-auto !py-1.5 !text-[0.72rem]"
        >
          {STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>

        <button
          onClick={() => void load()}
          className="btn btn-ghost !py-2 !text-[0.68rem]"
        >
          <RefreshCw size={13} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {error && (
        <p className="mt-4 border border-sindoor/40 p-3 text-[0.8rem] text-sindoor" role="alert">
          {error}
        </p>
      )}

      <div className="mt-6 space-y-3">
        {loading && rows.length === 0 && (
          <p className="py-12 text-center">
            <Loader2 size={16} className="mx-auto animate-spin text-ink-faint" />
          </p>
        )}

        {!loading && rows.length === 0 && (
          <p className="surface p-8 text-center text-[0.85rem] text-ink-soft">
            Nothing here.
          </p>
        )}

        <AnimatePresence initial={false}>
          {rows.map((e) => (
            <motion.article
              key={e.id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.3 }}
              className="surface p-5"
            >
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <h3 className="text-[1.05rem] text-ink">{e.name}</h3>
                {e.organisation && (
                  <span className="text-[0.82rem] text-ink-soft">
                    {e.organisation}
                  </span>
                )}
                <span className="border border-gold px-2 py-0.5 text-[0.55rem] uppercase tracking-[0.18em] text-gold">
                  {KIND_LABEL[e.kind]}
                </span>
                <span className="text-[0.68rem] text-ink-faint">
                  {formatDateTime(e.created_at)}
                </span>
              </div>

              {e.subject && (
                <p className="mt-2 text-[0.88rem] text-ink">{e.subject}</p>
              )}

              <p className="mt-3 whitespace-pre-wrap border-l-2 border-line pl-3 text-[0.85rem] leading-relaxed text-ink-soft">
                {e.message}
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-3 text-[0.75rem]">
                {e.email && (
                  <a
                    href={`mailto:${e.email}?subject=${encodeURIComponent(
                      "Re: " + (e.subject ?? "your message to IISc Sharodiya Durgotsab"),
                    )}`}
                    className="text-gold hover:text-sindoor"
                  >
                    {e.email}
                  </a>
                )}
                {e.phone && (
                  <a
                    href={`https://wa.me/${e.phone.replace(/\D/g, "").length === 10 ? "91" + e.phone.replace(/\D/g, "") : e.phone.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="flex items-center gap-1.5 text-leaf hover:text-sindoor"
                  >
                    <WhatsappIcon size={12} /> {e.phone}
                  </a>
                )}
                {e.page && (
                  <span className="text-ink-faint">sent from {e.page}</span>
                )}
                {e.handled_by && (
                  <span className="text-ink-faint">handled by {e.handled_by}</span>
                )}
              </div>

              <div className="mt-4 flex flex-wrap gap-2 border-t border-line pt-4">
                {e.status !== "seen" && (
                  <button
                    onClick={() => mark(e.id, "seen")}
                    disabled={working === e.id}
                    className="btn btn-ghost !py-1.5 !text-[0.65rem]"
                  >
                    <Eye size={12} /> Mark read
                  </button>
                )}
                {e.status !== "done" && (
                  <button
                    onClick={() => mark(e.id, "done")}
                    disabled={working === e.id}
                    className="btn btn-primary !py-1.5 !text-[0.65rem]"
                  >
                    <Check size={12} /> Answered
                  </button>
                )}
                {e.status !== "spam" && (
                  <button
                    onClick={() => mark(e.id, "spam")}
                    disabled={working === e.id}
                    className="btn btn-ghost !py-1.5 !text-[0.65rem]"
                  >
                    <TriangleAlert size={12} /> Spam
                  </button>
                )}
                {role === "admin" && e.status === "spam" && (
                  <button
                    onClick={() => void remove(e.id)}
                    disabled={working === e.id}
                    className="btn btn-ghost !ml-auto !border-sindoor/40 !py-1.5 !text-[0.65rem] !text-sindoor"
                  >
                    <Trash2 size={12} /> Delete
                  </button>
                )}
              </div>
            </motion.article>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
