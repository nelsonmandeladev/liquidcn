import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { openComponent, sitePages } from "./support";

const wcag = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];

async function expectAccessible(page: Page) {
  const { violations } = await new AxeBuilder({ page }).withTags(wcag).analyze();
  expect(violations.map(({ id, nodes }) => `${id}: ${nodes[0]?.target}`)).toEqual([]);
}

for (const path of sitePages) {
  test(`${path} loads cleanly and passes WCAG A/AA checks`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });
    await page.goto(path);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expectAccessible(page);
    expect(errors).toEqual([]);
  });
}

test.describe("in dark mode", () => {
  test.use({ colorScheme: "dark" });

  for (const path of ["/", "/docs/components/tabs"]) {
    test(`${path} passes WCAG A/AA checks`, async ({ page }) => {
      await page.goto(path);
      await expect(page.locator("html")).toHaveClass(/dark/);
      await expectAccessible(page);
    });
  }
});

test("the open menu passes WCAG A/AA checks", async ({ page }) => {
  await openComponent(page, "dropdown-menu");
  await page.getByRole("button", { name: "Options" }).click();
  await expect(page.getByRole("menu")).toBeVisible();
  const { violations } = await new AxeBuilder({ page }).include('[role="menu"]').analyze();
  expect(violations.map(({ id }) => id)).toEqual([]);
});

test("unknown pages return 404", async ({ page }) => {
  const response = await page.goto("/docs/components/nope");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1, name: "Nothing here" })).toBeVisible();
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
