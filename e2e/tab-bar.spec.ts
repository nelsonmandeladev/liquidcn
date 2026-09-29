import { expect, test, type Locator, type Page } from "@playwright/test";
import { activate, centerOf, computed, openComponent, reveal } from "./support";

// The header has a tab bar too; this is the first example's.
const phone = (page: Page) => page.locator("main .liquid-tab-bar").first();
const part = (bar: Locator, name: string) => bar.locator(`.liquid-tab-bar-${name}`);
const width = (locator: Locator) =>
  locator.evaluate((element: HTMLElement) => element.getBoundingClientRect().width);

test.describe("tab bar search", () => {
  test.beforeEach(({ page }) => openComponent(page, "tab-bar"));

  test("folds the tabs into a circle and stretches search into a field", async ({
    page,
    hasTouch,
  }) => {
    const bar = phone(page);
    await reveal(bar);
    const before = await width(bar);
    await activate(bar.getByRole("button", { name: "Search" }), hasTouch);
    const field = bar.getByRole("searchbox", { name: "Search" });
    await expect(field).toBeFocused();
    await expect(bar).not.toHaveAttribute("data-liquid-morphing");
    const items = part(bar, "items");
    const [itemsWidth, itemsHeight] = await items.evaluate((element: HTMLElement) => [
      element.offsetWidth,
      element.offsetHeight,
    ]);
    expect(itemsWidth).toBe(itemsHeight);
    // The bar keeps its width: what the tabs give up, the field takes.
    expect(Math.abs((await width(bar)) - before)).toBeLessThan(1.5);
    await expect(bar.getByRole("button", { name: "Back to Contacts" })).toBeVisible();
    await expect(bar.getByRole("tab")).toHaveCount(0);
    await field.fill("gr");
    await expect(page.getByText("1 found")).toBeVisible();
  });

  test("closes back into the tabs and returns focus to search", async ({ page, hasTouch }) => {
    const bar = phone(page);
    await activate(bar.getByRole("button", { name: "Search" }), hasTouch);
    await expect(bar.getByRole("searchbox")).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(bar.getByRole("tab")).toHaveCount(3);
    await expect(bar.getByRole("button", { name: "Search" })).toBeFocused();
    await activate(bar.getByRole("button", { name: "Search" }), hasTouch);
    await activate(bar.getByRole("button", { name: "Back to Contacts" }), hasTouch);
    await expect(bar.getByRole("tab", { name: "Contacts" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });

  test("pressing search fuses it with the tab bar", async ({ page, isMobile }) => {
    test.skip(isMobile, "Multi-step pointer input is mouse-only in Playwright.");
    const bar = phone(page);
    await reveal(bar);
    const neck = bar.locator(".liquid-fusion");
    await expect(neck).toBeHidden();
    const point = await centerOf(bar.getByRole("button", { name: "Search" }));
    await page.mouse.move(point.x, point.y);
    await page.mouse.down();
    await expect(neck).toBeVisible();
    expect(await neck.evaluate((element: HTMLElement) => element.style.clipPath)).toMatch(
      /^path\("M /,
    );
    await page.mouse.up();
    await expect(neck).toBeHidden();
  });

  test("switches at once under reduced motion", async ({ page, hasTouch }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    const bar = phone(page);
    await activate(bar.getByRole("button", { name: "Search" }), hasTouch);
    expect(await bar.getAttribute("data-liquid-morphing")).toBeNull();
    await expect(bar.getByRole("searchbox")).toBeFocused();
  });
});

test.describe("refraction", () => {
  test.skip(
    ({ browserName }) => browserName !== "chromium",
    "SVG backdrop filters are Chromium-only.",
  );

  test("bends the backdrop at the rim, and stops where glass must be plain", async ({ page }) => {
    await openComponent(page, "tab-bar");
    const glass = part(phone(page), "items");
    await expect(glass).toHaveAttribute("data-liquid-refraction", "");
    expect(await computed(glass, "backdrop-filter")).toMatch(
      /blur\(20px\).*url\("#liquid-refraction-\d+"\)/,
    );
    const filter = await glass.evaluate((element: HTMLElement) => {
      const id = element.style.getPropertyValue("--liquid-refraction").match(/#([\w-]+)/)?.[1];
      const image = document.getElementById(id ?? "")?.querySelector("feImage");
      return image?.getAttribute("href")?.slice(0, 22);
    });
    expect(filter).toBe("data:image/png;base64,");
    await page.emulateMedia({ contrast: "more" });
    expect(await computed(glass, "backdrop-filter")).toBe("none");
    await page.emulateMedia({ contrast: null, forcedColors: "active" });
    expect(await computed(glass, "backdrop-filter")).not.toContain("url(");
  });
});
