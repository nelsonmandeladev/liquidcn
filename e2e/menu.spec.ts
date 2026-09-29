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

  test("a menu beside its button is drawn back into it through a neck", async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, "Checked once; the fold is the same on touch.");
    const trigger = page.getByRole("button", { name: "Share" });
    await trigger.click();
    await expect(page.getByRole("menu")).toHaveAttribute("data-liquid-morph", "ready");
    // Watch every frame of the 320 ms fold for the neck.
    const seen = page.evaluate(
      () =>
        new Promise<boolean>((resolve) => {
          let shown = false;
          const start = performance.now();
          const watch = () => {
            const neck = document.querySelector<HTMLElement>('.liquid-fusion[data-layer="fixed"]');
            shown ||= !!neck && !neck.hidden;
            if (performance.now() - start < 900) requestAnimationFrame(watch);
            else resolve(shown);
          };
          requestAnimationFrame(watch);
        }),
    );
    await page.keyboard.press("Escape");
    expect(await seen).toBe(true);
    await expect(page.getByRole("menu")).toHaveCount(0);
    await expect(page.locator(".liquid-fusion[data-layer='fixed']")).toHaveCount(0);
  });

  test("scrolls inside the panel when the screen is too short for it", async ({
    page,
    hasTouch,
  }) => {
    const height = 300;
    await page.setViewportSize({ width: page.viewportSize()!.width, height });
    const trigger = page.getByRole("button", { name: "Sort photos" });
    await trigger.evaluate((element) => element.scrollIntoView({ block: "center" }));
    await activate(trigger, hasTouch);
    const menu = page.getByRole("menu");
    await expect(menu).toHaveAttribute("data-liquid-morph", "ready");
    await page.waitForTimeout(700); // let the panel finish forming
    const panel = await menu.evaluate((element) => {
      const box = element.getBoundingClientRect();
      const body = element.querySelector(".liquid-menu-body")!;
      return { top: box.top, bottom: box.bottom, scrolls: body.scrollHeight > body.clientHeight };
    });
    expect(panel.top).toBeGreaterThanOrEqual(0);
    expect(panel.bottom).toBeLessThanOrEqual(height);
    expect(panel.scrolls).toBe(true);
  });

  test("never shows a scrollbar while it forms", async ({ page, hasTouch }) => {
    const trigger = page.getByRole("button", { name: "Sort photos" });
    await trigger.evaluate((element) => element.scrollIntoView({ block: "center" }));
    // On every frame of the entrance, nothing in the menu that can scroll has anything to scroll.
    const frames = page.evaluate(
      () =>
        new Promise<string[]>((resolve) => {
          const overflowing: string[] = [];
          const start = performance.now();
          const scrolls = (element: Element) =>
            /auto|scroll/.test(getComputedStyle(element).overflowY) &&
            element.scrollHeight > element.clientHeight + 1;
          const watch = () => {
            const menu = document.querySelector('[role="menu"]');
            const body = menu?.querySelector(".liquid-menu-body");
            if (menu && scrolls(menu)) overflowing.push("panel");
            if (body && scrolls(body)) overflowing.push("body");
            if (performance.now() - start < 900) requestAnimationFrame(watch);
            else resolve(overflowing);
          };
          requestAnimationFrame(watch);
        }),
    );
    await activate(trigger, hasTouch);
    expect(await frames).toEqual([]);
    await expect(page.getByRole("menu")).toBeVisible();
  });
});
