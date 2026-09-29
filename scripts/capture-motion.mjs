// Capture slowed-down frames of a liquid interaction, to judge motion by eye.
//
//   node scripts/capture-motion.mjs <scenario> [--out motion-frames] [--slow 10] [--url http://localhost:3000]
//
// Needs the site running (`pnpm dev`) and Playwright's Chromium. When ffmpeg is on PATH
// (or FFMPEG points to it), frames are also tiled into one contact sheet per scenario.
import { chromium } from "@playwright/test";
import { execFileSync } from "node:child_process";
import { mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import { parseArgs } from "node:util";

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    out: { type: "string", default: "motion-frames" },
    slow: { type: "string", default: "10" },
    url: { type: "string", default: "http://localhost:3000" },
  },
});
const slow = Number(values.slow);
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const center = async (locator) => {
  const box = await locator.boundingBox();
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
};
const phone = (page) => page.getByRole("tablist", { name: "Phone" });

// `clock` picks how time is slowed. Springs run on requestAnimationFrame, so their timestamps
// are scaled in the page. CSS keyframes are slowed through the DevTools animation domain.
// The two do not combine: the DevTools rate also delays frame timestamps.
const scenarios = {
  "tabs-tap": {
    component: "tabs",
    clock: "spring",
    frame: phone,
    times: [0, 40, 90, 140, 200, 260, 340, 450, 700],
    async act(page) {
      const calls = await center(phone(page).getByRole("tab", { name: "Calls" }));
      await page.mouse.move(calls.x, calls.y);
      await page.mouse.down();
      setTimeout(() => page.mouse.up(), 120 * slow);
    },
  },
  "tabs-drag": {
    component: "tabs",
    clock: "spring",
    frame: phone,
    times: [0, 60, 120, 180, 240, 300, 360, 420, 500, 650, 900],
    async act(page) {
      const from = await center(phone(page).getByRole("tab", { name: "Calls" }));
      const to = await center(phone(page).getByRole("tab", { name: "Contacts" }));
      await page.mouse.move(from.x, from.y);
      await page.mouse.down();
      page.mouse.move(to.x, to.y, { steps: 40 }).then(() => page.mouse.up());
    },
  },
  "menu-open": {
    component: "dropdown-menu",
    clock: "css",
    frame: (page) => page.getByRole("button", { name: "Options" }),
    pad: [200, 90, 200, 210],
    times: [0, 30, 70, 110, 150, 200, 260, 330, 420, 560],
    act: (page) => page.getByRole("button", { name: "Options" }).click(),
  },
  "menu-close": {
    component: "dropdown-menu",
    clock: "css",
    frame: (page) => page.getByRole("button", { name: "Options" }),
    pad: [200, 90, 200, 210],
    times: [0, 40, 80, 120, 170, 220, 280, 340, 420, 600],
    async prepare(page) {
      await page.getByRole("button", { name: "Options" }).click();
      await sleep(900 * slow);
    },
    act: (page) => page.keyboard.press("Escape"),
  },
  "button-morph": {
    component: "button",
    clock: "spring",
    frame: (page) => page.getByRole("button", { name: "Edit" }),
    pad: [140, 120, 140, 40],
    times: [0, 40, 90, 140, 200, 260, 340, 460, 700],
    async act(page) {
      const edit = await center(page.getByRole("button", { name: "Edit" }));
      await page.mouse.move(edit.x, edit.y);
      await page.mouse.down();
      setTimeout(() => page.mouse.up(), 120 * slow);
    },
  },
};

async function slowDown(page, clock) {
  if (clock === "spring") {
    await page.addInitScript((factor) => {
      const real = performance.now.bind(performance);
      const start = real();
      const scaled = (time) => start + (time - start) / factor;
      performance.now = () => scaled(real());
      const frame = window.requestAnimationFrame.bind(window);
      window.requestAnimationFrame = (callback) => frame((time) => callback(scaled(time)));
    }, slow);
    return async () => {};
  }
  return async () => {
    const devtools = await page.context().newCDPSession(page);
    await devtools.send("Animation.enable");
    await devtools.send("Animation.setPlaybackRate", { playbackRate: 1 / slow });
  };
}

async function clipFor(page, scenario) {
  const box = await scenario.frame(page).boundingBox();
  const [left, top, right, bottom] = scenario.pad ?? [40, 40, 40, 40];
  return {
    x: Math.max(0, box.x - left),
    y: Math.max(0, box.y - top),
    width: box.width + left + right,
    height: box.height + top + bottom,
  };
}

async function record(page, scenario, folder) {
  const clip = await clipFor(page, scenario);
  const started = Date.now();
  await scenario.act(page);
  const stamps = [];
  for (const [i, time] of scenario.times.entries()) {
    const wait = time * slow - (Date.now() - started);
    if (wait > 0) await sleep(wait);
    stamps.push(Math.round((Date.now() - started) / slow));
    await page.screenshot({ path: join(folder, `frame-${String(i).padStart(2, "0")}.png`), clip });
  }
  return stamps;
}

function contactSheet(folder, count, output) {
  const ffmpeg = process.env.FFMPEG ?? "ffmpeg";
  const filter = `tile=3x${Math.ceil(count / 3)}:padding=6:color=red`;
  const input = join(folder, "frame-%02d.png");
  try {
    const args = ["-loglevel", "error", "-y", "-i", input, "-vf", filter, "-frames:v", "1", output];
    execFileSync(ffmpeg, args, { stdio: "ignore" });
    return output;
  } catch {
    return null;
  }
}

async function capture(name) {
  const scenario = scenarios[name];
  if (!scenario)
    throw new Error(`Unknown scenario "${name}". Try: ${Object.keys(scenarios).join(", ")}`);
  const folder = join(values.out, name);
  rmSync(folder, { recursive: true, force: true });
  mkdirSync(folder, { recursive: true });
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    const startClock = await slowDown(page, scenario.clock);
    await page.goto(`${values.url}/docs/components/${scenario.component}`, {
      waitUntil: "networkidle",
    });
    // Center the element so the clip stays inside the window and clear of the header.
    await scenario.frame(page).evaluate((element) => element.scrollIntoView({ block: "center" }));
    await sleep(500);
    await startClock();
    await scenario.prepare?.(page);
    const stamps = await record(page, scenario, folder);
    const sheet = contactSheet(folder, stamps.length, join(values.out, `${name}.png`));
    console.log(`${name}: frames at ${stamps.join(", ")} ms -> ${sheet ?? folder}`);
  } finally {
    await browser.close();
  }
}

const names = positionals.length ? positionals : Object.keys(scenarios);
for (const name of names) await capture(name);
