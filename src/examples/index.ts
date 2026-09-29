import registry from "../../registry.json";
import { buttonDoc } from "@/examples/button/docs";
import { dropdownMenuDoc } from "@/examples/dropdown-menu/docs";
import { sonnerDoc } from "@/examples/sonner/docs";
import { tabBarDoc } from "@/examples/tab-bar/docs";
import { tabsDoc } from "@/examples/tabs/docs";
import { toolbarDoc } from "@/examples/toolbar/docs";
import type { ComponentDoc } from "@/examples/types";

/**
 * Every documented component. Adding a registry item means adding its folder here; the docs
 * route, sidebar, index, pager, sitemap, and accessibility tests all follow from this list.
 */
const docs: ComponentDoc[] = [
  buttonDoc,
  dropdownMenuDoc,
  sonnerDoc,
  tabBarDoc,
  tabsDoc,
  toolbarDoc,
];

export type RegistryFile = { path: string; type: string };
export type RegistryItem = {
  name: string;
  title: string;
  description: string;
  dependencies?: string[];
  files: RegistryFile[];
};

export type DocumentedComponent = ComponentDoc & {
  slug: string;
  name: string;
  registry: RegistryItem;
};

const items = registry.items as RegistryItem[];

/** `liquid-dropdown-menu` becomes `dropdown-menu`. */
export const slugOf = (item: string) => item.replace(/^liquid-/, "");

function withRegistry(doc: ComponentDoc): DocumentedComponent {
  const item = items.find((candidate) => candidate.name === doc.item);
  if (!item) throw new Error(`${doc.item} is documented but missing from registry.json`);
  return {
    ...doc,
    slug: slugOf(doc.item),
    name: item.title.replace(/^Liquid /, ""),
    registry: item,
  };
}

/** Documented components in sidebar order, alphabetical as the list grows. */
export const components = docs.map(withRegistry).sort((a, b) => a.name.localeCompare(b.name));

export function componentBySlug(slug: string) {
  return components.find((component) => component.slug === slug);
}
