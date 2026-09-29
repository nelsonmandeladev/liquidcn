import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const css = readFileSync("src/components/ui/liquid/liquid.css", "utf8");

/** WCAG relative luminance of a `#rrggbb` color. */
function luminance(hex: string) {
  const [r, g, b] = [1, 3, 5].map((start) => {
    const channel = parseInt(hex.slice(start, start + 2), 16) / 255;
    return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: string, b: string) {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (light + 0.05) / (dark + 0.05);
}

// The site sets its own accent, so its accessibility checks never see liquidcn's default.
describe("default accent", () => {
  const defaults = [...css.matchAll(/var\(--liquid-(?:system-)?accent, (#[0-9a-f]{6})\)/gi)].map(
    (match) => match[1].toLowerCase(),
  );

  it("is one color wherever --liquid-accent is unset", () => {
    expect(defaults.length).toBeGreaterThan(0);
    expect(new Set(defaults).size).toBe(1);
  });

  it("keeps white text on prominent buttons at AA contrast", () => {
    expect(contrast(defaults[0], "#ffffff")).toBeGreaterThanOrEqual(4.5);
  });
});
