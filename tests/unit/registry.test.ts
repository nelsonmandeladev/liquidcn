import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

type Item = { name: string; files: { path: string }[]; dependencies?: string[] };
const registry = JSON.parse(readFileSync("registry.json", "utf8")) as { items: Item[] };
const manifest = JSON.parse(readFileSync("package.json", "utf8")) as {
  dependencies: Record<string, string>;
};

// A consumer receives exactly the files an item lists, so every local import must be among them.
describe.each(registry.items)("registry item $name", (item) => {
  const paths = item.files.map((file) => file.path);
  const sources = paths.filter((path) => /\.(ts|tsx)$/.test(path));

  it("lists files that exist", () => {
    expect(paths.filter((path) => !existsSync(path))).toEqual([]);
  });

  it("ships every component module its files import", () => {
    const missing = sources.flatMap((path) =>
      [...readFileSync(path, "utf8").matchAll(/from "@\/components\/ui\/([\w-]+)"/g)]
        .map((match) => match[1])
        .filter((name) => !paths.some((file) => /\/([\w-]+)\.tsx?$/.exec(file)?.[1] === name))
        .map((name) => `${path} -> ${name}`),
    );
    expect(missing).toEqual([]);
  });

  it("declares the packages its files import", () => {
    const declared = new Set(item.dependencies ?? []);
    const packages = sources.flatMap((path) =>
      [...readFileSync(path, "utf8").matchAll(/from "((?:@[\w-]+\/)?[\w-]+)[^"]*"/g)]
        .map((match) => match[1])
        .filter((name) => name in manifest.dependencies && !["react", "react-dom"].includes(name)),
    );
    expect([...new Set(packages)].filter((name) => !declared.has(name))).toEqual([]);
  });
});
