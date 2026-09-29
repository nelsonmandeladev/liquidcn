import { vi } from "vitest";

/** A manual clock for requestAnimationFrame-driven code. Restored by `restoreMocks`/unstub. */
export function frameClock() {
  let time = 0;
  let id = 0;
  const frames = new Map<number, FrameRequestCallback>();
  vi.spyOn(performance, "now").mockImplementation(() => time);
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
    frames.set(++id, callback);
    return id;
  });
  vi.stubGlobal("cancelAnimationFrame", (key: number) => frames.delete(key));
  return {
    step(ms = 16) {
      time += ms;
      const pending = [...frames.values()];
      frames.clear();
      pending.forEach((callback) => callback(time));
    },
    settle() {
      for (let i = 0; i < 500 && frames.size; i++) this.step();
    },
    pending: () => frames.size,
  };
}
