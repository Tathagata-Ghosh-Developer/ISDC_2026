"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Check, Link2, Sparkles, Volume2, VolumeX } from "lucide-react";
import Chalchitra from "./Chalchitra";
import { Desk as Engine, type LayerState } from "@/lib/audio/engine";
import {
  DESK_LAYERS,
  PRESETS,
  WIDTHS,
  DEFAULT_PRESET,
  CITY_POLE,
  VILLAGE_POLE,
  valuesToMix,
  mixToValues,
  encodeMix,
  decodeMix,
  type Mix,
} from "@/lib/content/desk";
import type { AmbienceLayer } from "@/lib/content/music";

type Layer = AmbienceLayer & { src: string; local: boolean };

const STORE = "isdc-gaan-v1";

function presetMix(slug: string): Mix {
  const p = PRESETS.find((x) => x.slug === slug) ?? PRESETS[0];
  return valuesToMix(p.values);
}

export default function Desk({
  layers,
  started,
  onStarted,
  ducked,
}: {
  layers: Layer[];
  started: boolean;
  onStarted: () => void;
  /** True while a song is playing on the shelves below. */
  ducked: boolean;
}) {
  const engine = useRef<Engine | null>(null);
  const [mix, setMix] = useState<Mix>(() => presetMix(DEFAULT_PRESET));
  const [master, setMaster] = useState(85);
  const [muted, setMuted] = useState(false);
  const [width, setWidth] = useState("normal");
  const [living, setLiving] = useState(true);
  const [preset, setPreset] = useState<string | null>(DEFAULT_PRESET);
  const [cityVillage, setCityVillage] = useState(0);
  const [states, setStates] = useState<LayerState[]>([]);
  const [shots, setShots] = useState<{ id: string; at: number }[]>([]);
  const [copied, setCopied] = useState(false);
  const [restored, setRestored] = useState(false);
  const [tip, setTip] = useState<string | null>(null);
  const undoMix = useRef<Mix | null>(null);

  /* ---------- a shared link wins, then the last mix on this device ---------- */
  useEffect(() => {
    const shared = new URLSearchParams(window.location.search).get("mix");
    if (shared) {
      const decoded = decodeMix(shared);
      if (Object.keys(decoded).length) {
        setMix(decoded);
        setPreset(null);
        return;
      }
    }
    try {
      const raw = localStorage.getItem(STORE);
      if (!raw) return;
      const saved = JSON.parse(raw) as {
        mix?: Mix;
        master?: number;
        width?: string;
        living?: boolean;
      };
      if (saved.mix && Object.keys(saved.mix).length) {
        setMix(saved.mix);
        setPreset(null);
        setRestored(true);
      }
      if (typeof saved.master === "number") setMaster(saved.master);
      if (saved.width) setWidth(saved.width);
      if (typeof saved.living === "boolean") setLiving(saved.living);
    } catch {
      /* private window, or a shape from an older version */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORE,
        JSON.stringify({ mix, master, width, living }),
      );
    } catch {
      /* not worth complaining about */
    }
  }, [mix, master, width, living]);

  /* ---------- the engine ---------- */
  useEffect(() => {
    const sources = Object.fromEntries(layers.map((l) => [l.id, l.src]));
    const e = new Engine(sources);
    e.subscribe(setStates);
    engine.current = e;
    return () => {
      e.destroy();
      engine.current = null;
    };
  }, [layers]);

  useEffect(() => {
    if (started) void engine.current?.setMix(mix);
  }, [mix, started]);

  useEffect(() => engine.current?.setMaster(master), [master]);
  useEffect(() => engine.current?.setMuted(muted), [muted]);
  useEffect(() => engine.current?.setLiving(living), [living]);
  useEffect(() => {
    const w = WIDTHS.find((x) => x.id === width);
    if (w) engine.current?.setWidth(w.factor);
  }, [width]);
  useEffect(() => engine.current?.setDucked(ducked), [ducked]);

  /* ---------- one-shots feed the backdrop ---------- */
  useEffect(() => {
    if (!started) return;
    const id = window.setInterval(() => {
      const drained = engine.current?.drainShots() ?? [];
      if (drained.length) setShots(drained);
      else setShots((s) => (s.length ? [] : s));
    }, 250);
    return () => window.clearInterval(id);
  }, [started]);

  /* ---------- the first press ---------- */
  const begin = useCallback(async () => {
    await engine.current?.start(mix);
    onStarted();
    setTip("প্রতিটি ফেডার ধরে টানুন · drag any fader");
    setTimeout(() => setTip(null), 6000);
  }, [mix, onStarted]);

  /* ---------- controls ---------- */
  function setLayer(id: string, value: number) {
    setMix((m) => ({ ...m, [id]: value }));
    setPreset(null);
    void engine.current?.setLayer(id, value);
  }

  function applyPreset(slug: string) {
    const next = presetMix(slug);
    undoMix.current = mix;
    setMix(next);
    setPreset(slug);
    setCityVillage(slug === "nodir-dhare" ? 100 : slug === "nabamir-raat" ? 0 : cityVillage);
  }

  function applyMacro(c: number) {
    setCityVillage(c);
    const next: Mix = {};
    DESK_LAYERS.forEach((l, i) => {
      next[l.id] = Math.round(
        CITY_POLE[i] + ((VILLAGE_POLE[i] ?? 0) - (CITY_POLE[i] ?? 0)) * (c / 100),
      );
    });
    setMix(next);
    setPreset(null);
  }

  function silence() {
    if (undoMix.current && Object.values(mix).every((v) => v === 0)) {
      setMix(undoMix.current);
      undoMix.current = null;
      return;
    }
    undoMix.current = mix;
    setMix(valuesToMix(DESK_LAYERS.map(() => 0)));
    setPreset(null);
  }

  async function share() {
    const url = `${window.location.origin}${window.location.pathname}?mix=${encodeMix(mix)}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      window.prompt("Copy this link", url);
    }
  }

  /* ---------- keyboard ---------- */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      const tag = el?.tagName;
      if (tag === "TEXTAREA" || el?.isContentEditable) return;
      if (tag === "INPUT" && (el as HTMLInputElement).type !== "range") return;

      if (e.code === "Space") {
        e.preventDefault();
        if (!started) void begin();
        else setMuted((m) => !m);
        return;
      }
      if (e.key === "m" || e.key === "M") setMuted((m) => !m);
      if (e.key === "v" || e.key === "V") setLiving((l) => !l);
      if (e.key === "r" || e.key === "R") silence();
      if (e.key === "p" || e.key === "P") {
        const i = PRESETS.findIndex((p) => p.slug === preset);
        const next = PRESETS[(i + (e.shiftKey ? -1 : 1) + PRESETS.length) % PRESETS.length];
        applyPreset(next.slug);
      }
      if (tag !== "INPUT") {
        if (e.key === "ArrowRight") applyMacro(Math.min(100, cityVillage + (e.shiftKey ? 1 : 5)));
        if (e.key === "ArrowLeft") applyMacro(Math.max(0, cityVillage - (e.shiftKey ? 1 : 5)));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started, preset, cityVillage, mix]);

  const stateOf = (id: string) => states.find((s) => s.id === id);
  const anyOn = Object.values(mix).some((v) => v > 0);

  return (
    <div>
      <Chalchitra mix={mix} city={cityVillage} playing={started && !muted} shots={shots} />

      {/* ---------------- the gate ---------------- */}
      {!started && (
        <div className="surface border-t-0 p-7 text-center sm:p-10">
          <button
            onClick={begin}
            className="group relative mx-auto grid h-24 w-24 place-items-center rounded-full bg-sindoor text-paper-3 transition-transform duration-500 hover:scale-105"
            aria-label="Begin"
          >
            <span className="absolute inset-0 rounded-full border border-haldi opacity-0 [animation:gate-ring_3.4s_steps(4)_infinite]" />
            <svg viewBox="0 0 24 24" width="30" height="30" aria-hidden>
              <path d="M8 5 L20 12 L8 19 Z" fill="currentColor" />
            </svg>
          </button>
          <p className="mt-6 text-[0.72rem] uppercase tracking-[0.3em] text-ink-faint">
            এগারোটি শব্দ · দুশো এক গান · একটি ঘর
          </p>
          <p className="mt-1.5 text-[0.7rem] uppercase tracking-[0.24em] text-ink-faint">
            Eleven sounds, two hundred and one songs, one room
          </p>
          {restored && (
            <p className="mt-5 text-[0.75rem] text-gold">
              আপনার শেষ মিক্স · your last mix is loaded
            </p>
          )}
          <style>{`@keyframes gate-ring{0%{transform:scale(1);opacity:.85}100%{transform:scale(1.28);opacity:0}}`}</style>
        </div>
      )}

      {/* ---------------- the desk ---------------- */}
      {started && (
        <div className="surface border-t-0">
          {/* presets */}
          <div
            role="radiogroup"
            aria-label="Presets"
            className="flex gap-1 overflow-x-auto border-b border-line px-4 py-3"
          >
            {PRESETS.map((p) => {
              const on = preset === p.slug;
              return (
                <button
                  key={p.slug}
                  role="radio"
                  aria-checked={on}
                  onClick={() => applyPreset(p.slug)}
                  className={`shrink-0 px-3 py-2 text-left transition-colors ${
                    on ? "bg-sindoor text-paper-3" : "text-ink-soft hover:text-ink"
                  }`}
                >
                  <span className="bangla-display block text-[1rem] leading-tight">
                    {p.bangla}
                  </span>
                  <span className="block text-[0.58rem] uppercase tracking-[0.16em] opacity-80">
                    {p.roman}
                  </span>
                </button>
              );
            })}
          </div>

          {/* faders */}
          <div className="flex gap-px overflow-x-auto bg-line">
            {DESK_LAYERS.map((layer) => {
              const meta = layers.find((l) => l.id === layer.id);
              const value = mix[layer.id] ?? 0;
              const st = stateOf(layer.id);
              const gap = Math.round(110 - value);
              return (
                <div
                  key={layer.id}
                  className="flex min-w-[5.2rem] flex-1 flex-col items-center bg-paper px-2 py-4"
                >
                  <span className="font-display text-[0.8rem] tabular-nums text-ink-soft">
                    {value}
                  </span>

                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={value}
                    onChange={(e) => setLayer(layer.id, Number(e.target.value))}
                    onFocus={() => setTip(meta?.description ?? null)}
                    onBlur={() => setTip(null)}
                    aria-label={`${layer.roman} level`}
                    aria-valuetext={
                      layer.kind === "punct"
                        ? `presence ${value}, roughly every ${gap} seconds`
                        : `${value} of 100`
                    }
                    className="my-3 h-[9rem] w-6 accent-[var(--c-sindoor)] sm:h-[13rem]"
                    style={{
                      writingMode: "vertical-lr",
                      direction: "rtl",
                    }}
                  />

                  <span className="flex items-center gap-1.5">
                    {st?.rising && living && (
                      <span className="h-1.5 w-1.5 rounded-full bg-sindoor" aria-hidden />
                    )}
                    <span className="bangla-display text-center text-[0.9rem] leading-tight text-ink">
                      {layer.bangla}
                    </span>
                  </span>
                  <span className="mt-0.5 text-center text-[0.55rem] uppercase tracking-[0.1em] text-ink-faint">
                    {layer.roman}
                  </span>
                  {st?.transport === "element" && (
                    <span className="mt-1 text-[0.5rem] uppercase tracking-[0.1em] text-gold">
                      streamed
                    </span>
                  )}
                  {st?.transport === "failed" && value > 0 && (
                    <span className="mt-1 text-[0.5rem] uppercase tracking-[0.1em] text-sindoor">
                      unreachable
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* the city to village macro */}
          <div className="border-t border-line px-5 py-4">
            <div className="flex items-baseline justify-between">
              <span className="bangla-display text-[1.05rem] text-sindoor">শহর</span>
              <span className="text-[0.58rem] uppercase tracking-[0.2em] text-ink-faint">
                one slider, twelve consequences
              </span>
              <span className="bangla-display text-[1.05rem] text-indigo">গ্রাম</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={cityVillage}
              onChange={(e) => applyMacro(Number(e.target.value))}
              aria-label="From the city to the village"
              className="mt-2 w-full accent-[var(--c-sindoor)]"
            />
          </div>

          {/* master row */}
          <div className="flex flex-wrap items-center gap-3 border-t border-line px-5 py-4">
            <button
              onClick={() => setMuted((m) => !m)}
              className="btn btn-ghost !py-2 !text-[0.65rem]"
            >
              {muted ? <VolumeX size={13} /> : <Volume2 size={13} />}
              {muted ? "Unmute" : "Mute"}
            </button>

            <label className="flex min-w-[9rem] flex-1 items-center gap-2.5 sm:max-w-[14rem]">
              <span className="text-[0.58rem] uppercase tracking-[0.18em] text-ink-faint">
                Master
              </span>
              <input
                type="range"
                min={0}
                max={100}
                value={master}
                onChange={(e) => setMaster(Number(e.target.value))}
                aria-label="Master level"
                className="w-full accent-[var(--c-sindoor)]"
              />
            </label>

            <div className="flex gap-1">
              {WIDTHS.map((w) => (
                <button
                  key={w.id}
                  onClick={() => setWidth(w.id)}
                  className={`border px-2 py-1.5 text-[0.58rem] uppercase tracking-[0.12em] transition-colors ${
                    width === w.id
                      ? "border-sindoor text-sindoor"
                      : "border-line text-ink-faint hover:border-gold"
                  }`}
                >
                  {w.roman}
                </button>
              ))}
            </div>

            <button
              onClick={() => setLiving((l) => !l)}
              className={`btn btn-ghost !py-2 !text-[0.65rem] ${living ? "!border-gold !text-gold" : ""}`}
              title="Each sound rises and falls a little on its own"
            >
              <Sparkles size={13} /> {living ? "Living" : "Static"}
            </button>

            <button onClick={silence} className="btn btn-ghost !py-2 !text-[0.65rem]">
              {anyOn ? "Silence" : "Undo"}
            </button>

            <button
              onClick={share}
              disabled={!anyOn}
              className="btn btn-ghost !py-2 !text-[0.65rem] disabled:opacity-40"
            >
              {copied ? <Check size={13} /> : <Link2 size={13} />}
              {copied ? "Copied" : "Share this mix"}
            </button>
          </div>

          {/* the hint line */}
          <div className="min-h-[2.4rem] border-t border-line px-5 py-2.5">
            {ducked && (
              <span className="text-[0.7rem] text-gold">
                A song is playing, so the room has stepped back.
              </span>
            )}
            {!ducked && tip && (
              <span className="text-[0.72rem] leading-relaxed text-ink-soft">
                {tip.slice(0, 120)}
              </span>
            )}
            {!ducked && !tip && (
              <span className="text-[0.62rem] uppercase tracking-[0.18em] text-ink-faint">
                Space mute · P preset · V living · R silence · arrows city to village
              </span>
            )}
          </div>
        </div>
      )}

      <p className="mt-3 text-[0.68rem] leading-relaxed text-ink-faint">
        {mixToValues(mix).filter((v) => v > 0).length} of {DESK_LAYERS.length}{" "}
        layers open.
      </p>
    </div>
  );
}
