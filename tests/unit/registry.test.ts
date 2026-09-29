import { existsSync, readFileSync } from "node:fs";
import { posix } from "node:path";
import { describe, expect, it } from "vitest";

type File = { path: string; type: string };
type Item = {
  name: string;
  files: File[];
  dependencies?: string[];
  registryDependencies?: string[];
};
const registry = JSON.parse(readFileSync("registry.json", "utf8")) as { items: Item[] };
const manifest = JSON.parse(readFileSync("package.json", "utf8")) as {
  dependencies: Record<string, string>;
};

// The shadcn CLI writes a file into the alias folder for its type. It keeps the part of the
// source path after that folder's name, or only the file name when the path lacks it.
const aliasFolders: Record<string, string> = {
  "registry:ui": "components/ui",
  "registry:lib": "lib",
};
function installPath(file: File) {
  const folder = aliasFolders[file.type] ?? "components";
  const segments = file.path.split("/");
  const index = segments.indexOf(posix.basename(folder));
  const rest = index === -1 ? segments.at(-1) : segments.slice(index + 1).join("/");
  return `${folder}/${rest}`;
}

// Liquid components extend the consumer's base shadcn components, whichever primitive library
// those use, so they never import one themselves.
const primitives = /^(radix-ui|@radix-ui\/|@base-ui|react-aria)/;

// Every primitive library sets ARIA, but each names its other states its own way: Radix's
// `data-state`, Base UI's `data-open`, React Aria's `data-selected`, and their variables.
const primitiveStates =
  /\bdata-(?:state|highlighted|active|selected|focused|pressed|hovered|open|closed|entering|exiting|starting-style|ending-style|side|align|placement|disabled)\b|\bdataset\.(?:state|highlighted|active|selected|focused|pressed|open|closed|side|align|placement|disabled)\b|--radix-|--available-height|data-\[/g;

/** A base shadcn component, such as `src/components/ui/button`, as its registry name. */
const baseComponent = (module: string) => /^src\/components\/ui\/([\w-]+)$/.exec(module)?.[1];

const importsOf = (path: string) =>
  [...readFileSync(path, "utf8").matchAll(/(?:from|import) "([^"]+)"/g)].map((match) => match[1]);

/** The repository path a local import points at; null for packages and the shared `utils` item. */
function localModule(from: string, specifier: string) {
  if (specifier === "@/lib/utils") return null;
  if (specifier.startsWith("@/")) return `src/${specifier.slice(2)}`;
  return specifier.startsWith(".") ? posix.join(posix.dirname(from), specifier) : null;
}

// A consumer receives exactly the files an item lists, so every local import must be among them.
describe.each(registry.items)("registry item $name", (item) => {
  const paths = item.files.map((file) => file.path);
  const sources = paths.filter((path) => /\.(ts|tsx)$/.test(path));

  it("lists files that exist", () => {
    expect(paths.filter((path) => !existsSync(path))).toEqual([]);
  });

  // Base components come from the shadcn registry, built for the consumer's primitive library.
  it("ships every local module its files import, or depends on its base component", () => {
    const bases = item.registryDependencies ?? [];
    const shipped = (module: string) =>
      ["", ".ts", ".tsx"].some((ext) => paths.includes(module + ext)) ||
      bases.includes(baseComponent(module) ?? "");
    const missing = sources.flatMap((path) =>
      importsOf(path)
        .map((specifier) => localModule(path, specifier))
        .filter((module) => module !== null && !shipped(module))
        .map((module) => `${path} -> ${module}`),
    );
    expect(missing).toEqual([]);
  });

  // A consumer's own base components stay as they are.
  it("never ships a base shadcn component", () => {
    expect(paths.filter((path) => baseComponent(path.replace(/\.tsx?$/, "")))).toEqual([]);
  });

  it("imports no primitive library directly", () => {
    const direct = sources.flatMap((path) =>
      importsOf(path)
        .filter((specifier) => primitives.test(specifier))
        .map((specifier) => `${path} -> ${specifier}`),
    );
    expect(direct).toEqual([]);
  });

  // Styles and motion key on ARIA and liquidcn's own `data-liquid-*` attributes, so they work on
  // whichever primitive the consumer's base components use.
  it("reads ARIA and its own attributes, never a primitive's", () => {
    const found = paths.flatMap((path) =>
      [...readFileSync(path, "utf8").matchAll(primitiveStates)].map(
        (match) => `${path}: ${match[0]}`,
      ),
    );
    expect(found).toEqual([]);
  });

  // Imports keep their path under the alias, so a file installed anywhere else breaks them,
  // and a liquid wrapper flattened into `components/ui/` would overwrite its base component.
  it("installs each file where its imports expect it", () => {
    const misplaced = item.files
      .filter((file) => installPath(file) !== file.path.replace(/^src\//, ""))
      .map((file) => `${file.path} -> ${installPath(file)}`);
    expect(misplaced).toEqual([]);
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
