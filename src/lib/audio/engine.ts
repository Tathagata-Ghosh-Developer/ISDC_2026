import {
  DESK_LAYERS,
  type DeskLayer,
  type Mix,
} from "@/lib/content/desk";

/* ================================================================
   The sound desk engine.

   Web Audio where it can be, and an honest fallback where it cannot.

   Decoding a buffer requires the file to be served with CORS headers.
   Twelve of these recordings live on a host we do not control, and if
   it ever stops sending those headers the whole desk would go silent.
   So each layer tries the real graph first and falls back to a plain
   looping media element, which works cross-origin with no permission
   at all. A fallback layer keeps its fader and its drift and loses its
   pan, its one-shots and its seamless loop. The desk tells you which
   layers are in which state rather than pretending.

   The scheduling follows the standard Web Audio look-ahead pattern: a
   250 ms interval that schedules anything falling due inside the next
   two seconds. Nothing depends on `onended`, which fires late and
   under load fires very late.
   ================================================================ */

export type Transport = "buffer" | "element" | "failed";

export type LayerState = {
  id: string;
  transport: Transport;
  /** True while this layer's slow drift sits above its own baseline. */
  rising: boolean;
};

type Bed = {
  layer: DeskLayer;
  buffer: AudioBuffer | null;
  el: HTMLAudioElement | null;
  gain: GainNode | null;
  pan: StereoPannerNode | null;
  analyser: AnalyserNode | null;
  sources: { node: AudioBufferSourceNode; xfade: GainNode; endsAt: number }[];
  nextScheduleAt: number;
  /** Two sine periods and phases, fixed at load, so drift never repeats. */
  p1: number;
  p2: number;
  ph1: number;
  ph2: number;
  lastShotAt: number;
  rising: boolean;
};

const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));

/** Equal power, because two linear ramps dip three decibels in the middle. */
function equalPowerCurves(points = 64): { up: Float32Array; down: Float32Array } {
  const up = new Float32Array(points);
  const down = new Float32Array(points);
  for (let i = 0; i < points; i++) {
    const x = i / (points - 1);
    up[i] = Math.sin(0.5 * Math.PI * x);
    down[i] = Math.cos(0.5 * Math.PI * x);
  }
  return { up, down };
}

export class Desk {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private busEQ: BiquadFilterNode | null = null;
  private comp: DynamicsCompressorNode | null = null;
  private bus: GainNode | null = null;

  private beds = new Map<string, Bed>();
  private timer: number | null = null;
  private curves = equalPowerCurves();

  private mix: Mix = {};
  private masterValue = 85;
  private muted = false;
  private widthFactor = 1;
  private living = true;
  private ducked = false;

  private sources: Record<string, string> = {};
  private onState: ((s: LayerState[]) => void) | null = null;

  /** One-shot events the visual can react to, drained each frame. */
  public shots: { id: string; at: number }[] = [];

  constructor(sources: Record<string, string>) {
    this.sources = sources;
  }

  get started(): boolean {
    return this.ctx !== null;
  }

  subscribe(fn: (s: LayerState[]) => void) {
    this.onState = fn;
  }

  private emit() {
    if (!this.onState) return;
    this.onState(
      DESK_LAYERS.map((l) => {
        const bed = this.beds.get(l.id);
        return {
          id: l.id,
          transport: bed
            ? bed.buffer
              ? "buffer"
              : bed.el
                ? "element"
                : "failed"
            : "failed",
          rising: bed?.rising ?? false,
        } as LayerState;
      }),
    );
  }

  /**
   * Must be called synchronously inside a user gesture. iOS will not
   * resume a context created any other way.
   */
  async start(initial: Mix) {
    if (this.ctx) {
      this.setMix(initial);
      return;
    }

    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    const ctx = new Ctor({ latencyHint: "playback" });
    await ctx.resume();

    const master = ctx.createGain();
    master.gain.value = Math.pow(this.masterValue / 100, 1.5);

    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -14;
    comp.knee.value = 10;
    comp.ratio.value = 3;
    comp.attack.value = 0.02;
    comp.release.value = 0.35;

    const busEQ = ctx.createBiquadFilter();
    busEQ.type = "peaking";
    busEQ.frequency.value = 1800;
    busEQ.Q.value = 1;
    busEQ.gain.value = 0;

    const bus = ctx.createGain();
    bus.gain.value = 1;

    bus.connect(busEQ);
    busEQ.connect(comp);
    comp.connect(master);
    master.connect(ctx.destination);

    this.ctx = ctx;
    this.master = master;
    this.comp = comp;
    this.busEQ = busEQ;
    this.bus = bus;

    this.mix = { ...initial };
    this.timer = window.setInterval(() => this.tick(), 250);

    await Promise.all(
      DESK_LAYERS.filter((l) => (this.mix[l.id] ?? 0) > 0).map((l) =>
        this.ensure(l),
      ),
    );
    this.emit();
  }

  /** Loads a layer the first time its fader leaves zero. */
  private async ensure(layer: DeskLayer): Promise<Bed | null> {
    const existing = this.beds.get(layer.id);
    if (existing) return existing;
    const ctx = this.ctx;
    const url = this.sources[layer.id];
    if (!ctx || !url) return null;

    const bed: Bed = {
      layer,
      buffer: null,
      el: null,
      gain: ctx.createGain(),
      pan: ctx.createStereoPanner ? ctx.createStereoPanner() : null,
      analyser: ctx.createAnalyser(),
      sources: [],
      nextScheduleAt: 0,
      p1: 31 + Math.random() * 16,
      p2: 53 + Math.random() * 36,
      ph1: Math.random() * Math.PI * 2,
      ph2: Math.random() * Math.PI * 2,
      lastShotAt: 0,
      rising: false,
    };

    bed.gain!.gain.value = 0.0001;
    bed.analyser!.fftSize = 256;
    bed.gain!.connect(bed.analyser!);

    if (bed.pan) {
      bed.pan.pan.value = layer.pan * this.widthFactor;
      bed.gain!.connect(bed.pan);
      bed.pan.connect(this.bus!);
    } else {
      bed.gain!.connect(this.bus!);
    }

    this.beds.set(layer.id, bed);

    try {
      const res = await fetch(url, { mode: "cors" });
      if (!res.ok) throw new Error(String(res.status));
      bed.buffer = await ctx.decodeAudioData(await res.arrayBuffer());
    } catch {
      // No CORS, or no network. Fall back to a media element, which can
      // play a cross-origin file but cannot be routed or panned.
      try {
        const el = new Audio(url);
        el.loop = true;
        el.preload = "auto";
        el.volume = 0;
        bed.el = el;
        await el.play().catch(() => undefined);
      } catch {
        bed.el = null;
      }
    }

    this.emit();
    return bed;
  }

  private bedGain(layer: DeskLayer, v: number): number {
    if (layer.kind === "punct") {
      return Math.pow(Math.min(v, 50) / 50, 1.2) * layer.trim;
    }
    return Math.pow(v / 100, 1.8) * layer.trim;
  }

  private driftDb(bed: Bed, t: number): number {
    if (!this.living) return 0;
    return (
      1.6 * Math.sin((2 * Math.PI * t) / bed.p1 + bed.ph1) +
      0.9 * Math.sin((2 * Math.PI * t) / bed.p2 + bed.ph2)
    );
  }

  /* ---------------- the look-ahead scheduler ---------------- */

  private tick() {
    const ctx = this.ctx;
    if (!ctx) return;
    const now = ctx.currentTime;
    const horizon = now + 2;

    for (const bed of this.beds.values()) {
      const v = this.mix[bed.layer.id] ?? 0;
      const base = this.bedGain(bed.layer, v);

      // level, with its slow living drift
      const db = this.driftDb(bed, now);
      bed.rising = db > 0.15;
      const target = v <= 0 ? 0.0001 : base * Math.pow(10, db / 20);

      if (bed.gain) {
        bed.gain.gain.setTargetAtTime(Math.max(0.0001, target), now, 0.25);
      }
      if (bed.el) {
        bed.el.volume = clamp(
          Math.max(0, target) * Math.pow(this.masterValue / 100, 1.5) * (this.muted ? 0 : 1),
        );
        if (v > 0 && bed.el.paused) void bed.el.play().catch(() => undefined);
        if (v <= 0 && !bed.el.paused) bed.el.pause();
      }

      if (!bed.buffer || v <= 0) continue;

      if (bed.layer.kind === "punct") {
        this.schedulePunct(bed, v, now, horizon);
      } else {
        this.scheduleBed(bed, now, horizon);
      }

      bed.sources = bed.sources.filter((s) => s.endsAt > now - 1);
    }
  }

  /**
   * Two sources leapfrogging, each playing a region whose start and
   * length are jittered, so the seam never lands in the same place and
   * the ear stops hearing a loop.
   */
  private scheduleBed(bed: Bed, now: number, horizon: number) {
    const ctx = this.ctx!;
    const buf = bed.buffer!;
    const X = bed.layer.xfade;
    const J = Math.min(4, 0.08 * buf.duration);

    if (bed.nextScheduleAt === 0) bed.nextScheduleAt = now + 0.06;
    if (bed.nextScheduleAt > horizon) return;

    const at = bed.nextScheduleAt;
    const s = Math.random() * J;
    const L = Math.max(
      2,
      buf.duration - s - X - Math.random() * J,
    );

    const src = ctx.createBufferSource();
    src.buffer = buf;
    if (bed.layer.detune) {
      src.playbackRate.setTargetAtTime(
        1 + 0.0015 * Math.sin((2 * Math.PI * at) / 71),
        at,
        1,
      );
    }

    const xfade = ctx.createGain();
    xfade.gain.value = 0.0001;
    src.connect(xfade);
    xfade.connect(bed.gain!);

    xfade.gain.setValueCurveAtTime(this.curves.up, at, X);
    xfade.gain.setValueCurveAtTime(this.curves.down, at + L, X);

    src.start(at, s, L + X + 0.1);
    src.stop(at + L + X + 0.1);

    bed.sources.push({ node: src, xfade, endsAt: at + L + X });
    bed.nextScheduleAt = at + L;
  }

  /** A conch is an event, not a loop. Presence sets loudness and rate. */
  private schedulePunct(bed: Bed, v: number, now: number, horizon: number) {
    const ctx = this.ctx!;
    if (bed.nextScheduleAt === 0) bed.nextScheduleAt = now + 1 + Math.random() * 4;
    if (bed.nextScheduleAt > horizon) return;

    const at = Math.max(bed.nextScheduleAt, now + 0.05);
    if (at - bed.lastShotAt < 4) {
      bed.nextScheduleAt = bed.lastShotAt + 4.2;
      return;
    }

    const src = ctx.createBufferSource();
    src.buffer = bed.buffer!;

    const shot = ctx.createGain();
    const jitterDb = (Math.random() - 0.5) * 6;
    shot.gain.value = this.bedGain(bed.layer, v) * Math.pow(10, jitterDb / 20);

    src.connect(shot);

    if (ctx.createStereoPanner) {
      const p = ctx.createStereoPanner();
      p.pan.value = clamp(
        bed.layer.pan * this.widthFactor + (Math.random() - 0.5) * 0.7,
        -1,
        1,
      );
      shot.connect(p);
      p.connect(this.bus!);
    } else {
      shot.connect(this.bus!);
    }

    src.start(at);
    bed.lastShotAt = at;
    this.shots.push({ id: bed.layer.id, at });
    if (this.shots.length > 24) this.shots.splice(0, this.shots.length - 24);

    const meanGap = 110 - v;
    bed.nextScheduleAt = at + meanGap * (0.65 + Math.random() * 0.7);
  }

  /* ---------------- controls ---------------- */

  async setLayer(id: string, value: number) {
    this.mix[id] = value;
    if (value > 0) {
      const layer = DESK_LAYERS.find((l) => l.id === id);
      if (layer) await this.ensure(layer);
    }
  }

  async setMix(mix: Mix) {
    this.mix = { ...mix };
    await Promise.all(
      DESK_LAYERS.filter((l) => (mix[l.id] ?? 0) > 0).map((l) => this.ensure(l)),
    );
  }

  setMaster(v: number) {
    this.masterValue = v;
    if (!this.ctx || !this.master) return;
    const target = this.muted ? 0.0001 : Math.pow(v / 100, 1.5);
    this.master.gain.setTargetAtTime(target, this.ctx.currentTime, 0.05);
  }

  setMuted(muted: boolean) {
    this.muted = muted;
    if (!this.ctx || !this.master) return;
    const now = this.ctx.currentTime;
    const target = muted ? 0.0001 : Math.pow(this.masterValue / 100, 1.5);
    this.master.gain.setTargetAtTime(target, now, muted ? 0.04 : 0.07);
  }

  setWidth(factor: number) {
    this.widthFactor = factor;
    for (const bed of this.beds.values()) {
      if (bed.pan) {
        bed.pan.pan.value = clamp(bed.layer.pan * factor, -1, 1);
      }
    }
  }

  setLiving(on: boolean) {
    this.living = on;
  }

  /**
   * A song is playing, so the ambience steps back: the whole bus drops,
   * and a notch at 1.8 kHz clears the band a voice sits in. Ducking the
   * song instead, as the reference site does, is the wrong side.
   */
  setDucked(ducked: boolean) {
    this.ducked = ducked;
    if (!this.ctx || !this.bus || !this.busEQ) return;
    const now = this.ctx.currentTime;
    this.bus.gain.setTargetAtTime(ducked ? 0.355 : 1, now, 0.15);
    this.busEQ.gain.setTargetAtTime(ducked ? -6 : 0, now, 0.15);
  }

  get isDucked() {
    return this.ducked;
  }

  /** Reads the analyser tap for a layer, 0 to 1. Zero when unavailable. */
  level(id: string): number {
    const bed = this.beds.get(id);
    if (!bed?.analyser) return 0;
    const data = new Uint8Array(bed.analyser.frequencyBinCount);
    bed.analyser.getByteTimeDomainData(data);
    let sum = 0;
    for (let i = 0; i < data.length; i++) {
      const x = (data[i] - 128) / 128;
      sum += x * x;
    }
    return clamp(Math.sqrt(sum / data.length) * 3);
  }

  drainShots(): { id: string; at: number }[] {
    const out = this.shots.slice();
    this.shots.length = 0;
    return out;
  }

  destroy() {
    if (this.timer !== null) window.clearInterval(this.timer);
    for (const bed of this.beds.values()) {
      for (const s of bed.sources) {
        try {
          s.node.stop();
        } catch {
          /* already stopped */
        }
      }
      if (bed.el) {
        bed.el.pause();
        bed.el.src = "";
      }
    }
    this.beds.clear();
    void this.ctx?.close();
    this.ctx = null;
  }
}
