---
name: add-liquid-component
description: Add a new Liquid Glass component to the liquidcn registry, from the shadcn base component through motion, styles, registry entry, playground demo, tests, and docs. Use when asked to create, port, or wrap a shadcn/ui component (switch, slider, dialog, popover, and so on) as a liquid component.
---

# Add a liquid component

Read `docs/architecture.md` and `docs/design.md` first. Keep the shadcn API intact: the liquid wrapper forwards every prop, ref, and event.

## Steps

1. **Base component.** If `src/components/ui/<name>.tsx` does not exist, add it with `pnpm dlx shadcn@latest add <name>`, then run `pnpm format`. Do not otherwise edit base files.
2. **Wrapper.** Create `src/components/ui/liquid-<name>.tsx`:
   - `"use client"`, import `./liquid.css`, and re-export the parts that need no changes.
   - Get the DOM node with `useLiquidElement(ref)` from `liquid-motion.ts`.
   - Reuse before inventing: `useLiquidInteraction` (`liquid-press.ts`) for press, swell, and content morph; `useLiquidIndicator` (`liquid-lens.ts`) for a selection lens over items.
   - New motion goes in a class with a `destroy()` method, created in a hook's effect (see `LiquidPress`, `LiquidLens`, `MenuMorph`). Put pure math in its own functions so it can be unit-tested.
   - Springs come from `createLiquidSpring`; write CSS custom properties, never React state, per frame. Use `translate`/`scale`, never `transform`.
3. **Styles.** Add rules to `src/components/ui/liquid.css` using the material tokens. Cover reduced motion (both the media query and `[data-reduced-motion="true"]`), reduced transparency and increased contrast, dark material, and forced colors.
4. **Registry.** Add an item to `registry.json` that lists every file the component needs (wrapper, base component, `liquid.css`, each motion module it imports) and every npm package it imports under `dependencies`. `pnpm test` runs `tests/unit/registry.test.ts`, which fails if anything is missing. Then run `pnpm registry:build` and commit `public/r/`.
5. **Playground.** Add a demo to `src/playground/demos/`, register it in the `demos` map in `demos.tsx`, and add an entry with a hint and a code example to `src/playground/catalog.ts`. Add the name to `componentNames` in `e2e/support.ts` so the page gets the accessibility checks.
6. **Tests.**
   - Unit tests for new pure helpers in `tests/unit/`.
   - Component tests in `tests/components/`: accessible roles and names, ref forwarding, keyboard use, cleanup on unmount, and anything a consumer relies on.
   - A Playwright test in `e2e/` for layout and input behavior, including a reduced-motion case.
7. **Docs.** Add a row to the README's component table, and describe the motion in `docs/design.md` with its numbers.
8. **Verify.** Run `pnpm check`, `pnpm test:e2e`, and `pnpm build`. Then follow the `verify-motion` skill and look at the frames.

## Limits

Files stay at or under 300 lines (stylesheets excepted), and functions at or under complexity 10. When a file grows, split by responsibility; never disable the rules.
