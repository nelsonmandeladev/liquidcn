import { readFile } from "node:fs/promises";
import { join } from "node:path";

/** Path of an example's source, relative to the project root. */
export const examplePath = (slug: string, example: string) =>
  join("src", "examples", slug, `${example}.tsx`);

/** The example exactly as a reader would copy it. Pages are prerendered, so this runs at build. */
export function readExample(slug: string, example: string) {
  return readFile(join(process.cwd(), examplePath(slug, example)), "utf8");
}
