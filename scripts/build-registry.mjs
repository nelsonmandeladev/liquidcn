import { readFile, mkdir, writeFile } from "node:fs/promises";
import { registrySchema, registryItemSchema } from "shadcn/schema";

const registry = registrySchema.parse(JSON.parse(await readFile("registry.json", "utf8")));
await mkdir("public/r", { recursive: true });
for (const item of registry.items) {
  const files = await Promise.all(
    item.files.map(async (file) => ({ ...file, content: await readFile(file.path, "utf8") })),
  );
  const output = registryItemSchema.parse({
    $schema: "https://ui.shadcn.com/schema/registry-item.json",
    ...item,
    files,
  });
  await writeFile(`public/r/${item.name}.json`, JSON.stringify(output, null, 2) + "\n");
}
await writeFile("public/r/registry.json", JSON.stringify(registry, null, 2) + "\n");
console.log(`Validated and built ${registry.items.length} registry items.`);
