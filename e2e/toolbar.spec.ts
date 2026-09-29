import { expect, test, type Page } from "@playwright/test";
import { centerOf, lensList, openComponent, reveal } from "./support";

const tools = (page: Page) => page.getByRole("toolbar", { name: "Editing tools" });

test.describe("toolbar", () => {
  test.beforeEach(({ page }) => openComponent(page, "toolbar"));

  test("sets its round button beside the group, as tall as the group", async ({ page }) => {
    const toolbar = tools(page);
    await reveal(toolbar);
    const group = (await lensList(toolbar, "liquid-toolbar-group").boundingBox())!;
    const round = (await toolbar.getByRole("button", { name: "Auto enhance" }).boundingBox())!;
    expect(Math.abs(round.height - group.height)).toBeLessThan(1);
    expect(Math.abs(round.width - round.height)).toBeLessThan(1);
    expect(Math.abs(round.y + round.height / 2 - (group.y + group.height / 2))).toBeLessThan(1);
    expect(round.x - (group.x + group.width)).toBeGreaterThan(4);
  });

  test("has one tab stop and moves between buttons with arrow keys", async ({ page }) => {
    const toolbar = tools(page);
    const select = toolbar.getByRole("button", { name: "Select" });
    await select.focus();
    await page.keyboard.press("ArrowRight");
    await expect(toolbar.getByRole("button", { name: "Crop" })).toBeFocused();
    await page.keyboard.press("End");
    await expect(toolbar.getByRole("button", { name: "Auto enhance" })).toBeFocused();
    await page.keyboard.press("ArrowRight");
    await expect(select).toBeFocused();
    await page.keyboard.press("Tab");
    expect(await toolbar.evaluate((element) => element.contains(document.activeElement))).toBe(
      false,
    );
  });

  test("pressing the round button fuses it with the group", async ({ page, isMobile }) => {
    test.skip(isMobile, "Multi-step pointer input is mouse-only in Playwright.");
    const toolbar = tools(page);
    await reveal(toolbar);
    const neck = toolbar.locator(".liquid-fusion");
    await expect(neck).toBeHidden();
    const point = await centerOf(toolbar.getByRole("button", { name: "Auto enhance" }));
    await page.mouse.move(point.x, point.y);
    await page.mouse.down();
    await expect(neck).toBeVisible();
    await page.mouse.up();
    await expect(neck).toBeHidden();
  });

  test("keeps the glass apart under reduced motion", async ({ page, isMobile }) => {
    test.skip(isMobile, "Multi-step pointer input is mouse-only in Playwright.");
    await page.emulateMedia({ reducedMotion: "reduce" });
    const toolbar = tools(page);
    await reveal(toolbar);
    const point = await centerOf(toolbar.getByRole("button", { name: "Auto enhance" }));
    await page.mouse.move(point.x, point.y);
    await page.mouse.down();
    await page.waitForTimeout(200);
    await expect(toolbar.locator(".liquid-fusion")).toBeHidden();
    await page.mouse.up();
  });
});
