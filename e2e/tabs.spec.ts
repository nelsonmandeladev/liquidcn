import { expect, test } from "@playwright/test";
import { activate, centerOf, expectLensAt, lensOf, openComponent, reveal } from "./support";

test.describe("tabs lens", () => {
  test.beforeEach(({ page }) => openComponent(page, "tabs"));

  test("a tap selects the tab and the lens lands on it", async ({ page, hasTouch }) => {
    const bar = page.getByRole("tablist", { name: "Phone" });
    const calls = bar.getByRole("tab", { name: "Calls" });
    await activate(calls, hasTouch);
    await expect(calls).toHaveAttribute("aria-selected", "true");
    await expect(page.getByText("Recent calls")).toBeVisible();
    await expectLensAt(bar, calls);
  });

  test("the lens lifts while pressed and lands on release", async ({ page, isMobile }) => {
    test.skip(isMobile, "Multi-step pointer input is mouse-only in Playwright.");
    const bar = page.getByRole("tablist", { name: "Phone" });
    await reveal(bar);
    const point = await centerOf(bar.getByRole("tab", { name: "Keypad" }));
    await page.mouse.move(point.x, point.y);
    await page.mouse.down();
    await expect.poll(async () => (await lensOf(bar)).lift).toBeGreaterThan(0.9);
    await expect(bar).toHaveAttribute("data-liquid-pressed", "true");
    // Lifted glass casts no dark shadow: every shadow on the lens is an inner highlight.
    const shadows = await bar
      .locator(":scope > .liquid-lens")
      .evaluate((lens) => getComputedStyle(lens).boxShadow.split(/,(?![^(]*\))/));
    expect(shadows.filter((shadow) => !shadow.includes("inset"))).toEqual([]);
    await page.mouse.up();
    await expect.poll(async () => (await lensOf(bar)).state).toBe("rest");
    expect((await lensOf(bar)).lift).toBe(0);
  });

  test("dragging across tabs selects where the lens is released", async ({ page, isMobile }) => {
    test.skip(isMobile, "Multi-step pointer input is mouse-only in Playwright.");
    const bar = page.getByRole("tablist", { name: "Phone" });
    await reveal(bar);
    const contacts = bar.getByRole("tab", { name: "Contacts" });
    const from = await centerOf(bar.getByRole("tab", { name: "Calls" }));
    const to = await centerOf(contacts);
    await page.mouse.move(from.x, from.y);
    await page.mouse.down();
    await page.mouse.move(to.x, to.y, { steps: 8 });
    await page.mouse.up();
    await expect(contacts).toHaveAttribute("aria-selected", "true");
    await expect(page.getByText("393 contacts")).toBeVisible();
    await expectLensAt(bar, contacts);
  });

  test("arrow keys move the selection and the lens follows", async ({ page }) => {
    const list = page.getByRole("tablist", { name: "Photo library" });
    await list.getByRole("tab", { name: "Photos" }).focus();
    await page.keyboard.press("ArrowRight");
    const albums = list.getByRole("tab", { name: "Albums" });
    await expect(albums).toBeFocused();
    await expect(albums).toHaveAttribute("aria-selected", "true");
    await expectLensAt(list, albums);
  });

  test("the lens copy stays out of the accessibility tree", async ({ page }) => {
    await expect(page.getByRole("tablist", { name: "Phone" }).getByRole("tab")).toHaveCount(3);
  });
});

test.describe("tabs in dark mode", () => {
  test.use({ colorScheme: "dark" });

  test("no tab draws a border, before or after the lens arrives", async ({ page, hasTouch }) => {
    await openComponent(page, "tabs");
    await expect(page.locator("html")).toHaveClass(/dark/);
    const list = page.getByRole("tablist", { name: "Photo library" });
    const borders = () =>
      list
        .getByRole("tab")
        .evaluateAll((tabs) => tabs.map((tab) => getComputedStyle(tab).borderTopColor));
    expect(new Set(await borders())).toEqual(new Set(["rgba(0, 0, 0, 0)"]));
    // The new tab is selected at once, while the lens is still on its way.
    await activate(list.getByRole("tab", { name: "Favorites" }), hasTouch);
    expect(new Set(await borders())).toEqual(new Set(["rgba(0, 0, 0, 0)"]));
  });
});

test.describe("tabs lens with reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("snaps to the selection without lifting", async ({ page, hasTouch }) => {
    await openComponent(page, "tabs");
    const bar = page.getByRole("tablist", { name: "Phone" });
    const calls = bar.getByRole("tab", { name: "Calls" });
    await activate(calls, hasTouch);
    const lens = await lensOf(bar);
    expect(lens.state).toBe("rest");
    expect(lens.lift).toBe(0);
    await expectLensAt(bar, calls);
  });
});
