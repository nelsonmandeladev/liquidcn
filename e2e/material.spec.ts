import { expect, test, type Page } from "@playwright/test";
import { activate, computed, expectLensAt, lensOf, open, openComponent } from "./support";

async function openMaterial(page: Page, touch: boolean) {
  await activate(page.getByRole("button", { name: "Glass material" }), touch);
  await expect(page.getByRole("dialog", { name: "Glass material" })).toBeVisible();
}

test("material tokens set on the root reach every glass surface", async ({ page, hasTouch }) => {
  await openComponent(page, "button");
  const edit = page.getByRole("button", { name: "Edit" });
  expect(await computed(edit, "backdrop-filter")).toContain("blur(20px)");
  await openMaterial(page, hasTouch);
  await page.getByRole("slider", { name: "Blur" }).fill("0");
  expect(await computed(edit, "backdrop-filter")).toContain("blur(0px)");
});

test.describe("ghost buttons", () => {
  test.use({ colorScheme: "dark" });

  test("stay clear in dark material and with reduced transparency", async ({ page, hasTouch }) => {
    await open(page, "/docs");
    const ghost = page.getByRole("button", { name: "Toggle dark theme" });
    await expect(page.locator("html")).toHaveClass(/dark/);
    expect(await computed(ghost, "border-top-color")).toBe("rgba(0, 0, 0, 0)");
    await openMaterial(page, hasTouch);
    await activate(page.getByRole("switch", { name: "Reduce transparency" }), hasTouch);
    await expect(page.locator("html")).toHaveAttribute("data-reduced-transparency", "true");
    expect(await computed(ghost, "background-color")).toBe("rgba(0, 0, 0, 0)");
  });
});

test("reduce motion from the material panel snaps the lens", async ({ page, hasTouch }) => {
  await openComponent(page, "tabs");
  await openMaterial(page, hasTouch);
  await activate(page.getByRole("switch", { name: "Reduce motion" }), hasTouch);
  await page.keyboard.press("Escape");
  const list = page.getByRole("tablist", { name: "Photo library" });
  const albums = list.getByRole("tab", { name: "Albums" });
  await activate(albums, hasTouch);
  const lens = await lensOf(list);
  expect(lens.state).toBe("rest");
  expect(lens.lift).toBe(0);
  await expectLensAt(list, albums);
});
