/**
 * Distances on the campus map.
 *
 * The scale bar says 500 m spans 0.3167 of the image width, so a
 * horizontal segment of exactly 0.3167 must measure exactly 500 m.
 * Everything else follows from that one number.
 */
import { describe, expect, it } from "vitest";
import {
  CAMPUS_MAP,
  MAP_GATES,
  VENUE_POINT,
  mapsLink,
  routeMetres,
  walkMinutes,
  type Point,
} from "@/lib/content/campusmap";

const ASPECT = CAMPUS_MAP.height / CAMPUS_MAP.width;

describe("routeMetres", () => {
  it("measures a horizontal line against the scale bar", () => {
    const line: Point[] = [
      [0.1, 0.5],
      [0.1 + 0.3167, 0.5],
    ];
    expect(routeMetres(line)).toBeCloseTo(500, 6);
  });

  it("measures half the scale bar as half the distance", () => {
    const line: Point[] = [
      [0.2, 0.5],
      [0.2 + 0.15835, 0.5],
    ];
    expect(routeMetres(line)).toBeCloseTo(250, 6);
  });

  it("corrects a vertical fraction for the image aspect", () => {
    // 0.3167 of the HEIGHT is a longer distance on the ground than
    // 0.3167 of the width, by exactly the aspect ratio.
    const vertical: Point[] = [
      [0.5, 0.2],
      [0.5, 0.2 + 0.3167],
    ];
    expect(routeMetres(vertical)).toBeCloseTo(500 * ASPECT, 6);
  });

  it("measures a right-angled path as the sum of its legs", () => {
    const bent: Point[] = [
      [0.1, 0.5],
      [0.1 + 0.3167, 0.5],
      [0.1 + 0.3167, 0.5 + 0.3167],
    ];
    expect(routeMetres(bent)).toBeCloseTo(500 + 500 * ASPECT, 6);
  });

  it("measures a 3-4-5 triangle's hypotenuse", () => {
    // 3 units across, 4 units up (already aspect-corrected), so 5.
    const unit = 0.3167;
    const hyp: Point[] = [
      [0.1, 0.1],
      [0.1 + 3 * unit, 0.1 + (4 * unit) / ASPECT],
    ];
    expect(routeMetres(hyp)).toBeCloseTo(5 * 500, 6);
  });

  it("is direction-agnostic", () => {
    const forward: Point[] = [
      [0.2, 0.3],
      [0.6, 0.7],
    ];
    const back: Point[] = [forward[1], forward[0]];
    expect(routeMetres(forward)).toBeCloseTo(routeMetres(back), 9);
  });

  it("is zero for an empty route or a single point", () => {
    expect(routeMetres([])).toBe(0);
    expect(routeMetres([[0.5, 0.5]])).toBe(0);
    expect(routeMetres([VENUE_POINT, VENUE_POINT])).toBe(0);
  });

  it("is additive over a subdivided straight line", () => {
    const whole: Point[] = [
      [0.1, 0.4],
      [0.5, 0.4],
    ];
    const split: Point[] = [
      [0.1, 0.4],
      [0.3, 0.4],
      [0.5, 0.4],
    ];
    expect(routeMetres(split)).toBeCloseTo(routeMetres(whole), 9);
  });
});

describe("walkMinutes", () => {
  it("rounds up rather than down", () => {
    expect(walkMinutes(150)).toBe(2); // exactly 2
    expect(walkMinutes(151)).toBe(3); // a metre over is a whole minute more
    expect(walkMinutes(224)).toBe(3);
    expect(walkMinutes(225)).toBe(3); // exactly 3
    expect(walkMinutes(226)).toBe(4);
    expect(walkMinutes(750)).toBe(10);
    expect(walkMinutes(751)).toBe(11);
  });

  it("never promises less than two minutes", () => {
    expect(walkMinutes(0)).toBe(2);
    expect(walkMinutes(1)).toBe(2);
    expect(walkMinutes(74)).toBe(2);
    expect(walkMinutes(75)).toBe(2);
    expect(walkMinutes(-100)).toBe(2);
  });

  it("is always a whole number and never optimistic", () => {
    for (let m = 0; m < 4000; m += 13) {
      const mins = walkMinutes(m);
      expect(Number.isInteger(mins)).toBe(true);
      expect(mins).toBeGreaterThanOrEqual(m / 75);
      expect(mins).toBeGreaterThanOrEqual(2);
    }
  });

  it("never goes down as the distance goes up", () => {
    let last = 0;
    for (let m = 0; m < 4000; m += 7) {
      const mins = walkMinutes(m);
      expect(mins).toBeGreaterThanOrEqual(last);
      last = mins;
    }
  });
});

describe("the gate data itself", () => {
  it("has a unique id per gate", () => {
    const ids = MAP_GATES.map((g) => g.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("has a unique map marker per gate", () => {
    const markers = MAP_GATES.map((g) => g.marker);
    expect(new Set(markers).size).toBe(markers.length);
  });

  it("keeps every coordinate inside the image", () => {
    for (const g of MAP_GATES) {
      for (const [x, y] of [g.at, ...g.route]) {
        expect(x, `${g.id} x`).toBeGreaterThanOrEqual(0);
        expect(x, `${g.id} x`).toBeLessThanOrEqual(1);
        expect(y, `${g.id} y`).toBeGreaterThanOrEqual(0);
        expect(y, `${g.id} y`).toBeLessThanOrEqual(1);
      }
    }
  });

  it("starts each route at the gate and ends it at the venue", () => {
    for (const g of MAP_GATES) {
      expect(g.route[0], g.id).toEqual(g.at);
      expect(g.route[g.route.length - 1], g.id).toEqual(VENUE_POINT);
    }
  });

  it("gives every gate a walk a visitor could believe", () => {
    // The campus is about two kilometres across, so any traced route
    // outside 100 m to 4 km means a coordinate was mistyped.
    for (const g of MAP_GATES) {
      const m = routeMetres(g.route);
      expect(m, `${g.id} is ${Math.round(m)} m`).toBeGreaterThan(100);
      expect(m, `${g.id} is ${Math.round(m)} m`).toBeLessThan(4000);
    }
  });

  it("agrees with the site copy that the main gate is under 400 m", () => {
    const main = MAP_GATES.find((g) => g.id === "main-gate")!;
    expect(routeMetres(main.route)).toBeLessThan(400);
  });
});

describe("mapsLink", () => {
  it("builds a walking-directions link with both ends encoded", () => {
    const url = mapsLink("IISc Main Gate, Bengaluru", "Tata Memorial Club");
    expect(url.startsWith("https://www.google.com/maps/dir/?")).toBe(true);
    const params = new URL(url).searchParams;
    expect(params.get("api")).toBe("1");
    expect(params.get("origin")).toBe("IISc Main Gate, Bengaluru");
    expect(params.get("destination")).toBe("Tata Memorial Club");
    expect(params.get("travelmode")).toBe("walking");
    expect(url).not.toContain(" ");
  });
});
