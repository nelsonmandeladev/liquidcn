import { readFileSync } from "node:fs";
import { expect, type Locator, type Page } from "@playwright/test";
import { guides } from "../src/www/nav";

const registry = JSON.parse(readFileSync("registry.json", "utf8")) as { items: { name: string }[] };

/** Every component page, one per registry item, so new components are tested automatically. */
export const componentSlugs = registry.items.map((item) => item.name.replace(/^liquid-/, ""));

/** Every page of the site. */
export const sitePages = [
  "/",
  ...guides.map((link) => link.href),
  ...componentSlugs.map((slug) => `/docs/components/${slug}`),
];

/**
 * Pages are static HTML, so input sent before hydration is lost. Every page mounts at least one
 * lens once React has hydrated, and a lens marks its list with `data-liquid-indicator`.
 */
export async function hydrated(page: Page) {
  await expect(page.locator("[data-liquid-indicator]").first()).toBeAttached();
}

export async function open(page: Page, path: string) {
  await page.goto(path);
  await hydrated(page);
}

export async function openComponent(page: Page, slug: string) {
  await open(page, `/docs/components/${slug}`);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
}

/** A lens list itself, not the inert copy inside its lens that carries the same classes. */
export const lensList = (scope: Locator, className: string) =>
  scope.locator(`.${className}:not(.liquid-lens-optics)`);

export function computed(locator: Locator, property: string) {
  return locator.evaluate(
    (element, name) => getComputedStyle(element).getPropertyValue(name),
    property,
  );
}

/** Scroll an element to the middle of the window, clear of the floating header. */
export async function reveal(locator: Locator) {
  await locator.evaluate((element) => element.scrollIntoView({ block: "center" }));
}

/** Lens state of a tab list or toolbar: resting/active, lift, and its left edge. */
export function lensOf(list: Locator) {
  return list.evaluate((element: HTMLElement) => {
    const lens = element.querySelector<HTMLElement>(".liquid-lens");
    const x = new DOMMatrix(lens ? getComputedStyle(lens).transform : "none").m41;
    return {
      state: element.dataset.liquidLens,
      lift: Number(element.style.getPropertyValue("--liquid-lift") || 0),
      x,
    };
  });
}

export async function expectLensAt(list: Locator, item: Locator) {
  await expect.poll(async () => (await lensOf(list)).state).toBe("rest");
  const left = await item.evaluate((element: HTMLElement) => element.offsetLeft);
  expect((await lensOf(list)).x).toBeCloseTo(left, 0);
}

/** Press and release: a tap on touch devices, a click otherwise. */
export async function activate(locator: Locator, touch: boolean) {
  if (touch) await locator.tap();
  else await locator.click();
}

export async function centerOf(locator: Locator) {
  const box = (await locator.boundingBox())!;
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
}
