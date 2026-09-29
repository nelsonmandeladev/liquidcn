# liquidcn

An experimental Liquid Glass component registry built on shadcn/ui's Radix components. Source lives in your app. No component-library runtime beyond the existing primitives.

## Development

```sh
npm install
npm run dev
npm test
npm run typecheck
npm run build
npm start
```

Development and production previews run at http://127.0.0.1:5173. Run `npm start` after a production build. `npm run preview` is an alias for the production server. Next.js requires Node 20.9+; use Node 22.6+ to also run the TypeScript motion tests. Both npm and pnpm lockfiles are maintained; use one package manager consistently for installs.

The playground includes button, segmented tabs, dropdown menu, toolbar, and toast previews, live blur/tint and viscosity controls, light/dark material, reduced transparency and motion, source examples, and install commands.

## App Router architecture

The Vite migration follows the [official Next.js guide](https://nextjs.org/docs/app/guides/migrating/from-vite). `src/app/layout.tsx` owns the document, metadata, and global CSS. `src/app/page.tsx` is the server entry point; `src/App.tsx` is the client boundary for the interactive playground. The homepage is prerendered rather than loaded through an SSR-disabled SPA wrapper. Browser APIs run in effects or event handlers, so server rendering and hydration use the same initial markup.

Tailwind v4 runs through `@tailwindcss/postcss`. `components.json` enables React Server Component support, and interactive registry components retain their `"use client"` directives. Static assets and registry JSON keep their existing `/assets/*` and `/r/*` URLs. Playground and Registry are still views within the homepage; future pages can be added under `src/app`.

Unlike the guide's transitional static-export setup, this project uses the standard Next.js server build to leave App Router server features available for future work. Vite's HTML entry, ReactDOM bootstrap, config, and build dependencies have been removed.

## Install Into a Consumer

Start the playground, then run in an initialized React + Tailwind v4 shadcn project:

```sh
npx shadcn@latest add http://127.0.0.1:5173/r/liquid-button.json
```

Use the actual dev-server port. Other items: `liquid-tabs`, `liquid-dropdown-menu`, `liquid-toolbar`, `liquid-sonner`. Controls use Radix; notifications use Sonner. The CLI may ask before replacing existing base components or shared CSS; review changes in customized projects.

```tsx
import { Button } from "@/components/ui/liquid-button";

<Button onClick={() => console.log("Continue")}>Continue</Button>
```

Each item includes its source, `liquid.css`, and the shared `liquid-motion.ts` engine. No animation dependency is required. The familiar shadcn component props, refs, and event handlers are forwarded to the underlying component. Toolbar adds Radix Toolbar semantics. Material classes are unlayered CSS; consumer overrides should use a later stylesheet or style props.

## Material

Set `--liquid-blur`, `--liquid-tint`, `--liquid-fill`, and `--liquid-ink` on a glass component. Use `.dark` or `data-liquid-theme="dark"` on a common ancestor (including portals) for dark material. Set `data-reduced-transparency="true"` on that ancestor for opaque surfaces.

The material honors reduced-motion, reduced-transparency, and increased-contrast media preferences. Backdrop-filter fallback is opaque. Contrast should be assessed against your content.

## Liquid interaction

- **Buttons:** pointer-following light, subtle attraction, elastic compression, and spring release. Touch receives press feedback without hover attraction. The playground also demonstrates a button changing width after activation.
- **Tabs:** one continuous glass lens moves and stretches between selections, including keyboard changes. Retargeting preserves momentum. Resizing, RTL, and vertical lists use measured layout geometry.
- **Menus:** the surface unfolds from the trigger's measured position into the collision-adjusted panel. Content fades in as the surface forms; closing folds back toward the trigger. Radix continues to manage focus, dismissal, and keyboard navigation.
- **Toolbars:** elastic actions and a shared lens following the first button with `aria-pressed="true"`. Use a single selected action for a moving lens; independently pressed buttons retain their semantic states.
- **Toasts:** top-center glass pills expand with a soft spring, reveal their content, and fold away on dismissal. Existing Sonner calls, loading/success updates, actions, stacking, announcements, swipe dismissal, and timers remain available. Mount `Toaster` from `liquid-sonner` once in your app and call its re-exported `toast` API. The playground includes success, loading-to-success, and error previews.

Set `--liquid-viscosity` (0–1, default 0.5) on a common ancestor: lower values produce a firmer, bouncier spring; higher values produce a slower, softer response. `--liquid-morph-duration` (default `520ms`) controls menu formation. The playground links these controls. Motion runs only while a spring is moving and does not rerender React on every frame.

Set `data-reduced-motion="true"` on an ancestor to disable motion explicitly. The OS `prefers-reduced-motion` preference always takes precedence. For portaled menus, put theme/motion/transparency settings on `document.documentElement` or use a portal container within the configured ancestor. Keep the liquid `DropdownMenu`, trigger, and content wrappers together for trigger-aware morphing.

The motion layer owns the CSS `translate` and `scale` properties of interactive elements, leaving `transform` available to consumers. Avoid overriding those two properties when using the built-in spring.

This is DOM/CSS glass with spring-driven interaction, inspired by [Plasma UI](https://github.com/CruxGarden/plasma-ui). It does **not** implement Plasma's WebGL refraction, fusion between separate surfaces, or automatic background luminance adaptation. The spring and morph implementation is local; Plasma is not a runtime dependency.

## Registry and Publishing

`registry.json` is the source catalog. `npm run registry:build` validates against the official shadcn schemas and embeds current source files into `public/r/*.json`. `npm run build` rebuilds the registry, checks types, and creates the Next.js production output in `.next`. Deploy using a Next.js-compatible host or run `npm start`; an old Vite `dist` folder is not the current deployable output.

Before publishing, set the registry homepage to your real deployment URL. No domain or namespace is registered by this project. The playground computes install URLs from the running origin.

## Assets and References

`public/assets/alpine-lake.png` was generated using the built-in image generation tool. Prompt: photorealistic alpine lake, clear turquoise water and submerged rocks, pine forest, jagged Dolomite mountains, natural daylight, no text or UI.

Design concept: white developer workbench, component sidebar, photographic alpine preview, Liquid Glass control, material inspector, and install command. Generated with the built-in image tool.

- https://ui.shadcn.com/docs/registry
- https://ui.shadcn.com/docs/components/radix/button
- https://developer.apple.com/design/human-interface-guidelines/materials

Independent experimental project; not affiliated with Apple or shadcn.
