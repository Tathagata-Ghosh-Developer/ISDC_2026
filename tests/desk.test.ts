/**
 * The sound desk's share URL.
 *
 * encodeMix writes a mix into a query string and decodeMix reads it
 * back. A visitor who shares a link expects the person opening it to
 * hear the same thing, so the pair has to survive a round trip.
 */
import { describe, expect, it } from "vitest";
import {
  DESK_LAYERS,
  DESK_ORDER,
  DEFAULT_PRESET,
  PRESETS,
  decodeMix,
  encodeMix,
  mixToValues,
  valuesToMix,
  type Mix,
} from "@/lib/content/desk";

describe("the layer table", () => {
  it("has a unique id per layer", () => {
    const ids = DESK_LAYERS.map((l) => l.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("has a unique three-letter lowercase code per layer", () => {
    // decodeMix looks layers up by this code with /([a-z]{3})(\d{2})/,
    // so a duplicate or a capital silently drops a fader.
    const codes = DESK_LAYERS.map((l) => l.code);
    expect(new Set(codes).size).toBe(codes.length);
    for (const c of codes) expect(c, c).toMatch(/^[a-z]{3}$/);
  });

  it("keeps every pan inside the stereo field", () => {
    for (const l of DESK_LAYERS) {
      expect(l.pan, l.id).toBeGreaterThanOrEqual(-1);
      expect(l.pan, l.id).toBeLessThanOrEqual(1);
      expect(l.trim, l.id).toBeGreaterThan(0);
      expect(l.trim, l.id).toBeLessThanOrEqual(1);
    }
  });

  it("only detunes sustained tones, never a drum", () => {
    const detuned = DESK_LAYERS.filter((l) => l.detune).map((l) => l.id);
    expect(detuned).toEqual(["mantra_path", "drone"]);
  });

  it("keeps DESK_ORDER in step with DESK_LAYERS", () => {
    expect(DESK_ORDER).toEqual(DESK_LAYERS.map((l) => l.id));
  });
});

describe("the presets", () => {
  it("has a unique slug per preset", () => {
    const slugs = PRESETS.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("gives every preset one value per fader", () => {
    for (const p of PRESETS) {
      expect(p.values.length, p.slug).toBe(DESK_LAYERS.length);
      for (const v of p.values) {
        expect(v, `${p.slug} ${v}`).toBeGreaterThanOrEqual(0);
        expect(v, `${p.slug} ${v}`).toBeLessThanOrEqual(100);
        expect(Number.isInteger(v), `${p.slug} ${v}`).toBe(true);
      }
    }
  });

  it("has a default that exists", () => {
    expect(PRESETS.some((p) => p.slug === DEFAULT_PRESET)).toBe(true);
  });

  it("never opens on silence", () => {
    const d = PRESETS.find((p) => p.slug === DEFAULT_PRESET)!;
    expect(d.values.some((v) => v > 0)).toBe(true);
  });
});

describe("valuesToMix and mixToValues", () => {
  it("round-trip through each other", () => {
    for (const p of PRESETS) {
      expect(mixToValues(valuesToMix(p.values)), p.slug).toEqual(p.values);
    }
  });

  it("fill a short array with silence rather than undefined", () => {
    const mix = valuesToMix([10]);
    expect(Object.keys(mix).length).toBe(DESK_LAYERS.length);
    expect(mix[DESK_LAYERS[0].id]).toBe(10);
    for (const l of DESK_LAYERS.slice(1)) expect(mix[l.id], l.id).toBe(0);
  });

  it("treat a missing layer as silent", () => {
    expect(mixToValues({})).toEqual(DESK_LAYERS.map(() => 0));
  });
});

describe("encodeMix and decodeMix", () => {
  it("round-trip every preset", () => {
    for (const p of PRESETS) {
      const mix = valuesToMix(p.values);
      const back = decodeMix(encodeMix(mix));
      // Silent faders are left out of the URL, so compare the audible
      // ones and require the rest to decode as absent.
      for (const l of DESK_LAYERS) {
        if (mix[l.id] > 0) expect(back[l.id], `${p.slug} ${l.id}`).toBe(mix[l.id]);
        else expect(back[l.id], `${p.slug} ${l.id}`).toBeUndefined();
      }
      expect(mixToValues(back), p.slug).toEqual(p.values);
    }
  });

  it("round-trips a single fader at every level it can reach", () => {
    for (let v = 1; v <= 100; v++) {
      const encoded = encodeMix({ dhak: v });
      expect(decodeMix(encoded).dhak, `level ${v}`).toBe(v);
    }
  });

  it("writes three letters and two digits per audible fader", () => {
    expect(encodeMix({ dhak: 62, adda: 58 })).toBe("dhk62add58");
    expect(encodeMix({ dhak: 5 })).toBe("dhk05");
    expect(encodeMix({ dhak: 0 })).toBe("");
    expect(encodeMix({})).toBe("");
  });

  it("writes faders in desk order however the mix was built", () => {
    expect(encodeMix({ adda: 58, dhak: 62 })).toBe("dhk62add58");
  });

  it("rounds a fractional level to the nearest whole one", () => {
    expect(encodeMix({ dhak: 61.4 })).toBe("dhk61");
    expect(encodeMix({ dhak: 61.5 })).toBe("dhk62");
  });

  it("clamps a level above the top of the fader", () => {
    expect(decodeMix(encodeMix({ dhak: 100000 })).dhak).toBeLessThanOrEqual(100);
    expect(decodeMix(encodeMix({ dhak: 101 })).dhak).toBeLessThanOrEqual(100);
  });

  it("drops a negative level instead of encoding one", () => {
    expect(encodeMix({ dhak: -20 })).toBe("");
    expect(decodeMix(encodeMix({ dhak: -20, adda: 30 }))).toEqual({ adda: 30 });
  });

  it("ignores rubbish in the query string", () => {
    expect(decodeMix("")).toEqual({});
    expect(decodeMix("hello")).toEqual({});
    expect(decodeMix("zzz99")).toEqual({}); // not a layer code
    expect(decodeMix("dhk")).toEqual({}); // no level
    expect(decodeMix("<script>alert(1)</script>")).toEqual({});
  });

  it("reads the good part of a partly broken string", () => {
    expect(decodeMix("dhk62zzz99add58")).toEqual({ dhak: 62, adda: 58 });
  });

  it("never invents a layer that is not on the desk", () => {
    const ids = new Set(DESK_LAYERS.map((l) => l.id));
    const decoded: Mix = decodeMix("dhk62zzz99add58qqq10__proto__11");
    for (const k of Object.keys(decoded)) expect(ids.has(k), k).toBe(true);
  });
});
