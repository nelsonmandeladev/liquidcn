# liquidcn

**Liquid Glass for shadcn/ui.** Glass components that swell under your finger, lift a magnifying lens across tabs, and grow menus out of their buttons, the way iOS 26 does. Built on Radix primitives and installed as source from a shadcn registry.

**[Docs and live examples →](https://liquidcn.snmandela.com)**

[![CI](https://github.com/nelsonmandeladev/liquidcn/actions/workflows/ci.yml/badge.svg)](https://github.com/nelsonmandeladev/liquidcn/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## Components

| Component     | Item                   | What it does                                                                                       |
| ------------- | ---------------------- | -------------------------------------------------------------------------------------------------- |
| Button        | `liquid-button`        | Swells when pressed, stretches on drag, morphs its width and content. `prominent` variant.         |
| Tab bar       | `liquid-tab-bar`       | iOS 26 tab bar with a search button: the tabs fold into a circle as search stretches into a field. |
| Tabs          | `liquid-tabs`          | A lens that lifts, magnifies, and tints the labels beneath it. Drag it across tabs to choose.      |
| Dropdown menu | `liquid-dropdown-menu` | Grows out of and over its trigger as a droplet, folds back into it through a teardrop neck.        |
| Toolbar       | `liquid-toolbar`       | Swelling actions and a selection lens.                                                             |
| Toast         | `liquid-sonner`        | Top-center glass pills that form and fold away (Sonner).                                           |

## Install

In a React project set up for [shadcn/ui](https://ui.shadcn.com/docs/installation) with Tailwind CSS v4:

```sh
npx shadcn@latest add https://liquidcn.snmandela.com/r/liquid-button.json
```

Each item brings its source, the base shadcn component it wraps, `liquid.css`, and the motion modules it needs. There is no animation library to install. The CLI asks before replacing base components you already have.

## Use

The components keep the shadcn API: same props, refs, and events.

```tsx
import { Button } from "@/components/ui/liquid/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/liquid/tabs";

<Button onClick={save}>Save</Button>
<Button variant="prominent" size="icon-lg" aria-label="Done"><Check /></Button>

<Tabs defaultValue="photos">
  <TabsList aria-label="Library">
    <TabsTrigger value="photos">Photos</TabsTrigger>
    <TabsTrigger value="albums">Albums</TabsTrigger>
  </TabsList>
  <TabsContent value="photos">…</TabsContent>
  <TabsContent value="albums">…</TabsContent>
</Tabs>
```

Menus open over their trigger by default, as on iOS. Pass `overlap={false}` to `DropdownMenuContent` to open beside it. For toasts, mount `Toaster` from `liquid-sonner` once and call its re-exported `toast`.

## Theming

Set these custom properties on any ancestor (including `document.documentElement`, so portaled menus and toasts follow):

| Property                  | Default       | Effect                                                                    |
| ------------------------- | ------------- | ------------------------------------------------------------------------- |
| `--liquid-blur`           | `20px`        | Backdrop blur.                                                            |
| `--liquid-tint`           | `.22`         | Glass opacity.                                                            |
| `--liquid-fill`           | `255 255 255` | Glass color as RGB channels.                                              |
| `--liquid-ink`            | `#172323`     | Text and icons on glass.                                                  |
| `--liquid-accent`         | `#007aff`     | Prominent buttons and labels under a lens.                                |
| `--liquid-lens-ink`       | accent        | Lens tint only, e.g. `var(--liquid-ink)` for a neutral segmented control. |
| `--liquid-viscosity`      | `.5`          | 0 is firm and bouncy, 1 is slow and soft.                                 |
| `--liquid-morph-duration` | `520ms`       | Menu formation.                                                           |

Use `.dark` or `data-liquid-theme="dark"` for dark material, and `data-reduced-transparency="true"` for opaque surfaces.

## Accessibility

- Radix keeps focus management, keyboard navigation, and ARIA semantics; the lens is decorative and hidden from assistive technology.
- `prefers-reduced-motion` (or `data-reduced-motion="true"` on an ancestor) removes all movement; every interaction still works.
- Reduced transparency, increased contrast, and forced colors are supported.
- Every page of the site is checked against WCAG 2.1 A/AA in CI.

## How it works

DOM and CSS glass with spring-driven motion; no WebGL, and no runtime dependency beyond the primitives. Springs write CSS custom properties directly and never re-render React per frame. The motion layer owns the `translate` and `scale` properties of interactive elements, so `transform` stays yours.

- [Design language](docs/design.md): what we match from iOS 26, with the numbers.
- [Architecture](docs/architecture.md): the spring, the lens, menu morphs, and the registry.
- [Deployment](docs/deployment.md): Vercel and the custom domain.

Browser support: current Chrome, Edge, Safari, and Firefox. Lens magnification enlarges a copy of the control's own labels; it does not refract the page behind the glass.

## Contributing

Contributions are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) for setup, scripts, the quality gates, and how to add a component. Please follow the [Code of Conduct](CODE_OF_CONDUCT.md), and report security issues as described in [SECURITY.md](SECURITY.md).

```sh
corepack enable && pnpm install
pnpm dev     # http://localhost:3000
pnpm check   # lint, format, types, tests
```

## License

[MIT](LICENSE). Base components from [shadcn/ui](https://ui.shadcn.com) (MIT); see [third-party notices](THIRD_PARTY_NOTICES.md).

liquidcn is an independent project, not affiliated with Apple or shadcn/ui. Inspired by [Plasma UI](https://github.com/CruxGarden/plasma-ui).
