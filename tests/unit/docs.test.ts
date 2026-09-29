import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { componentBySlug, components } from "@/examples";
import { docsOrder } from "@/www/docs/sections";
import { examplePath } from "@/www/docs/source";
import { currentLink, guides, mainNav, neighbors } from "@/www/nav";

const registry = JSON.parse(readFileSync("registry.json", "utf8")) as { items: { name: string }[] };

describe("component docs", () => {
  it("documents every registry item exactly once", () => {
    const documented = components.map((component) => component.item).sort();
    expect(documented).toEqual(registry.items.map((item) => item.name).sort());
  });

  it("gives every component its own page", () => {
    const slugs = components.map((component) => component.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const slug of slugs) expect(componentBySlug(slug)?.slug).toBe(slug);
    expect(componentBySlug("nope")).toBeUndefined();
  });

  it("takes names and descriptions from the registry", () => {
    const button = componentBySlug("button")!;
    expect(button.name).toBe("Button");
    expect(button.registry.description.length).toBeGreaterThan(20);
  });
});

// The Code tab shows the example file itself, so the file must exist, must be the component
// that renders, and must import only what a reader can install.
describe.each(
  components.flatMap((component) => component.examples.map((example) => ({ component, example }))),
)("example $component.slug/$example.name", ({ component, example }) => {
  const path = examplePath(component.slug, example.name);

  it("has a source file", () => {
    expect(existsSync(path)).toBe(true);
  });

  it("is the file the docs render", () => {
    const docs = readFileSync(join("src", "examples", component.slug, "docs.ts"), "utf8");
    const name = example.component.name;
    expect(docs).toMatch(new RegExp(`import ${name} from "\\./${example.name}";`));
  });

  it("imports only public modules", () => {
    const source = readFileSync(path, "utf8");
    const imports = [...source.matchAll(/from "([^"]+)"/g)].map((match) => match[1]);
    const allowed = (specifier: string) =>
      ["react", "lucide-react"].includes(specifier) || specifier.startsWith("@/components/ui/");
    expect(imports.filter((specifier) => !allowed(specifier))).toEqual([]);
  });
});

describe("navigation", () => {
  it("marks the deepest header link containing the page", () => {
    const title = (path: string) => currentLink(path, mainNav)?.title;
    expect(title("/docs")).toBe("Docs");
    expect(title("/docs/installation")).toBe("Docs");
    expect(title("/docs/components")).toBe("Components");
    expect(title("/docs/components/tabs")).toBe("Components");
    expect(title("/docs/theming")).toBe("Theming");
    expect(title("/")).toBeUndefined();
    expect(title("/docsearch")).toBeUndefined();
  });

  it("orders every docs page once, guides first", () => {
    const hrefs = docsOrder.map((link) => link.href);
    expect(new Set(hrefs).size).toBe(hrefs.length);
    expect(hrefs.slice(0, guides.length)).toEqual(guides.map((link) => link.href));
    for (const { slug } of components) expect(hrefs).toContain(`/docs/components/${slug}`);
  });

  it("finds the previous and next pages", () => {
    const order = [
      { href: "/a", title: "A" },
      { href: "/b", title: "B" },
      { href: "/c", title: "C" },
    ];
    expect(neighbors("/a", order)).toEqual({ previous: undefined, next: order[1] });
    expect(neighbors("/b", order)).toEqual({ previous: order[0], next: order[2] });
    expect(neighbors("/c", order)).toEqual({ previous: order[1], next: undefined });
    expect(neighbors("/x", order)).toEqual({ previous: undefined, next: undefined });
  });
});
