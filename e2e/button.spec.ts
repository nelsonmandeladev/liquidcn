import { expect, test } from "@playwright/test";
import { activate, centerOf, openComponent } from "./support";

const scaleOf = (element: Element) => Number(getComputedStyle(element).scale.split(" ")[0]) || 1;

test.describe("button", () => {
  test.beforeEach(({ page }) => openComponent(page, "Button"));

  test("swells while pressed and settles after release", async ({ page, isMobile }) => {
    test.skip(isMobile, "Holding a press is mouse-only in Playwright.");
    const edit = page.getByRole("button", { name: "Edit" });
    const point = await centerOf(edit);
    await page.mouse.move(point.x, point.y);
    await page.mouse.down();
    await expect.poll(() => edit.evaluate(scaleOf)).toBeGreaterThan(1.08);
    await page.mouse.up();
    await page.mouse.move(0, 0);
    await expect.poll(() => edit.evaluate(scaleOf)).toBeLessThan(1.001);
  });

  test("Edit morphs into a round, prominent check", async ({ page, hasTouch }) => {
    await activate(page.getByRole("button", { name: "Edit" }), hasTouch);
    const done = page.getByRole("button", { name: "Done editing" });
    await expect(done).toHaveAttribute("data-liquid-variant", "prominent");
    await expect.poll(() => done.evaluate((element: HTMLElement) => element.offsetWidth)).toBe(44);
    await expect(done).not.toHaveAttribute("data-liquid-morphing");
    expect(await done.evaluate((element: HTMLElement) => element.style.width)).toBe("");
  });
});
