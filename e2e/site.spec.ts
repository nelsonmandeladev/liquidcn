import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { componentNames, openComponent } from "./support";

for (const name of componentNames) {
  test(`${name} page loads cleanly and passes WCAG A/AA checks`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });
    await openComponent(page, name);
    await expect(page.getByRole("heading", { level: 1, name })).toBeVisible();
    const { violations } = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    expect(violations.map(({ id, nodes }) => `${id}: ${nodes[0]?.target}`)).toEqual([]);
    expect(errors).toEqual([]);
  });
}

test("the open menu passes WCAG A/AA checks", async ({ page }) => {
  await openComponent(page, "Dropdown menu");
  await page.getByRole("button", { name: "Options" }).click();
  await expect(page.getByRole("menu")).toBeVisible();
  const { violations } = await new AxeBuilder({ page }).include('[role="menu"]').analyze();
  expect(violations.map(({ id }) => id)).toEqual([]);
});

test("serves every registry item with its sources", async ({ request }) => {
  const index = await (await request.get("/r/registry.json")).json();
  for (const { name } of index.items as { name: string }[]) {
    const response = await request.get(`/r/${name}.json`);
    expect(response.ok()).toBe(true);
    const item = await response.json();
    expect(item.files.every((file: { content: string }) => file.content.length > 0)).toBe(true);
  }
});
