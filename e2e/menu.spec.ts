import { expect, test } from "@playwright/test";
import { activate, centerOf, openComponent } from "./support";

test.describe("dropdown menu", () => {
  test.beforeEach(({ page }) => openComponent(page, "dropdown-menu"));

  test("opens over its trigger without choosing the item under the pointer", async ({
    page,
    hasTouch,
  }) => {
    const trigger = page.getByRole("button", { name: "Options" });
    const before = (await trigger.boundingBox())!;
    await activate(trigger, hasTouch);
    const menu = page.getByRole("menu");
    await expect(menu).toBeVisible();
    const panel = (await menu.boundingBox())!;
    // The panel covers the trigger's center, as on iOS.
    const cx = before.x + before.width / 2;
    const cy = before.y + before.height / 2;
    expect(cx > panel.x && cx < panel.x + panel.width).toBe(true);
    expect(cy > panel.y && cy < panel.y + panel.height).toBe(true);
    await page.waitForTimeout(700);
    await expect(menu).toBeVisible();
    await expect(page.getByText("Saved to collection")).toHaveCount(0);
  });

  test("pressing the trigger and dragging onto an item selects it", async ({ page, isMobile }) => {
    test.skip(isMobile, "Multi-step pointer input is mouse-only in Playwright.");
    await page.context().grantPermissions(["clipboard-read", "clipboard-write"]);
    const start = await centerOf(page.getByRole("button", { name: "Options" }));
    await page.mouse.move(start.x, start.y);
    await page.mouse.down();
    await expect(page.getByRole("menu")).toHaveAttribute("data-liquid-morph", "ready");
    await page.waitForTimeout(600); // let the panel finish forming before aiming at an item
    // The first item opens under the pointer; releasing there is a still press, not a choice.
    const end = await centerOf(page.getByRole("menuitem", { name: "Copy link" }));
    await page.mouse.move(end.x, end.y, { steps: 6 });
    await page.mouse.up();
    await expect(page.getByText("Copied to clipboard")).toBeVisible();
    await expect(page.getByRole("menu")).toHaveCount(0);
  });

  test("Escape folds the menu back and returns focus to the trigger", async ({ page }) => {
    const trigger = page.getByRole("button", { name: "Options" });
    await trigger.click();
    await expect(page.getByRole("menu")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("menu")).toHaveCount(0);
    await expect(trigger).toBeFocused();
    await expect(trigger).toHaveCSS("opacity", "1");
  });

  test("works from the keyboard", async ({ page }) => {
    await page.getByRole("button", { name: "Options" }).focus();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("menuitem", { name: "Save to collection" })).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page.getByText("Saved to collection")).toBeVisible();
  });
});
