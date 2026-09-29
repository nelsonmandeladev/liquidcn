import { describe, expect, it } from "vitest";
import {
  bezelFor,
  displacementMap,
  edgeOf,
  refractionDepth,
  refractionSupported,
} from "@/lib/liquid/refraction";

const pixel = (map: ReturnType<typeof displacementMap>, x: number, y: number) => {
  const i = (y * map.width + x) * 4;
  return [...map.data.slice(i, i + 4)];
};

describe("edgeOf", () => {
  it("measures the distance to the nearest straight edge and its normal", () => {
    expect(edgeOf(50, 2, 100, 40, 20)).toEqual({ distance: 2, nx: 0, ny: -1 });
    expect(edgeOf(99, 20, 100, 40, 10)).toEqual({ distance: 1, nx: 1, ny: 0 });
  });

  it("follows the rounded corner", () => {
    const corner = edgeOf(2, 2, 100, 40, 20);
    expect(corner.distance).toBeCloseTo(20 - Math.hypot(18, 18));
    expect(corner.nx).toBeCloseTo(-Math.SQRT1_2);
    expect(corner.ny).toBeCloseTo(-Math.SQRT1_2);
  });
});

describe("displacementMap", () => {
  const map = displacementMap(120, 40, 999);

  it("sizes the map and the displacement from the bezel", () => {
    expect(map.width).toBe(120);
    expect(map.height).toBe(40);
    expect(bezelFor(20)).toBe(18);
    expect(bezelFor(2)).toBe(4);
    expect(map.scale).toBe(refractionDepth(18) * 2);
  });

  it("leaves the flat face alone", () => {
    expect(pixel(map, 60, 20)).toEqual([128, 128, 128, 255]);
  });

  it("draws the backdrop from further inside near the rim", () => {
    const [, top] = pixel(map, 60, 0);
    const [, bottom] = pixel(map, 60, 39);
    expect(top).toBeGreaterThan(200);
    expect(bottom).toBeLessThan(56);
    const [left] = pixel(map, 0, 20);
    const [right] = pixel(map, 119, 20);
    expect(left).toBeGreaterThan(200);
    expect(right).toBeLessThan(56);
  });

  it("eases from the rim to the face", () => {
    const depth = (y: number) => pixel(map, 60, y)[1] - 128;
    expect(depth(1)).toBeGreaterThan(depth(6));
    expect(depth(6)).toBeGreaterThan(depth(14));
  });
});

describe("refractionSupported", () => {
  it("is off outside Chromium, so other browsers keep their blur", () => {
    expect(refractionSupported()).toBe(false);
  });
});
