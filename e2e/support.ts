import { expect, type Locator, type Page } from "@playwright/test";

export const componentNames = [
  "Button",
  "Segmented control",
  "Dropdown menu",
  "Toolbar",
  "Toast notification",
];

export async function openComponent(page: Page, name: string) {
  await page.goto("/");
  await page.getByRole("navigation", { name: "Components" }).getByRole("button", { name }).click();
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
