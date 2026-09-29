import { afterEach, describe, expect, it, vi } from "vitest";
import { createLiquidSpring, rubberBand } from "@/lib/liquid/motion";
import { frameClock } from "../frame-clock";

afterEach(() => vi.unstubAllGlobals());

describe("createLiquidSpring", () => {
  it("reaches the exact target and stops scheduling work", () => {
    const time = frameClock();
    let current: number[] = [];
    const spring = createLiquidSpring([0, 1], (values) => (current = [...values]));
    spring.to([240, 0.94]);
    time.settle();
    expect(current).toEqual([240, 0.94]);
    expect(time.pending()).toBe(0);
  });

  it("continues from the current position when retargeted mid-flight", () => {
    const time = frameClock();
    let current = 0;
    const spring = createLiquidSpring([0], ([value]) => (current = value));
    spring.to([200]);
    time.step();
    time.step();
    time.step();
    const interrupted = current;
    spring.to([-80]);
    expect(current).toBe(interrupted);
    expect(time.pending()).toBe(1);
    time.step();
    expect(Math.abs(current - interrupted)).toBeLessThan(40);
    time.settle();
    expect(current).toBe(-80);
  });

  it("cancels motion and discards velocity on immediate updates", () => {
    const time = frameClock();
    let current = 0;
    const spring = createLiquidSpring([0], ([value]) => (current = value));
    spring.to([100]);
    time.step();
    spring.to([25], true);
    expect(current).toBe(25);
    expect(time.pending()).toBe(0);
    time.step(1000);
    expect(current).toBe(25);
  });

  it.each([0, 1])("stays bounded after a suspended tab at viscosity %d", (viscosity) => {
    const time = frameClock();
    const samples: number[] = [];
    const spring = createLiquidSpring([0], ([value]) => samples.push(value));
    spring.to([100], false, viscosity);
    time.step(10_000);
    time.settle();
    expect(samples.every((value) => Number.isFinite(value) && value >= 0 && value < 130)).toBe(
      true,
    );
    expect(samples.at(-1)).toBe(100);
  });

  it("cancels the pending frame on stop", () => {
    const time = frameClock();
    let renders = 0;
    const spring = createLiquidSpring([0], () => renders++);
    spring.to([100]);
    spring.stop();
    time.step();
    expect(renders).toBe(0);
    expect(time.pending()).toBe(0);
  });

  it("keeps moving when render retargets it", () => {
    const time = frameClock();
    let current = 0;
    let landed = false;
    // Like the lens: lift to 1 while travelling, then retarget to 0 once close.
    const spring = createLiquidSpring([0], ([value]) => {
      current = value;
      if (!landed && value > 0.9) {
        landed = true;
        spring.to([0]);
      }
    });
    spring.to([1]);
    time.settle();
    expect(landed).toBe(true);
    expect(current).toBe(0);
    expect(time.pending()).toBe(0);
  });

  it("reports velocity to render, and none once settled", () => {
    const time = frameClock();
    let speed: number[] = [];
    const spring = createLiquidSpring([0], (_, velocity) => (speed = [...velocity]));
    spring.to([100]);
    time.step();
    time.step();
    expect(speed[0]).toBeGreaterThan(0);
    time.settle();
    expect(speed).toEqual([0]);
  });

  it("overshoots after a kick, then returns to the unchanged target", () => {
    const time = frameClock();
    const samples: number[] = [];
    const spring = createLiquidSpring([1], ([value]) => samples.push(value));
    spring.kick([2.4]);
    time.settle();
    expect(Math.max(...samples)).toBeGreaterThan(1.03);
    expect(samples.at(-1)).toBe(1);
    expect(time.pending()).toBe(0);
  });

  it("schedules no work when retargeted to the value already at rest", () => {
    const time = frameClock();
    let renders = 0;
    const spring = createLiquidSpring([5], () => renders++);
    spring.to([5]);
    expect(time.pending()).toBe(0);
    expect(renders).toBe(0);
  });

  it("moves forward, never backward, on a frame stamped before it started", () => {
    const time = frameClock();
    let current = 0;
    let speed = 0;
    const spring = createLiquidSpring([0], ([value], velocity) => {
      current = value;
      speed = velocity[0];
    });
    spring.to([100]);
    time.step(-5); // the frame began before the input that scheduled it
    expect(current).toBeGreaterThan(0);
    expect(speed).toBeGreaterThan(0);
    time.settle();
    expect(current).toBe(100);
  });
});

describe("rubberBand", () => {
  it("follows at first, then resists, symmetrically", () => {
    expect(rubberBand(0, 14)).toBe(0);
    expect(rubberBand(1, 14)).toBeCloseTo(0.55, 1); // iOS coefficient near rest
    expect(rubberBand(1000, 14)).toBeLessThan(14);
    expect(rubberBand(-30, 14)).toBe(-rubberBand(30, 14));
  });
});
