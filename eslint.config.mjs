import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier/flat";

export default defineConfig([
  ...nextVitals,
  ...nextTypescript,
  {
    // Quality gates: keep files and functions small enough to review.
    files: ["**/*.{js,mjs,cjs,ts,tsx}"],
    rules: {
      "max-lines": ["error", { max: 300 }],
      complexity: ["error", { max: 10 }],
    },
  },
  prettier,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "dist/**",
    "coverage/**",
    "playwright-report/**",
    "test-results/**",
    "public/r/**",
    "next-env.d.ts",
  ]),
]);
