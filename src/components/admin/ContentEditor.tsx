"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, RotateCcw, Save } from "lucide-react";

type Group = { key: string; label: string; form: "fields" | "json" };
type Json = unknown;

function isObj(v: Json): v is Record<string, Json> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function humanise(key: string): string {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/[_-]/g, " ")
    .replace(/^./, (c) => c.toUpperCase())
    .trim();
}

export default function ContentEditor({
  groups,
  current,
  defaults,
}: {
  groups: Group[];
  current: Record<string, Json>;
  defaults: Record<string, Json>;
}) {
  return (
    <div className="space-y-4">
      {groups.map((g) => (
        <GroupCard
          key={g.key}
          group={g}
          value={current[g.key]}
          fallback={defaults[g.key]}
        />
      ))}
    </div>
  );
}

function GroupCard({
  group,
  value,
  fallback,
}: {
  group: Group;
  value: Json;
  fallback: Json;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Json>(value);
  const [raw, setRaw] = useState(() => JSON.stringify(value, null, 2));
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function save() {
    let payload: Json = draft;

    if (group.form === "json") {
      try {
        payload = JSON.parse(raw);
      } catch (err) {
        setState("error");
        setMessage(
          err instanceof Error ? `Not valid JSON — ${err.message}` : "Not valid JSON.",
        );
        return;
      }
    }

    setState("saving");
    setMessage(null);

    const res = await fetch("/api/admin/config", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ key: group.key, value: payload }),
    }).catch(() => null);

    const data = res ? ((await res.json().catch(() => ({}))) as { error?: string }) : {};
    if (!res || !res.ok) {
      setState("error");
      setMessage(data.error ?? "Could not save.");
      return;
    }

    setState("saved");
    setTimeout(() => setState("idle"), 2200);
    router.refresh();
  }

  async function reset() {
    if (!confirm(`Reset "${group.label}" to the built-in default?`)) return;
    setState("saving");
    await fetch(`/api/admin/config?key=${group.key}`, { method: "DELETE" });
    setDraft(fallback);
    setRaw(JSON.stringify(fallback, null, 2));
    setState("idle");
    router.refresh();
  }

  return (
    <section className="surface">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 p-5 text-left"
      >
        <span>
          <span className="block text-[1rem] text-ink">{group.label}</span>
          <span className="block text-[0.62rem] uppercase tracking-[0.2em] text-ink-faint">
            {group.key}
            {group.form === "json" ? " · raw JSON" : ""}
          </span>
        </span>
        <span className="text-[0.7rem] uppercase tracking-[0.2em] text-gold">
          {open ? "Close" : "Edit"}
        </span>
      </button>

      {open && (
        <div className="border-t border-line p-5">
          {group.form === "fields" ? (
            <Fields value={draft} onChange={setDraft} />
          ) : (
            <textarea
              value={raw}
              onChange={(e) => setRaw(e.target.value)}
              spellCheck={false}
              rows={Math.min(30, raw.split("\n").length + 2)}
              className="field w-full resize-y font-mono !text-[0.72rem] leading-relaxed"
            />
          )}

          {message && (
            <p
              className={`mt-4 border p-3 text-[0.78rem] ${
                state === "error"
                  ? "border-sindoor/40 text-sindoor"
                  : "border-leaf/40 text-leaf"
              }`}
            >
              {message}
            </p>
          )}

          <div className="mt-5 flex flex-wrap gap-2 border-t border-line pt-4">
            <button
              onClick={save}
              disabled={state === "saving"}
              className="btn btn-primary !py-2 !text-[0.68rem]"
            >
              {state === "saving" ? (
                <Loader2 size={13} className="animate-spin" />
              ) : state === "saved" ? (
                <Check size={13} />
              ) : (
                <Save size={13} />
              )}
              {state === "saved" ? "Saved" : "Save"}
            </button>
            <button onClick={reset} className="btn btn-ghost !py-2 !text-[0.68rem]">
              <RotateCcw size={13} /> Reset to default
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

/** Renders a settings object as a form, one level of nesting deep. */
function Fields({
  value,
  onChange,
  depth = 0,
}: {
  value: Json;
  onChange: (next: Json) => void;
  depth?: number;
}) {
  if (!isObj(value)) {
    return (
      <textarea
        value={JSON.stringify(value, null, 2)}
        onChange={(e) => {
          try {
            onChange(JSON.parse(e.target.value));
          } catch {
            /* keep typing */
          }
        }}
        rows={4}
        className="field font-mono !text-[0.72rem]"
      />
    );
  }

  return (
    <div className={depth === 0 ? "grid gap-4 sm:grid-cols-2" : "grid gap-3"}>
      {Object.entries(value).map(([k, v]) => {
        const set = (next: Json) => onChange({ ...value, [k]: next });

        if (typeof v === "boolean") {
          return (
            <label key={k} className="flex items-center gap-2.5 text-[0.82rem] text-ink">
              <input
                type="checkbox"
                checked={v}
                onChange={(e) => set(e.target.checked)}
                className="accent-[var(--c-sindoor)]"
              />
              {humanise(k)}
            </label>
          );
        }

        if (typeof v === "number") {
          return (
            <label key={k} className="block">
              <Lbl>{humanise(k)}</Lbl>
              <input
                type="number"
                value={v}
                onChange={(e) => set(Number(e.target.value))}
                className="field mt-1.5"
              />
            </label>
          );
        }

        if (typeof v === "string") {
          const long = v.length > 70;
          return (
            <label key={k} className={`block ${long ? "sm:col-span-2" : ""}`}>
              <Lbl>{humanise(k)}</Lbl>
              {long ? (
                <textarea
                  value={v}
                  rows={3}
                  onChange={(e) => set(e.target.value)}
                  className="field mt-1.5 resize-y"
                />
              ) : (
                <input
                  value={v}
                  onChange={(e) => set(e.target.value)}
                  className="field mt-1.5"
                />
              )}
            </label>
          );
        }

        if (Array.isArray(v) && v.every((x) => typeof x === "number")) {
          return (
            <label key={k} className="block">
              <Lbl>{humanise(k)} — comma separated</Lbl>
              <input
                value={v.join(", ")}
                onChange={(e) =>
                  set(
                    e.target.value
                      .split(",")
                      .map((s) => Number(s.trim()))
                      .filter((n) => Number.isFinite(n)),
                  )
                }
                className="field mt-1.5"
              />
            </label>
          );
        }

        if (isObj(v)) {
          return (
            <fieldset
              key={k}
              className="border border-line p-4 sm:col-span-2"
            >
              <legend className="px-2 text-[0.62rem] uppercase tracking-[0.22em] text-gold">
                {humanise(k)}
              </legend>
              <Fields value={v} onChange={set} depth={depth + 1} />
            </fieldset>
          );
        }

        return (
          <label key={k} className="block sm:col-span-2">
            <Lbl>{humanise(k)}</Lbl>
            <textarea
              defaultValue={JSON.stringify(v, null, 2)}
              onChange={(e) => {
                try {
                  set(JSON.parse(e.target.value));
                } catch {
                  /* keep typing */
                }
              }}
              rows={4}
              className="field mt-1.5 font-mono !text-[0.72rem]"
            />
          </label>
        );
      })}
    </div>
  );
}

function Lbl({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[0.62rem] uppercase tracking-[0.22em] text-ink-soft">
      {children}
    </span>
  );
}
