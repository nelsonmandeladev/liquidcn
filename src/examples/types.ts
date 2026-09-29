import type { ComponentType } from "react";
import type { LucideIcon } from "lucide-react";
import type { SceneName } from "@/www/stage-scenes";

/**
 * One example: a file in the component's folder, rendered live and shown as its own source.
 * `name` is the file name without `.tsx`, so `demo` is `src/examples/<slug>/demo.tsx`.
 */
export type Example = {
  name: string;
  title: string;
  description?: string;
  component: ComponentType;
  /** Photo behind the preview. Defaults to the component's scene. */
  scene?: SceneName;
};

export type Prop = { name: string; type: string; default?: string; description: string };

export type ApiEntry = { component: string; description: string; props: Prop[] };

/**
 * Everything the site needs to document a registry item. Title, description, files, and
 * dependencies come from `registry.json`; this adds what only a person can write.
 */
export type ComponentDoc = {
  /** Registry item name, e.g. `liquid-button`. */
  item: string;
  icon: LucideIcon;
  /** What to try on the preview, in one sentence. */
  hint: string;
  scene: SceneName;
  /** The first example is the page's main preview. */
  examples: [Example, ...Example[]];
  /** Minimal import and JSX, shown under Usage. */
  usage: string;
  api: ApiEntry[];
  /** Parameter and value pairs from docs/design.md. */
  motion: [string, string][];
  accessibility: string[];
};
