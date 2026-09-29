import { expect, test } from "@playwright/test";
import { activate, expectLensAt, lensList, open, openComponent } from "./support";

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
