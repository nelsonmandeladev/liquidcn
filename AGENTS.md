<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# liquidcn agent guide

liquidcn is an open-source shadcn/ui registry of Liquid Glass components (iOS 26 style) built on Radix. The library in `src/components/ui/` is distributed as source; the Next.js playground in `src/playground/` demonstrates it and serves the registry from `/r/`.

## Before you change anything

- Read [docs/architecture.md](docs/architecture.md) for how the spring, lens, menu morph, and registry fit together, and [docs/design.md](docs/design.md) for the motion language and its numbers.
- Package manager is **pnpm** (pinned in `packageManager`). Do not add `package-lock.json` or `yarn.lock`.
- For Next.js APIs, read the bundled docs in `node_modules/next/dist/docs/` (see the block above).

## Commands

| Task                               | Command                                   |
| ---------------------------------- | ----------------------------------------- |
| Start the playground               | `pnpm dev` (http://localhost:3000)        |
| Everything CI checks except UI     | `pnpm check`                              |
| Unit and component tests           | `pnpm test`                               |
| UI tests (desktop and touch phone) | `pnpm test:e2e`                           |
| Production build, with registry    | `pnpm build`                              |

Scripts are plain Next.js commands on the default port. A dev server may already be running on port 3000; Playwright reuses it locally.

## Rules

- **Quality gates are errors, not suggestions:** at most 300 lines per file (stylesheets excepted) and cyclomatic complexity of at most 10 per function. Split by responsibility: pure helpers, a small class, a subcomponent. Never disable these rules inline.
- **Keep the shadcn API.** Liquid components forward props, refs, and events to the base component. Motion is added with native listeners and CSS custom properties; do not re-render React per animation frame.
- **Motion lives in classes, hooks stay thin.** Follow `LiquidPress`, `LiquidLens`, and `MenuMorph`: a hook creates the instance in an effect and destroys it in cleanup.
- **The motion layer owns `translate` and `scale`** on interactive elements. Never use `transform` for motion there.
- **Accessibility is part of done.** Everything must work under reduced motion (`prefers-reduced-motion` and `data-reduced-motion="true"`), reduced transparency, dark material, forced colors, keyboard, and touch. Decorative copies must be `inert` and `aria-hidden`.
- **Registry contract.** Any new module a component imports must be listed in that item's `files` in `registry.json`, and any package in its `dependencies`. `tests/unit/registry.test.ts` enforces this.
- **Tests with every change.** Pure logic gets unit tests, consumer-facing behavior gets component tests, and layout or input behavior gets a Playwright test. A bug fix needs a test that fails without it.
- **Base shadcn files** (`button.tsx`, `tabs.tsx`, `dropdown-menu.tsx`, `tooltip.tsx`) stay as shadcn ships them, apart from formatting.
- `public/r/` is generated: after changing `registry.json` or any file it lists, run `pnpm registry:build` and commit the result. Never edit it by hand. CI fails when it is stale.

## Verifying motion

Tests prove behavior, not feel. After changing motion, capture slowed-down frames with `node scripts/capture-motion.mjs` and look at them. The `verify-motion` skill in `.claude/skills/` covers this, including comparison with a reference screen recording. To add a component, follow the `add-liquid-component` skill.

## Open work

`tasks.todo` lists known gaps against the iOS reference (search morph, surface fusion, backdrop refraction) and launch tasks.
