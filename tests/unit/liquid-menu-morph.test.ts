import { describe, expect, it } from "vitest";
import {
  coverPlacement,
  measureAnchor,
  morphVariables,
  radiusOf,
  sameAnchor,
} from "@/components/ui/liquid-menu-morph";

function triggerAt(left: number, width = 60, height = 40) {
  const element = document.createElement("button");
  Object.defineProperty(element, "offsetWidth", { value: width });
  Object.defineProperty(element, "offsetHeight", { value: height });
  element.getBoundingClientRect = () => ({ left, top: 0, width, height }) as DOMRect;
  return element;
}

describe("measureAnchor", () => {
  it("aligns to the screen edge the trigger is nearest to", () => {
    expect(measureAnchor(triggerAt(10), 900).align).toBe("start");
    expect(measureAnchor(triggerAt(420), 900).align).toBe("center");
    expect(measureAnchor(triggerAt(820), 900).align).toBe("end");
  });

  it("reports the untransformed size", () => {
    expect(measureAnchor(triggerAt(0, 88, 44), 900)).toMatchObject({ width: 88, height: 44 });
  });

  it("compares anchors by value", () => {
    const anchor = { width: 1, height: 2, align: "start" as const };
    expect(sameAnchor(null, anchor)).toBe(false);
    expect(sameAnchor({ ...anchor }, anchor)).toBe(true);
    expect(sameAnchor({ ...anchor, align: "end" }, anchor)).toBe(false);
  });
});

describe("radiusOf", () => {
  const box = { left: 0, top: 0, width: 120, height: 44 };

  it("clamps pill radii to half the shorter side", () => {
    expect(radiusOf("999px", box)).toBe(22);
  });

  it("resolves percentages against the shorter side", () => {
    expect(radiusOf("25%", box)).toBe(11);
  });

  it("treats unparseable values as square corners", () => {
    expect(radiusOf("", box)).toBe(0);
  });
});

describe("morphVariables", () => {
  const trigger = { left: 400, top: 100, width: 80, height: 40 };
  const panel = { left: 300, top: 100, width: 240, height: 160 };

  it("starts at the trigger's size and center", () => {
    const vars = morphVariables(trigger, panel, 20);
    expect(Number(vars["scale-x"])).toBeCloseTo(80 / 240);
    expect(Number(vars["scale-y"])).toBeCloseTo(40 / 160);
    expect(vars.x).toBe("20px");
    expect(vars.y).toBe("-60px");
  });

  it("keeps the trigger's corners by counter-scaling the radius", () => {
    expect(morphVariables(trigger, panel, 20).radius).toBe("60px / 80px");
  });

  it("passes through a round droplet part way to the panel", () => {
    const vars = morphVariables(trigger, panel, 20);
    const width = Number(vars["mid-scale-x"]) * panel.width;
    const height = Number(vars["mid-scale-y"]) * panel.height;
    expect(width).toBeCloseTo(height);
    expect(vars["mid-x"]).toBe("9px");
  });

  it("never scales a panel up or to nothing", () => {
    const vars = morphVariables({ left: 0, top: 0, width: 999, height: 0 }, panel, 0);
    expect(Number(vars["scale-x"])).toBe(1);
    expect(Number(vars["scale-y"])).toBe(0.05);
  });
});

describe("coverPlacement", () => {
  const anchor = { width: 44, height: 40, align: "end" as const };

  it("offsets the panel back over the trigger and hugs its edge", () => {
    expect(coverPlacement(anchor, "bottom", {})).toEqual({ sideOffset: -40, align: "end" });
    expect(coverPlacement(anchor, "left", {})).toEqual({ sideOffset: -44, align: "center" });
  });

  it("opens beside the trigger without an anchor", () => {
    expect(coverPlacement(null, "bottom", {})).toEqual({ sideOffset: 10, align: "center" });
  });

  it("respects the consumer's own offset and alignment", () => {
    const chosen = { sideOffset: 4, align: "start" as const };
    expect(coverPlacement(anchor, "bottom", chosen)).toEqual(chosen);
  });
});
