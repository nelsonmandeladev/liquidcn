import { afterEach, describe, expect, it, vi } from "vitest";
import {
  defaultMaterial,
  materialKey,
  materialOutput,
  preferencesScript,
  themeKey,
} from "@/www/material";

const root = document.documentElement;

function runScript() {
  new Function(preferencesScript())();
}

afterEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  root.className = "";
  root.removeAttribute("style");
  for (const name of Object.keys(root.dataset)) delete root.dataset[name];
});

describe("materialOutput", () => {
  it("writes the tokens the library reads", () => {
    const { style, data } = materialOutput(defaultMaterial);
    expect(style).toEqual({
      "--liquid-blur": "20px",
      "--liquid-tint": "0.22",
      "--liquid-viscosity": "0.35",
      "--liquid-morph-duration": "520ms",
    });
    expect(data).toEqual({ reducedTransparency: "false", reducedMotion: "false", glass: "clear" });
  });

  it("calls glass opaque when it is nearly solid or transparency is reduced", () => {
    expect(materialOutput({ ...defaultMaterial, tint: 55 }).data.glass).toBe("opaque");
    expect(materialOutput({ ...defaultMaterial, tint: 54 }).data.glass).toBe("clear");
    const reduced = materialOutput({ ...defaultMaterial, reduceTransparency: true });
    expect(reduced.data).toMatchObject({ glass: "opaque", reducedTransparency: "true" });
  });
});

describe("preferencesScript", () => {
  it("follows the system theme when nothing is stored", () => {
    vi.spyOn(window, "matchMedia").mockReturnValue({ matches: true } as MediaQueryList);
    runScript();
    expect(root.classList.contains("dark")).toBe(true);
    expect(root.style.colorScheme).toBe("dark");
  });

  it("prefers the stored theme over the system", () => {
    vi.spyOn(window, "matchMedia").mockReturnValue({ matches: true } as MediaQueryList);
    localStorage.setItem(themeKey, "light");
    runScript();
    expect(root.classList.contains("dark")).toBe(false);
  });

  it("applies the default material, or the session's", () => {
    runScript();
    expect(root.style.getPropertyValue("--liquid-blur")).toBe("20px");
    expect(root.dataset.glass).toBe("clear");

    const material = { ...defaultMaterial, blur: 4, reduceMotion: true };
    const stored = { material, output: materialOutput(material) };
    sessionStorage.setItem(materialKey, JSON.stringify(stored));
    runScript();
    expect(root.style.getPropertyValue("--liquid-blur")).toBe("4px");
    expect(root.dataset.reducedMotion).toBe("true");
  });

  it("survives unreadable storage", () => {
    sessionStorage.setItem(materialKey, "{not json");
    expect(runScript).not.toThrow();
    expect(root.style.getPropertyValue("--liquid-tint")).toBe("0.22");
  });
});
