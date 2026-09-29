# Architecture

liquidcn has two parts: a **component library** in `src/components/ui/liquid/` and `src/lib/liquid/`, distributed as source through a shadcn registry, and a **website** (home page and docs) that demonstrates it and hosts the registry.

## Component library

Each liquid component **extends** a shadcn/ui base component; it never rebuilds it. The wrapper imports the base component from `@/components/ui/<name>`, forwards every prop, ref, and event, and adds only classes, `data-liquid-*` attributes, and behavior through small, framework-free classes attached by hooks. Consumers keep the familiar shadcn props, refs, and events.

A liquid component never imports a primitive library (`radix-ui`, Base UI, React Aria) itself. The consumer's base components stay exactly as they are, built on whichever library their shadcn uses. Where shadcn has no base component, a liquid component is built from ones it has (the toolbar's buttons are liquid `Button`s) or from plain elements (the tab bar).

| File                                      | Responsibility                                                                                                        |
| ----------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `components/ui/liquid/*.tsx`              | Thin React wrappers that combine a base component with the pieces below.                                              |
| `components/ui/liquid/liquid.css`         | Glass material, lens, menu choreography, and every accessibility preference.                                          |
| `lib/liquid/motion.ts`                    | Shared core: the spring, rubber band, reduced-motion checks, listener and ref helpers.                                |
| `lib/liquid/press.ts`                     | `LiquidPress` (hover attraction, swell, rubber-band drag) and `LiquidMorph` (content morph); `useLiquidInteraction`.  |
| `lib/liquid/lens.ts`                      | `LiquidLens`, the selection lens for tabs and toolbars; `useLiquidIndicator`.                                         |
| `lib/liquid/lens-parts.ts`                | Pure lens geometry and the lens's DOM helpers.                                                                        |
| `lib/liquid/menu-morph.ts`                | Menu geometry, `MenuMorph` (unfold/fold), and `MenuSession` (trigger press tracking and guard).                       |
| `lib/liquid/fusion.ts`                    | Metaball neck geometry, `LiquidFusion` (a glass neck between two surfaces), and `FusionLoop`.                         |
| `lib/liquid/refraction.ts`                | Displacement map for a rounded surface, `LiquidRefraction` (SVG backdrop filter), `useLiquidRefraction`.              |
| `lib/liquid/bar.ts`                       | `BarFusion`: the shell toolbars and tab bars share, a capsule fusing with the round button beside it; `useBarFusion`. |
| `lib/liquid/tab-bar.ts`                   | `TabBarMorph`: the search morph and the search button's press; `useTabBarMorph`.                                      |
| `lib/liquid/roving.ts`                    | `RovingFocus`: one tab stop and arrow-key navigation over a set of controls; `useRovingFocus`.                        |
| `components/ui/button.tsx`, `tabs.tsx`, … | Unmodified shadcn/ui base components (the Radix versions), used by the site. The registry does not ship them.         |

Paths are relative to `src/`. The registry ships wrappers and `liquid.css` as `registry:ui` and the motion modules as `registry:lib`, so they install into the consumer's `ui/liquid/` and `lib/liquid/` folders and every `@/components/ui/…` and `@/lib/…` import keeps resolving.

### The spring

`createLiquidSpring` integrates a damped spring for a vector of values at a fixed 240 Hz substep. Retargeting keeps velocity, `kick` adds velocity for pops, and `render` may retarget from inside a frame (a travelling lens lands this way). A frame whose timestamp precedes the input that scheduled it gets a small positive step rather than a negative one. Springs write CSS custom properties and never trigger React renders.

Hooks get their element from `useLiquidElement`, whose ref cleanup clears it. React 19 calls a ref's cleanup instead of passing it `null`, so without that an effect would outlive its element whenever the component stays mounted, as a menu's content component does when Radix unmounts the panel on close.

### The lens

`LiquidLens` appends one `span.liquid-lens` to a tab list or toolbar. Inside it, an **optics** element holds an inert copy of the list (same classes, children cloned, ids removed). Each frame positions the lens, and translates and scales the optics so the copy lines up with the real list, magnified about the lens center. CSS tints the copy with the accent color, so labels under the lens appear magnified and blue while the rest stay unchanged.

Two techniques keep the real items from showing through:

- **While moving,** the lens sets a `mask-image` gradient on each real item it overlaps, hiding exactly the part under the lens.
- **At rest,** `data-liquid-lens="rest"` makes the selected real item's text transparent; the copy stands in for it.

Selection stays with Radix. A drag across tabs follows the pointer with a rubber band past the ends, and on release dispatches the `mousedown` that Radix tabs select on, then moves focus to keep the roving tab stop in sync.

### Menus

The panel clips and its `liquid-menu-body` wrapper scrolls, up to the height Radix reports as available. The body arrives magnified during the unfold; with the panel as the scroller, that growth would flash scrollbars on every open.

`DropdownMenuContent` opens over its trigger by default: a negative `sideOffset` equal to the trigger's size, aligned to the nearer screen edge. `MenuMorph` measures the trigger and panel after Radix positions the panel, and writes the CSS variables the unfold and fold keyframes use.

Radix opens a dropdown on `pointerdown` and selects an item on `pointerup` even when the press began on the trigger. With the panel over the trigger, a still click would select the item that appeared beneath it. `MenuSession` tracks the press that opened the menu and swallows that release (and the click that follows a touch release) unless the pointer moved more than 10 px, so press-drag-release selection still works, as on iOS.

### Search morph

`TabBar` lays out `TabBarItems` (the glass around a liquid `TabsList`) and `TabBarSearch` (a round button that becomes a field). CSS describes both states: while `data-searching` is set, the items are a circle `--liquid-tab-bar-circle` wide and the field fills the bar's resting width, `--liquid-tab-bar-width`. `TabBarMorph` remembers each part's resting width and, in a layout effect right after the state changes, springs each width from where it was to where the new layout puts it, then removes the inline widths. Because the layout lives in CSS, a consumer can restyle either state (the site stretches the field across the header on phones) and the morph follows.

### Toolbar

`Toolbar` is a plain element with the `toolbar` role, laid out like the tab bar: `ToolbarGroup`s (a capsule of glass each, with a lens over the button that has `aria-pressed`) and round buttons of their own beside them. `ToolbarButton` is a liquid `Button`: `ghost` inside a group, so it sits on the group's glass, and `default` glass outside one, where `useBarFusion` fuses it with the neighboring group. No primitive library is involved: `RovingFocus` gives the toolbar one tab stop, moves focus with arrow keys along `aria-orientation` (mirrored under `dir="rtl"`), Home, and End, and skips disabled buttons and the lens's inert copies.

### Fusion

`LiquidFusion` draws the neck between two surfaces as a glass element clipped with `clip-path: path(…)`. Each surface is reduced to its round end nearest the other (a capsule's end, or a circle of a panel's corner radius just inside its nearest edge), measured with `getBoundingClientRect` so transforms and keyframes count. `neckBetween` builds the classic metaball outline between the two circles, closing along each circle's near side so the neck never tints a surface twice. `FusionLoop` redraws it per frame only while there is a neck, a press, or a hold. `BarFusion` fuses a bar's capsule with the round button beside it while either is pressed: the tab bar's search button (paused during the search morph) and a toolbar's own buttons. `MenuMorph` fuses a folding menu with its trigger, synchronized to the fold keyframes' own progress.

### Refraction

Where `refractionSupported()` (Chromium), `LiquidRefraction` generates a displacement map for the surface's size and corner radius, draws it into an SVG `<filter>` in a shared hidden `<svg>`, and sets `--liquid-refraction: url(#…)` and `data-liquid-refraction`. CSS appends the variable to the surface's `backdrop-filter`, inside a media query that excludes reduced transparency, increased contrast, and forced colors. On resize the last map stretches at once and a new one is drawn when resizing pauses.

### Content morph

`LiquidMorph` watches a button's children and variant. On a change it springs the width from the old size to the new one with an inline `width`, kicks the press spring for a pop, and toggles `data-liquid-morph` so CSS can blur the new content in.

### Constraints for consumers

- The motion layer owns the CSS `translate` and `scale` properties of interactive elements; `transform` stays free.
- During a content morph a button carries a temporary inline `width`. A button with its own inline width keeps it.
- Tab and toolbar items carry a temporary `mask-image` while the lens passes over them.
- A toolbar sets its buttons' `tabindex` to keep one tab stop.
- In Chromium, tabs, toolbars, and the tab bar carry `--liquid-refraction` and `data-liquid-refraction`; a consumer's own `backdrop-filter` on them replaces the refraction.
- During the search morph, a tab bar's parts carry temporary inline widths.

## Registry

`registry.json` lists each item and the files it ships. `pnpm registry:build` (`scripts/build-registry.mjs`) validates it with the official shadcn schemas and writes `public/r/*.json` with the sources embedded, which Next.js serves as static files. The output is committed; run the command after changing `registry.json` or any file it lists, and CI fails if the committed JSON is stale. An item never ships a base shadcn component: it names it in `registryDependencies` (`"button"`, `"tabs"`, …), and the shadcn CLI resolves that name against shadcn's own registry for the consumer's style, so they get the version for their primitive library, or keep the one they have. `tests/unit/registry.test.ts` fails if an item's files import a local module or package the item does not ship, declare, or depend on, if an item ships a base component or imports a primitive library, or if the shadcn CLI would install a file anywhere other than where its imports expect it.

## Website

A Next.js App Router app: the home page at `/`, guides under `/docs`, and one page per component at `/docs/components/<slug>`, all prerendered. Public addresses live in `src/site.ts`.

| Path                                | Responsibility                                                                                                   |
| ----------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `examples/<slug>/docs.ts`           | What a person writes about a component: hint, examples, API, motion numbers, accessibility notes.                |
| `examples/<slug>/*.tsx`             | Examples. Each is rendered live and shown as its own source, so it imports only the public API.                  |
| `examples/index.ts`                 | The list of documented components, joined with their `registry.json` items (title, description, files).          |
| `app/docs/components/[slug]/`       | Generates a page per documented component with `generateStaticParams`; unknown slugs are 404s.                   |
| `www/chrome/`                       | Floating header (title, tab bar with docs search, actions), footer, theme toggle, material popover, mobile menu. |
| `www/search.ts`                     | Ranking for the header search; the index is built from the docs order in `www/docs/sections.ts`.                 |
| `www/docs/`                         | Docs shell: sidebar, table of contents, pager, previews, package-manager commands, tables.                       |
| `www/home/`                         | Hero and the showcase of examples on photos.                                                                     |
| `www/stage.tsx`                     | A photo for glass to sit on. Every stage crops one image, so the browser downloads it once.                      |
| `www/highlight.ts`                  | Build-time syntax highlighting with Shiki; token colors are CSS variables that follow the theme.                 |
| `www/material.ts`, `preferences.ts` | Theme and material settings, restored before first paint by an inline script, then external stores.              |

**Adding a component to the site** takes one folder in `src/examples/` and one line in `src/examples/index.ts`. The route, sidebar, components index, pager, sitemap, and the accessibility checks in `e2e/site.spec.ts` all derive from that list and `registry.json`. `tests/unit/docs.test.ts` fails if a registry item has no docs, an example file is missing, or an example imports anything a reader could not install.

**The site uses the library on itself.** The header is laid out like an iPadOS toolbar: the title leading, a liquid `TabBar` centered (its sections are links under `LiquidLens`, and its search button becomes the docs search), and a capsule of actions trailing, over a scroll edge instead of a full-width bar. The docs sidebar's current page sits under a lens too, so both lenses travel when the page changes. Preview/Code switches and package-manager tabs are liquid `Tabs`; the mobile menu is a liquid `DropdownMenu`; icon buttons are liquid `Button`s. The material controls write the same custom properties a consumer would, on `document.documentElement`, so portaled menus and toasts follow them.

## Testing layers

| Layer     | Tool                           | Covers                                                                         |
| --------- | ------------------------------ | ------------------------------------------------------------------------------ |
| Unit      | Vitest                         | Spring, geometry, press shaping, menu placement, the registry contract.        |
| Component | Vitest, jsdom, Testing Library | Accessibility of the lens copy, refs, the press guard, keyboard use, cleanup.  |
| UI        | Playwright, axe                | Real layout and input on desktop and a touch phone, reduced motion, WCAG A/AA. |
