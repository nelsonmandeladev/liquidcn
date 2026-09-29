import { test } from "node:test";
import assert from "node:assert/strict";
import { createLiquidSpring } from "../src/components/ui/liquid-motion.ts";

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
