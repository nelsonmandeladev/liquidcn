import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: "jsdom",
    include: ["tests/**/*.test.{ts,tsx}"],
    setupFiles: ["tests/setup.ts"],
    restoreMocks: true,
    coverage: {
      provider: "v8",
      include: ["src/components/ui/liquid-*.{ts,tsx}"],
      reporter: ["text", "html"],
      // Layout-driven paths (lens drag, landing) are covered by the Playwright suite.
      thresholds: { statements: 75, branches: 60, functions: 75, lines: 75 },
    },
  },
});
