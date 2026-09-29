import { expect, test } from "@playwright/test";
import { activate, centerOf, openComponent } from "./support";

const scaleOf = (element: Element) => Number(getComputedStyle(element).scale.split(" ")[0]) || 1;

test.describe("button", () => {
  test.beforeEach(({ page }) => openComponent(page, "button"));

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

  // liquid.css removes outlines and tints the glass instead; forced colors replace that tint.
  test("marks keyboard focus with an outline in forced colors", async ({ page, isMobile }) => {
    test.skip(isMobile, "Keyboard focus needs a keyboard.");
    await page.emulateMedia({ forcedColors: "active" });
    const outline = (element: Element) => getComputedStyle(element).outlineStyle;
    const edit = page.getByRole("button", { name: "Edit" });
    await edit.focus();
    await page.keyboard.press("Shift+Tab");
    await page.keyboard.press("Tab");
    await expect(edit).toBeFocused();
    expect(await edit.evaluate(outline)).toBe("solid");
    const code = page.getByRole("tab", { name: "Code" }).first();
    await code.focus();
    expect(await code.evaluate(outline)).toBe("solid");
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
