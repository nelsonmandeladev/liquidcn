import { expect, test, type Locator } from "@playwright/test";
import { activate, expectLensAt, lensList, open, openComponent } from "./support";

const box = async (locator: Locator) => (await locator.boundingBox())!;

test.describe("desktop navigation", () => {
  test.skip(({ isMobile }) => isMobile, "The header and sidebar links are desktop-only.");

  test("the header lens travels to the new section", async ({ page }) => {
    await openComponent(page, "button");
    const nav = page.getByRole("navigation", { name: "Main" });
    const list = lensList(nav, "site-nav");
    await expectLensAt(list, nav.getByRole("link", { name: "Components" }));
    await nav.getByRole("link", { name: "Theming" }).click();
    await expect(page).toHaveURL(/\/docs\/theming$/);
    const theming = nav.getByRole("link", { name: "Theming" });
    await expect(theming).toHaveAttribute("aria-current", "page");
    await expectLensAt(list, theming);
  });

  test("the sidebar lens lands on the page you open", async ({ page }) => {
    await openComponent(page, "button");
    const sidebar = page.getByRole("navigation", { name: "Docs" });
    await sidebar.getByRole("link", { name: "Installation" }).click();
    await expect(page.getByRole("heading", { level: 1, name: "Installation" })).toBeVisible();
    const link = sidebar.getByRole("link", { name: "Installation" });
    await expect(link).toHaveAttribute("aria-current", "page");
    const list = lensList(sidebar, "docs-nav");
    await expect.poll(() => list.getAttribute("data-liquid-lens")).toBe("rest");
    const [lensTop, linkTop] = await list.evaluate((element) => {
      const lens = element.querySelector<HTMLElement>(".liquid-lens")!;
      const current = element.querySelector<HTMLElement>('[aria-current="page"]')!;
      return [new DOMMatrix(getComputedStyle(lens).transform).m42, current.offsetTop];
    });
    expect(lensTop).toBeCloseTo(linkTop, 0);
  });

  test("the pager walks through the docs in order", async ({ page }) => {
    await open(page, "/docs");
    await page
      .getByRole("navigation", { name: "Pages" })
      .getByRole("link", { name: /Next/ })
      .click();
    await expect(page.getByRole("heading", { level: 1, name: "Installation" })).toBeVisible();
  });
});

test("the mobile menu grows over its button and navigates", async ({ page, isMobile }) => {
  test.skip(!isMobile, "The menu replaces the header links on small screens.");
  await open(page, "/");
  await page.getByRole("button", { name: "Menu" }).tap();
  const menu = page.getByRole("menu");
  await expect(menu).toBeVisible();
  await menu.getByRole("menuitem", { name: "Tabs" }).tap();
  await expect(page).toHaveURL(/\/docs\/components\/tabs$/);
  await expect(page.getByRole("heading", { level: 1, name: "Tabs" })).toBeVisible();
});

test("the theme choice survives a reload", async ({ page, hasTouch }) => {
  await open(page, "/docs");
  await expect(page.locator("html")).not.toHaveClass(/dark/);
  await activate(page.getByRole("button", { name: "Toggle dark theme" }), hasTouch);
  await expect(page.locator("html")).toHaveClass(/dark/);
  await page.reload();
  await expect(page.locator("html")).toHaveClass(/dark/);
});

test("the package manager is remembered across pages", async ({ page, hasTouch }) => {
  await open(page, "/docs/installation");
  await activate(page.getByRole("tab", { name: "npm", exact: true }).first(), hasTouch);
  await openComponent(page, "tabs");
  const command = page.getByRole("tabpanel").filter({ hasText: "liquid-tabs.json" });
  await expect(command).toContainText("npx shadcn@latest add");
});

test.describe("header", () => {
  test("floats as separate glass groups, the tab bar centered and only as wide as its tabs", async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, "Phones keep the sections in the menu.");
    await open(page, "/docs");
    const viewport = page.viewportSize()!;
    const bar = await box(page.locator(".site-tab-bar"));
    const tabs = await box(page.locator(".site-tab-bar .liquid-tab-bar-items"));
    const search = await box(page.getByRole("button", { name: "Search docs" }));
    expect(Math.abs(bar.x + bar.width / 2 - viewport.width / 2)).toBeLessThan(2);
    expect(bar.width).toBeLessThan(viewport.width * 0.5);
    // Search is its own circle beside the tabs, as in iOS 26.
    expect(search.width).toBeCloseTo(search.height, 0);
    expect(search.x).toBeGreaterThan(tabs.x + tabs.width);
    const actions = await box(page.locator(".site-actions"));
    expect(actions.x).toBeGreaterThan(bar.x + bar.width);
  });

  test("search finds a page and opens it from the keyboard", async ({ page, hasTouch }) => {
    await openComponent(page, "button");
    await activate(page.getByRole("button", { name: "Search docs" }), hasTouch);
    const field = page.getByRole("combobox", { name: "Search docs" });
    await expect(field).toBeFocused();
    await expect(page.getByRole("option", { name: /Introduction/ })).toBeVisible();
    await field.fill("toolbar");
    await expect(page.getByRole("option").first()).toContainText("Toolbar");
    await expect(field).toHaveAttribute("aria-activedescendant", "site-search-option-0");
    await page.keyboard.press("Enter");
    // Unlike a prefetched link, the chosen page renders on request, which is slow in dev under load.
    await expect(page).toHaveURL(/\/docs\/components\/toolbar$/, { timeout: 15_000 });
    await expect(page.getByRole("heading", { level: 1, name: "Toolbar" })).toBeVisible();
    await expect(page.getByRole("combobox")).toHaveCount(0);
  });

  test("arrow keys choose among results and a tap opens one", async ({ page, hasTouch }) => {
    await openComponent(page, "button");
    await activate(page.getByRole("button", { name: "Search docs" }), hasTouch);
    await page.getByRole("combobox").fill("tab");
    await page.keyboard.press("ArrowDown");
    const second = page.getByRole("option").nth(1);
    await expect(second).toHaveAttribute("aria-selected", "true");
    await activate(page.getByRole("option", { name: /Tab Bar/ }), hasTouch);
    await expect(page).toHaveURL(/\/docs\/components\/tab-bar$/, { timeout: 15_000 });
  });

  test("/ opens search and Escape returns to the search button", async ({ page, isMobile }) => {
    test.skip(isMobile, "Keyboard shortcuts need a keyboard.");
    await open(page, "/docs");
    await page.keyboard.press("/");
    await expect(page.getByRole("combobox", { name: "Search docs" })).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("button", { name: "Search docs" })).toBeFocused();
    await expect(
      page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Docs" }),
    ).toBeVisible();
  });

  test("on a phone the field stretches across the header", async ({ page, isMobile }) => {
    test.skip(!isMobile, "Phone layout.");
    await open(page, "/");
    await page.getByRole("button", { name: "Search docs" }).tap();
    const field = page.getByRole("combobox", { name: "Search docs" });
    await expect(field).toBeVisible();
    await expect(page.locator(".site-tab-bar")).not.toHaveAttribute("data-liquid-morphing");
    const search = await box(page.locator(".site-tab-bar .liquid-tab-bar-search"));
    expect(search.width).toBeGreaterThan(page.viewportSize()!.width * 0.85);
    await expect(page.locator(".site-brand")).toBeHidden();
    await page.getByRole("button", { name: "Close search" }).tap();
    await expect(page.locator(".site-brand")).toBeVisible();
  });

  test("keyboard focus shows without an outline", async ({ page, isMobile }) => {
    test.skip(isMobile, "Keyboard focus needs a keyboard.");
    await openComponent(page, "tabs");
    const style = (locator: Locator) =>
      locator.evaluate((element) => {
        const { outlineStyle, backgroundColor } = getComputedStyle(element);
        return { outlineStyle, backgroundColor };
      });
    const search = page.getByRole("button", { name: "Search docs" });
    const glass = page.locator(".site-tab-bar .liquid-tab-bar-search");
    const idle = await style(glass);
    await page.getByRole("link", { name: "Motion" }).first().focus();
    await page.keyboard.press("Tab");
    await expect(search).toBeFocused();
    expect((await style(search)).outlineStyle).toBe("none");
    expect((await style(glass)).backgroundColor).not.toBe(idle.backgroundColor);
    // Focus on the selected tab tints the lens over it.
    const list = page.getByRole("tablist", { name: "Photo library" });
    const tint = () =>
      list
        .locator(":scope > .liquid-lens")
        .evaluate((element) => getComputedStyle(element).getPropertyValue("--liquid-lens-fill"));
    expect(await tint()).not.toBe("0 122 255");
    await list.getByRole("tab", { name: "Photos" }).focus();
    await page.keyboard.press("ArrowRight");
    const albums = list.getByRole("tab", { name: "Albums" });
    await expect(albums).toBeFocused();
    expect((await style(albums)).outlineStyle).toBe("none");
    await expect.poll(tint).toBe("0 122 255");
  });
});
