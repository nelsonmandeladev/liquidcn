"use client";

import { toast } from "@/components/ui/liquid-sonner";
import { useEffect, useState } from "react";

export type Settings = {
  blur: number;
  tint: number;
  theme: "light" | "dark";
  reduceTransparency: boolean;
  reduceMotion: boolean;
  viscosity: number;
};

export const defaultSettings: Settings = {
  blur: 20,
  tint: 22,
  theme: "light",
  reduceTransparency: false,
  reduceMotion: false,
  viscosity: 35,
};

export type SettingsState = {
  settings: Settings;
  update: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
  reset: () => void;
};

/** Playground material and motion settings, applied to the document for portaled content. */
export function useSettings(): SettingsState {
  const [settings, setSettings] = useState(defaultSettings);
  useEffect(() => {
    const root = document.documentElement;
    const { blur, tint, theme, reduceTransparency, reduceMotion, viscosity } = settings;
    root.dataset.liquidTheme = theme;
    root.dataset.reducedTransparency = String(reduceTransparency);
    root.dataset.reducedMotion = String(reduceMotion);
    const properties = {
      "--liquid-viscosity": String(viscosity / 100),
      "--liquid-morph-duration": `${380 + viscosity * 4}ms`,
      "--preview-blur": `${blur}px`,
      "--preview-tint": String(tint / 100),
    };
    Object.entries(properties).forEach(([name, value]) => root.style.setProperty(name, value));
    return () => {
      delete root.dataset.liquidTheme;
      delete root.dataset.reducedTransparency;
      delete root.dataset.reducedMotion;
      Object.keys(properties).forEach((name) => root.style.removeProperty(name));
    };
  }, [settings]);
  return {
    settings,
    update: (key, value) => setSettings((current) => ({ ...current, [key]: value })),
    reset: () => setSettings(defaultSettings),
  };
}

/**
 * Blur changes detail, not brightness. At this opacity even a black backdrop becomes light
 * enough for dark ink; dark material always keeps light ink.
 */
export function sceneContrast({ theme, reduceTransparency, tint }: Settings) {
  return theme === "light" && (reduceTransparency || tint >= 55) ? "dark" : "light";
}

export async function copy(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  } catch {
    toast.error("Clipboard unavailable. Select and copy the text.");
  }
}
