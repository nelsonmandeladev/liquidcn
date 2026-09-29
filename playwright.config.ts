import { defineConfig, devices } from "@playwright/test";

const ci = !!process.env.CI;

export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  forbidOnly: ci,
  retries: ci ? 2 : 0,
  reporter: ci ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "desktop",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } },
    },
    // Touch input: taps, implicit pointer capture, and the click that follows a tap.
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  webServer: {
    // CI tests the production build; locally a running dev server is reused.
    command: ci ? "pnpm start" : "pnpm dev",
    url: "http://localhost:3000",
    reuseExistingServer: !ci,
    timeout: 120_000,
  },
});
