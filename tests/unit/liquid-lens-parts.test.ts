import { describe, expect, it } from "vitest";
import {
  activate,
  boxWithin,
  followBox,
  lensFrame,
  lensMask,
  mirror,
  nearestBox,
  pointerWithin,
  type Box,
} from "@/lib/liquid/lens-parts";

function layout(element: HTMLElement, values: Partial<Record<string, unknown>>) {
  for (const [key, value] of Object.entries(values)) {
    Object.defineProperty(element, key, { configurable: true, value });
  }
}

describe("lensFrame", () => {
  const box: Box = [100, 5, 80, 40];

  it("matches the item exactly at rest", () => {
    expect(lensFrame(box, 0, 0, false)).toEqual(box);
  });

  it("grows more across the list than along it when lifted, around the same center", () => {
    const [x, y, width, height] = lensFrame(box, 1, 0, false);
    expect(width / 80).toBeCloseTo(1.16);
    expect(height / 40).toBeCloseTo(1.34);
    expect(x + width / 2).toBeCloseTo(140);
    expect(y + height / 2).toBeCloseTo(25);
  });

  it("stretches along the direction of travel, with a ceiling", () => {
    const fast = lensFrame(box, 0, 100_000, false);
    expect(fast[2] / 80).toBeCloseTo(1.24);
    expect(fast[3]).toBeLessThan(40);
  });

  it("swaps axes for vertical lists", () => {
    const [, , width, height] = lensFrame(box, 1, 0, true);
    expect(width / 80).toBeCloseTo(1.34);
    expect(height / 40).toBeCloseTo(1.16);
  });
});

describe("lensMask", () => {
  const item: Box = [100, 0, 80, 40];

  it("returns null when the lens does not reach the item", () => {
    expect(lensMask(item, [0, 0, 100, 40], false)).toBeNull();
    expect(lensMask(item, [180, 0, 50, 40], false)).toBeNull();
  });

  it("cuts a soft-edged window in item coordinates", () => {
    const mask = lensMask(item, [120, -4, 40, 48], false);
    expect(mask).toBe(
      "linear-gradient(90deg, #000 20px, transparent 28px, transparent 52px, #000 60px)",
    );
  });

  it("runs top to bottom for vertical lists", () => {
    expect(lensMask([0, 100, 80, 40], [0, 110, 80, 20], true)).toMatch(/^linear-gradient\(180deg/);
  });
});

describe("nearestBox and followBox", () => {
  const boxes: Box[] = [
    [0, 0, 80, 40],
    [80, 0, 80, 40],
    [160, 0, 80, 40],
  ];

  it("picks the item whose center is closest", () => {
    expect(nearestBox(boxes, 10, false)).toBe(0);
    expect(nearestBox(boxes, 130, false)).toBe(1);
    expect(nearestBox(boxes, 999, false)).toBe(2);
    expect(nearestBox([], 10, false)).toBe(-1);
  });

  it("centers the lens on the finger between the ends", () => {
    expect(followBox(boxes, boxes[1], 120, false)).toEqual([80, 0, 80, 40]);
  });

  it("rubber-bands past the first and last items", () => {
    const before = followBox(boxes, boxes[0], -200, false)[0];
    const after = followBox(boxes, boxes[2], 600, false)[0];
    expect(before).toBeLessThan(0);
    expect(before).toBeGreaterThan(-14);
    expect(after).toBeGreaterThan(160);
    expect(after).toBeLessThan(174);
  });
});

describe("DOM measurement", () => {
  it("sums offsets up to the list, including nested positioned parents' borders", () => {
    const list = document.createElement("div");
    const wrapper = document.createElement("div");
    const item = document.createElement("button");
    list.append(wrapper);
    wrapper.append(item);
    layout(wrapper, { offsetLeft: 10, offsetTop: 4, offsetParent: list, clientLeft: 2 });
    layout(item, { offsetLeft: 30, offsetTop: 1, offsetParent: wrapper, offsetWidth: 60 });
    layout(wrapper, { clientTop: 1 });
    layout(item, { offsetHeight: 20 });
    expect(boxWithin(item, list)).toEqual([42, 6, 60, 20]);
  });

  it("copies the list's styling hooks into the optics, not its identity or the lens's state", () => {
    const list = document.createElement("div");
    const lens = document.createElement("span");
    const optics = document.createElement("span");
    list.className = "liquid-tabs";
    list.id = "library";
    list.setAttribute("aria-label", "Library");
    list.setAttribute("dir", "rtl");
    Object.assign(list.dataset, { orientation: "vertical", slot: "tabs-list" });
    list.dataset.liquidIndicator = "true";
    list.append(document.createElement("button"), lens);
    mirror(list, lens, optics);
    expect(optics.className).toBe("liquid-tabs liquid-lens-optics");
    expect(optics.getAttribute("dir")).toBe("rtl");
    expect({ ...optics.dataset }).toEqual({ orientation: "vertical", slot: "tabs-list" });
    expect(optics.id).toBe("");
    expect(optics.hasAttribute("aria-label")).toBe(false);
    expect(optics.children).toHaveLength(1);
    delete list.dataset.orientation;
    mirror(list, lens, optics);
    expect(optics.dataset.orientation).toBeUndefined();
  });

  it("selects an item with the mousedown Radix listens for and the click others do", () => {
    const list = document.createElement("div");
    const item = document.createElement("button");
    list.append(item);
    const events: string[] = [];
    for (const type of ["mousedown", "click"]) {
      item.addEventListener(type, () => events.push(type));
    }
    activate(item, list);
    expect(events).toEqual(["mousedown", "click"]);
  });

  it("maps a pointer into padding-box coordinates, undoing the list's scale", () => {
    const list = document.createElement("div");
    layout(list, {
      offsetWidth: 200,
      offsetHeight: 50,
      getBoundingClientRect: () => ({ left: 100, top: 10, width: 220, height: 55 }),
    });
    const event = { clientX: 210, clientY: 32 } as PointerEvent;
    expect(pointerWithin(event, list, [1, 1], false)).toBeCloseTo(99);
    expect(pointerWithin(event, list, [1, 1], true)).toBeCloseTo(19);
  });
});
