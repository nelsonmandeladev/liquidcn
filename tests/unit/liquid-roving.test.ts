import { describe, expect, it } from "vitest";
import { rovingIndex } from "@/lib/liquid/roving";

describe("rovingIndex", () => {
  it("steps along a row and wraps at both ends", () => {
    expect(rovingIndex("ArrowRight", 0, 4, false)).toBe(1);
    expect(rovingIndex("ArrowRight", 3, 4, false)).toBe(0);
    expect(rovingIndex("ArrowLeft", 0, 4, false)).toBe(3);
    expect(rovingIndex("ArrowLeft", 2, 4, false)).toBe(1);
  });

  it("uses up and down in a column, and ignores the other axis", () => {
    expect(rovingIndex("ArrowDown", 1, 4, true)).toBe(2);
    expect(rovingIndex("ArrowUp", 0, 4, true)).toBe(3);
    expect(rovingIndex("ArrowRight", 1, 4, true)).toBeNull();
    expect(rovingIndex("ArrowDown", 1, 4, false)).toBeNull();
  });

  it("mirrors a row right to left, but not a column", () => {
    expect(rovingIndex("ArrowLeft", 0, 4, false, true)).toBe(1);
    expect(rovingIndex("ArrowRight", 0, 4, false, true)).toBe(3);
    expect(rovingIndex("ArrowDown", 0, 4, true, true)).toBe(1);
  });

  it("jumps to the ends with Home and End, and ignores other keys", () => {
    expect(rovingIndex("Home", 2, 4, false)).toBe(0);
    expect(rovingIndex("End", 0, 4, true)).toBe(3);
    expect(rovingIndex("Enter", 0, 4, false)).toBeNull();
    expect(rovingIndex("a", 0, 4, false)).toBeNull();
  });
});
