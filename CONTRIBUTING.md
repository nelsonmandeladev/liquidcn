# Contributing to liquidcn

Thanks for helping. liquidcn is a small project with a high bar for feel: every change should keep the glass smooth, accessible, and easy to install from the registry.

## Setup

You need Node 20.9 or later (22 recommended, see `.nvmrc`) and pnpm, via [Corepack](https://nodejs.org/api/corepack.html):

```sh
corepack enable
pnpm install
pnpm exec playwright install chromium   # once, for UI tests
pnpm dev                                # http://localhost:3000
```

`pnpm install` also installs the Git hooks.

## Scripts

| Script                | What it does                                                             |
| --------------------- | ------------------------------------------------------------------------ |
| `pnpm dev`            | Start the playground with hot reload (`next dev`).                       |
| `pnpm build`          | Production build (`next build`).                                         |
| `pnpm registry:build` | Validate `registry.json` and write `public/r/*.json`. Commit the output. |
| `pnpm check`          | Lint, format check, type check, and unit/component tests. Run it often.  |
| `pnpm test`           | Unit and component tests (Vitest, jsdom).                                |
| `pnpm test:coverage`  | The same, with a coverage report for the component library.              |
| `pnpm test:e2e`       | UI tests in Chromium on desktop and a touch phone profile (Playwright).  |
| `pnpm lint:fix`       | Fix what ESLint can fix.                                                 |
| `pnpm format`         | Format everything with Prettier.                                         |

## Quality gates

These are enforced by ESLint, Git hooks, and CI:

- **At most 300 lines per file** (stylesheets excepted) and **cyclomatic complexity of at most 10 per function**. Split by responsibility rather than by line count: a pure helper module, a small class, a subcomponent.
- **No lint warnings.** Rules come from `eslint-config-next` (Core Web Vitals, TypeScript, React Hooks with the React Compiler rules) plus the two limits above.
- **Formatted with Prettier.** The pre-commit hook formats staged files.
- **Tests pass.** The pre-push hook runs the type check and unit tests; CI runs everything, including UI tests against a production build.

## Tests

- `tests/unit` covers pure logic: the spring, lens geometry, menu morph geometry, press shaping, and the registry contract. Prefer extracting logic into pure functions and testing it here.
- `tests/components` renders components in jsdom with Testing Library. Use it for behavior a consumer relies on: accessibility of the lens copy, ref forwarding, the menu's press guard, cleanup on unmount. jsdom has no layout, so do not assert positions here.
- `e2e` drives the playground in real Chromium, with real layout and input: lens landing positions, drag-to-select, keyboard use, reduced motion, WCAG A/AA checks with axe, and the served registry.

A bug fix should come with a test that fails without the fix.

## Changing motion

Motion is the product, so check it with your eyes as well as with tests. The `verify-motion` agent skill in `.claude/skills/` describes capturing slowed-down frames of an interaction with `scripts/capture-motion.mjs` and comparing them against a reference recording. Always check:

- the interaction with `prefers-reduced-motion: reduce` (it must still work, without movement);
- the light and dark material, and reduced transparency;
- keyboard and touch input, not only a mouse.

See [docs/design.md](docs/design.md) for the motion language and [docs/architecture.md](docs/architecture.md) for how the engine is put together.

## Adding a component

1. Add the shadcn/ui base component under `src/components/ui/` if it is not there yet.
2. Wrap it in `src/components/ui/liquid/<name>.tsx`. Reuse `useLiquidInteraction` (press and morph) and `useLiquidIndicator` (a selection lens) from `src/lib/liquid/` before writing new motion; new motion modules go there too.
3. Add styles to `src/components/ui/liquid/liquid.css`, including reduced-motion, reduced-transparency, dark, and forced-colors handling.
4. Add an item to `registry.json` listing **every** file it needs, with motion modules typed `registry:lib`. `tests/unit/registry.test.ts` fails if an imported module or package is missing or a file would install in the wrong place. Run `pnpm registry:build` and commit `public/r/`.
5. Add a demo in `src/playground/demos/` and an entry in `src/playground/catalog.ts`.
6. Add component tests and at least one UI test.
7. Document it in the README.

The `add-liquid-component` agent skill walks through the same steps.

## Commits and pull requests

- Use [Conventional Commits](https://www.conventionalcommits.org/): `feat(tabs): …`, `fix(menu): …`, `docs: …`, `test: …`, `chore: …`.
- Keep pull requests focused, and fill in the template, including how you verified the change.
- For a visual change, attach a short screen recording or before/after frames.

## Code of Conduct

By participating you agree to the [Code of Conduct](CODE_OF_CONDUCT.md).
