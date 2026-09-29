import { existsSync, readFileSync } from "node:fs";
import { posix } from "node:path";
import { describe, expect, it } from "vitest";

type File = { path: string; type: string };
type Item = { name: string; files: File[]; dependencies?: string[] };
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

  it("ships every local module its files import", () => {
    const shipped = (module: string) =>
      ["", ".ts", ".tsx"].some((ext) => paths.includes(module + ext));
    const missing = sources.flatMap((path) =>
      [...readFileSync(path, "utf8").matchAll(/(?:from|import) "([^"]+)"/g)]
        .map((match) => localModule(path, match[1]))
        .filter((module) => module !== null && !shipped(module))
        .map((module) => `${path} -> ${module}`),
    );
    expect(missing).toEqual([]);
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
