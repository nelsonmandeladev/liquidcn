import { useSyncExternalStore } from "react";
import {
  applyMaterial,
  defaultMaterial,
  materialKey,
  materialOutput,
  themeKey,
  type Material,
} from "@/www/material";

// Small external stores, so server markup renders defaults and the client takes over after
// hydration without mismatches. The <head> script has already painted the stored values.

const listeners = new Set<() => void>();
let material: Material | null = null;

function storedMaterial(): Material {
  try {
    const stored = JSON.parse(sessionStorage.getItem(materialKey) ?? "null");
    return stored?.material ? { ...defaultMaterial, ...stored.material } : defaultMaterial;
  } catch {
    return defaultMaterial;
  }
}

function subscribeMaterial(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function setMaterial(next: Material) {
  material = next;
  const output = materialOutput(next);
  applyMaterial(document.documentElement, output);
  try {
    sessionStorage.setItem(materialKey, JSON.stringify({ material: next, output }));
  } catch {
    // Private windows may refuse storage; the setting still applies to this page.
  }
  listeners.forEach((listener) => listener());
}

export function useMaterial() {
  return useSyncExternalStore(
    subscribeMaterial,
    () => (material ??= storedMaterial()),
    () => defaultMaterial,
  );
}

function subscribeTheme(listener: () => void) {
  const observer = new MutationObserver(listener);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => observer.disconnect();
}

/** Whether the page is dark, following the class the <head> script set. */
export function useDarkTheme() {
  return useSyncExternalStore(
    subscribeTheme,
    () => document.documentElement.classList.contains("dark"),
    () => false,
  );
}

export function setDarkTheme(dark: boolean) {
  const root = document.documentElement;
  root.classList.toggle("dark", dark);
  root.style.colorScheme = dark ? "dark" : "light";
  try {
    localStorage.setItem(themeKey, dark ? "dark" : "light");
  } catch {
    // The choice lasts until reload.
  }
}
