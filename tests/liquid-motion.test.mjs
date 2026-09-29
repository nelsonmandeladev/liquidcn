import { test } from "node:test";
import assert from "node:assert/strict";
import { createLiquidSpring, rubberBand } from "../src/components/ui/liquid-motion.ts";

function clock() {
  let time = 0;
  let id = 0;
  const frames = new Map();
  const original = { performance: globalThis.performance, raf: globalThis.requestAnimationFrame, cancel: globalThis.cancelAnimationFrame };
  globalThis.performance = { now: () => time };
  globalThis.requestAnimationFrame = callback => { frames.set(++id, callback); return id; };
  globalThis.cancelAnimationFrame = key => frames.delete(key);
  return {
    step(ms = 16) {
      time += ms;
      const pending = [...frames.values()]; frames.clear();
      pending.forEach(callback => callback(time));
    },
    settle() { for (let i = 0; i < 500 && frames.size; i++) this.step(); },
    pending: () => frames.size,
    restore() {
      globalThis.performance = original.performance;
      globalThis.requestAnimationFrame = original.raf;
      globalThis.cancelAnimationFrame = original.cancel;
    },
  };
}

test("a spring reaches the exact target and stops scheduling work", () => {
  const time = clock();
  try {
    let current;
    const spring = createLiquidSpring([0, 1], values => { current = [...values]; });
    spring.to([240, .94]); time.settle();
    assert.deepEqual(current, [240, .94]);
    assert.equal(time.pending(), 0);
  } finally { time.restore(); }
});

test("rapid retargeting continues from the current position without a jump", () => {
  const time = clock();
  try {
    let current = 0;
    const spring = createLiquidSpring([0], ([value]) => { current = value; });
    spring.to([200]); time.step(16); time.step(16); time.step(16);
    const interrupted = current;
    spring.to([-80]);
    assert.equal(current, interrupted);
    assert.equal(time.pending(), 1);
    time.step(16);
    assert.ok(Math.abs(current - interrupted) < 40);
    time.settle();
    assert.equal(current, -80);
    assert.equal(time.pending(), 0);
  } finally { time.restore(); }
});

test("immediate updates cancel motion and discard previous velocity", () => {
  const time = clock();
  try {
    let current = 0;
    const spring = createLiquidSpring([0], ([value]) => { current = value; });
    spring.to([100]); time.step();
    spring.to([25], true);
    assert.equal(current, 25);
    assert.equal(time.pending(), 0);
    time.step(1000);
    assert.equal(current, 25);
  } finally { time.restore(); }
});

test("a suspended tab cannot explode the spring, at either viscosity extreme", () => {
  const time = clock();
  try {
    for (const viscosity of [0, 1]) {
      const samples = [];
      const spring = createLiquidSpring([0], ([value]) => samples.push(value));
      spring.to([100], false, viscosity);
      time.step(10000); time.settle();
      assert.ok(samples.every(value => Number.isFinite(value) && value >= 0 && value < 130));
      assert.equal(samples.at(-1), 100);
    }
  } finally { time.restore(); }
});

test("unmount cleanup cancels the pending frame", () => {
  const time = clock();
  try {
    let renders = 0;
    const spring = createLiquidSpring([0], () => { renders++; });
    spring.to([100]); spring.stop(); time.step();
    assert.equal(renders, 0);
    assert.equal(time.pending(), 0);
  } finally { time.restore(); }
});

test("render can retarget the spring and it keeps moving to the new target", () => {
  const time = clock();
  try {
    let current = 0;
    let landed = false;
    // Like the lens: lift to 1 while travelling, then retarget to 0 once close.
    const spring = createLiquidSpring([0], ([value]) => {
      current = value;
      if (!landed && value > .9) { landed = true; spring.to([0]); }
    });
    spring.to([1]); time.settle();
    assert.ok(landed);
    assert.equal(current, 0);
    assert.equal(time.pending(), 0);
  } finally { time.restore(); }
});

test("render receives velocity, and a settled spring reports none", () => {
  const time = clock();
  try {
    let speed = [];
    const spring = createLiquidSpring([0], (_, velocity) => { speed = [...velocity]; });
    spring.to([100]); time.step(); time.step();
    assert.ok(speed[0] > 0);
    time.settle();
    assert.deepEqual(speed, [0]);
  } finally { time.restore(); }
});

test("a kick overshoots, then returns to the unchanged target", () => {
  const time = clock();
  try {
    const samples = [];
    const spring = createLiquidSpring([1], ([value]) => samples.push(value));
    spring.kick([2.4]); time.settle();
    assert.ok(Math.max(...samples) > 1.03);
    assert.equal(samples.at(-1), 1);
    assert.equal(time.pending(), 0);
  } finally { time.restore(); }
});

test("retargeting to the value already at rest schedules no work", () => {
  const time = clock();
  try {
    let renders = 0;
    const spring = createLiquidSpring([5], () => { renders++; });
    spring.to([5]);
    assert.equal(time.pending(), 0);
    assert.equal(renders, 0);
  } finally { time.restore(); }
});

test("the rubber band follows at first, then resists, symmetrically", () => {
  assert.equal(rubberBand(0, 14), 0);
  assert.ok(Math.abs(rubberBand(1, 14) - .55) < .03); // iOS coefficient near rest
  assert.ok(rubberBand(1000, 14) < 14);
  assert.equal(rubberBand(-30, 14), -rubberBand(30, 14));
});

test("a frame stamped before the spring started still moves it forward, never backward", () => {
  const time = clock();
  try {
    let current = 0;
    let speed = 0;
    const spring = createLiquidSpring([0], ([value], velocity) => { current = value; speed = velocity[0]; });
    spring.to([100]);
    time.step(-5); // the frame began before the input that scheduled it
    assert.ok(current > 0 && speed > 0);
    time.settle();
    assert.equal(current, 100);
  } finally { time.restore(); }
});
