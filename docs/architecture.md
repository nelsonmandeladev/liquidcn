# Architecture

liquidcn has two parts: a **component library** in `src/components/ui/liquid/` and `src/lib/liquid/`, distributed as source through a shadcn registry, and a **playground** in `src/playground/` that demonstrates it and hosts the registry.

## Component library

Each liquid component wraps a shadcn/ui base component and adds behavior through small, framework-free classes attached by hooks. Consumers keep the familiar shadcn props, refs, and events.

| File                                      | Responsibility                                                                                                  |
| ----------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `components/ui/liquid/*.tsx`              | Thin React wrappers that combine a base component with the pieces below.                                        |
| `components/ui/liquid/liquid.css`         | Glass material, lens, menu choreography, and every accessibility preference.                                    |
| `lib/liquid/motion.ts`                    | Shared core: the spring, rubber band, reduced-motion checks, listener and ref helpers.                          |
| `lib/liquid/press.ts`                     | `LiquidPress` (hover light, swell, rubber-band drag) and `LiquidMorph` (content morph); `useLiquidInteraction`. |
| `lib/liquid/lens.ts`                      | `LiquidLens`, the selection lens for tabs and toolbars; `useLiquidIndicator`.                                   |
| `lib/liquid/lens-parts.ts`                | Pure lens geometry and the lens's DOM helpers.                                                                  |
| `lib/liquid/menu-morph.ts`                | Menu geometry, `MenuMorph` (unfold/fold), and `MenuSession` (trigger press tracking and guard).                 |
| `components/ui/button.tsx`, `tabs.tsx`, … | Unmodified shadcn/ui base components.                                                                           |

Paths are relative to `src/`. The registry ships wrappers and `liquid.css` as `registry:ui` and the motion modules as `registry:lib`, so they install into the consumer's `ui/liquid/` and `lib/liquid/` folders and every `@/components/ui/…` and `@/lib/…` import keeps resolving.

### The spring

`createLiquidSpring` integrates a damped spring for a vector of values at a fixed 240 Hz substep. Retargeting keeps velocity, `kick` adds velocity for pops, and `render` may retarget from inside a frame (a travelling lens lands this way). A frame whose timestamp precedes the input that scheduled it gets a small positive step rather than a negative one. Springs write CSS custom properties and never trigger React renders.

### The lens

`LiquidLens` appends one `span.liquid-lens` to a tab list or toolbar. Inside it, an **optics** element holds an inert copy of the list (same classes, children cloned, ids removed). Each frame positions the lens, and translates and scales the optics so the copy lines up with the real list, magnified about the lens center. CSS tints the copy with the accent color, so labels under the lens appear magnified and blue while the rest stay unchanged.

Two techniques keep the real items from showing through:

- **While moving,** the lens sets a `mask-image` gradient on each real item it overlaps, hiding exactly the part under the lens.
- **At rest,** `data-liquid-lens="rest"` makes the selected real item's text transparent; the copy stands in for it.

Selection stays with Radix. A drag across tabs follows the pointer with a rubber band past the ends, and on release dispatches the `mousedown` that Radix tabs select on, then moves focus to keep the roving tab stop in sync.

### Menus

`DropdownMenuContent` opens over its trigger by default: a negative `sideOffset` equal to the trigger's size, aligned to the nearer screen edge. `MenuMorph` measures the trigger and panel after Radix positions the panel, and writes the CSS variables the unfold and fold keyframes use.

Radix opens a dropdown on `pointerdown` and selects an item on `pointerup` even when the press began on the trigger. With the panel over the trigger, a still click would select the item that appeared beneath it. `MenuSession` tracks the press that opened the menu and swallows that release (and the click that follows a touch release) unless the pointer moved more than 10 px, so press-drag-release selection still works, as on iOS.

### Content morph

`LiquidMorph` watches a button's children and variant. On a change it springs the width from the old size to the new one with an inline `width`, kicks the press spring for a pop, and toggles `data-liquid-morph` so CSS can blur the new content in.

### Constraints for consumers

- The motion layer owns the CSS `translate` and `scale` properties of interactive elements; `transform` stays free.
- During a content morph a button carries a temporary inline `width`. A button with its own inline width keeps it.
- Tab and toolbar items carry a temporary `mask-image` while the lens passes over them.

## Registry

`registry.json` lists each item and the files it ships. `pnpm registry:build` (`scripts/build-registry.mjs`) validates it with the official shadcn schemas and writes `public/r/*.json` with the sources embedded, which Next.js serves as static files. The output is committed; run the command after changing `registry.json` or any file it lists, and CI fails if the committed JSON is stale. `tests/unit/registry.test.ts` fails if an item's files import a local module or package the item does not ship or declare, or if the shadcn CLI would install a file anywhere other than where its imports expect it.

## Playground

A Next.js App Router app. `src/app/page.tsx` renders the client `Playground`, which is split into the catalog (`catalog.ts`), settings (`settings.ts`), chrome, preview, inspector, and demos. Settings are written to `document.documentElement`, so portaled menus and toasts follow the theme, motion, and transparency controls. Public addresses live in `src/site.ts`.

## Testing layers

| Layer     | Tool                           | Covers                                                                         |
| --------- | ------------------------------ | ------------------------------------------------------------------------------ |
| Unit      | Vitest                         | Spring, geometry, press shaping, menu placement, the registry contract.        |
| Component | Vitest, jsdom, Testing Library | Accessibility of the lens copy, refs, the press guard, keyboard use, cleanup.  |
| UI        | Playwright, axe                | Real layout and input on desktop and a touch phone, reduced motion, WCAG A/AA. |
