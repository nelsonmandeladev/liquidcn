import { describe, expect, it } from "vitest";
import { pressedShape, swellFor } from "@/lib/liquid/press";

describe("swellFor", () => {
  it("grows small controls more than large ones, within bounds", () => {
    const icon = swellFor(44, 44);
    const pill = swellFor(88, 44);
    const hero = swellFor(240, 70);
    expect(icon).toBeCloseTo(1.18);
    expect(pill).toBeLessThan(icon);
    expect(hero).toBeLessThan(pill);
    expect(swellFor(4000, 4000)).toBeCloseTo(1.04);
  });

  it("stays finite for unmeasured elements", () => {
    expect(swellFor(0, 0)).toBeCloseTo(1.18);
  });
});

describe("pressedShape", () => {
  it("swells evenly without a drag", () => {
    const [dx, dy, sx, sy] = pressedShape(88, 44, [0, 0]);
    expect(dx).toBeCloseTo(0);
    expect(dy).toBeCloseTo(0);
    expect(sx).toBeCloseTo(sy);
  });

  it("follows a drag on a rubber band and stretches along it", () => {
    const [dx, dy, sx, sy] = pressedShape(88, 44, [200, 0]);
    expect(dx).toBeGreaterThan(0);
    expect(dx).toBeLessThan(10);
    expect(dy).toBe(0);
    expect(sx).toBeGreaterThan(sy);
  });
});
