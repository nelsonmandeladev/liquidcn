import { describe, expect, it } from "vitest";
import {
  capBounds,
  capOf,
  neckBetween,
  parseRadius,
  spreadAt,
  type Cap,
} from "@/lib/liquid/fusion";
import { foldNeck } from "@/lib/liquid/menu-morph";
import { fusionStrength } from "@/lib/liquid/bar";

const rect = (left: number, top: number, width: number, height: number) => ({
  left,
  top,
  width,
  height,
});
// Coordinates only: an arc's radii and flags come before its end point.
const numbers = (path: string) =>
  (path.replace(/A \S+ \S+ \d \d \d /g, "A ").match(/-?\d+\.\d+/g) ?? []).map(Number);

describe("capOf", () => {
  it("finds the end of a capsule nearest the other surface", () => {
    const bar = rect(0, 0, 300, 60);
    expect(capOf(bar, [400, 30])).toEqual([270, 30, 30]);
    expect(capOf(bar, [-50, 30])).toEqual([30, 30, 30]);
    // Beside the middle of the bar, the cap slides along it.
    expect(capOf(bar, [150, 200])).toEqual([150, 30, 30]);
  });

  it("uses a panel's corner radius just inside its nearest edge", () => {
    expect(capOf(rect(0, 100, 200, 140), [100, 0], 22)).toEqual([100, 122, 22]);
  });

  it("is the circle of a round button", () => {
    expect(capOf(rect(10, 10, 44, 44), [0, 0])).toEqual([32, 32, 22]);
  });
});

describe("capBounds", () => {
  it("encloses both caps", () => {
    expect(capBounds([30, 30, 30], [110, 40, 20])).toEqual([0, 0, 130, 60]);
  });
});

describe("neckBetween", () => {
  const bar: Cap = [270, 30, 30];
  const button: Cap = [340, 30, 26];

  it("draws a closed neck between two nearby surfaces", () => {
    const neck = neckBetween(bar, button, 0.5)!;
    expect(neck.outline).toMatch(/^M .* C .* A .* C .* A .* Z$/);
    expect(neck.rims.match(/C /g)).toHaveLength(2);
    // Every point of the neck lies between the two circles' outer edges.
    const xs = numbers(neck.outline).filter((_, i) => i % 2 === 0);
    expect(Math.min(...xs)).toBeGreaterThan(240);
  });

  it("widens with spread", () => {
    const height = (spread: number) => {
      const ys = numbers(neckBetween(bar, button, spread)!.outline).filter((_, i) => i % 2);
      return Math.max(...ys) - Math.min(...ys);
    };
    expect(height(0.6)).toBeGreaterThan(height(0.2));
  });

  it("has no neck at zero spread, far apart, or when one circle contains the other", () => {
    expect(neckBetween(bar, button, 0)).toBeNull();
    expect(neckBetween(bar, [600, 30, 26], 0.5)).toBeNull();
    expect(neckBetween([100, 100, 60], [110, 100, 20], 0.5)).toBeNull();
    expect(neckBetween([0, 0, 0], button, 0.5)).toBeNull();
  });

  it("writes coordinates relative to the origin", () => {
    const at = numbers(neckBetween(bar, button, 0.5)!.outline);
    const shifted = numbers(neckBetween(bar, button, 0.5, [240, 0])!.outline);
    expect(shifted[0]).toBeCloseTo(at[0] - 240, 1);
    expect(shifted[1]).toBeCloseTo(at[1], 1);
  });

  it("drops the rims once the circles overlap", () => {
    expect(neckBetween([0, 0, 40], [60, 0, 30], 0.5)!.rims).toBe("");
  });
});

describe("spreadAt", () => {
  it("keeps the spread for separate circles and narrows it as they sink together", () => {
    expect(spreadAt(100, 30, 30, 0.5)).toBe(0.5);
    expect(spreadAt(50, 30, 30, 0.5)).toBeGreaterThan(spreadAt(20, 30, 30, 0.5));
    expect(spreadAt(5, 30, 10, 0.5)).toBe(0);
    expect(spreadAt(100, 30, 30, 4)).toBe(1);
  });
});

describe("parseRadius", () => {
  it("reads px, percentages, and the calc values animations produce", () => {
    expect(parseRadius("22px", 200, 100)).toBe(22);
    expect(parseRadius("50%", 200, 100)).toBe(50);
    expect(parseRadius("calc(10% + 8px)", 200, 100)).toBe(18);
    expect(parseRadius("calc(50% - 2px)", 100, 100)).toBe(48);
    expect(parseRadius("calc(10% + 4px) calc(10% + 30px)", 200, 100)).toBe(24);
    expect(parseRadius("", 10, 10)).toBe(0);
  });
});

describe("foldNeck", () => {
  it("forms as the drop pulls away and is gone once it lands", () => {
    expect(foldNeck(0).strength).toBe(0);
    expect(foldNeck(0.5).strength).toBeGreaterThan(0.4);
    expect(foldNeck(1).strength).toBe(0);
    expect(foldNeck(0.99).hold).toBe(true);
    expect(foldNeck(1).hold).toBe(false);
  });
});

describe("fusionStrength", () => {
  it("fuses while the search button is pressed or the bar's lens is lifted", () => {
    expect(fusionStrength(0, 0)).toBe(0);
    expect(fusionStrength(1, 0)).toBe(0.5);
    expect(fusionStrength(0, 1)).toBeCloseTo(0.32);
    expect(fusionStrength(4, 0)).toBe(1);
  });
});
