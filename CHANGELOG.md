# Changelog

Notable changes to liquidcn, newest first. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and versions follow [Semantic Versioning](https://semver.org/spec/v2.0.0.html). Before 1.0, a minor version may include breaking changes.

## [0.1.0] - 2026-09-29

The first public release. liquidcn is at an early stage: APIs may still change, so add it to existing projects with care.

### Added

#### Components

Six registry items. Each extends the shadcn/ui component of the same name and keeps its API.

- **Button** (`liquid-button`): swells under the finger, stretches on drag, and morphs its width and content, as when Edit turns into a check. Adds a `prominent` variant tinted with the accent, and 44 px round icon sizes.
- **Tabs** (`liquid-tabs`): a lens that lifts, magnifies, and tints the labels beneath it, and can be dragged across the tabs to choose one. The `liquid-tabbar` class stacks icons over labels.
- **Tab bar** (`liquid-tab-bar`): a floating tab bar with a search button. Search folds the tabs into a circle and stretches the button into a field, and the two surfaces fuse while pressed. Search can be controlled with `searching` and `onSearchingChange`.
- **Dropdown menu** (`liquid-dropdown-menu`): grows out of and over its trigger as a droplet, and folds back into it through a teardrop neck. `overlap={false}` opens it beside the trigger.
- **Toolbar** (`liquid-toolbar`): groups of swelling buttons on one glass capsule, a selection lens that follows `aria-pressed`, round buttons that fuse with the group, and a single tab stop with arrow-key navigation.
- **Toast** (`liquid-sonner`): glass pills that form at the top of the window and fold away, built on Sonner.

#### Motion and material

- One damped spring drives every continuous movement. It keeps its velocity when retargeted, so a second tap redirects the glass instead of restarting it, and it writes CSS custom properties without re-rendering React.
- The page behind tabs, toolbars, and the tab bar bends at their rim in Chromium browsers. Other browsers keep the blur.
- Theming with `--liquid-*` custom properties: blur, tint, fill, ink, accent, lens ink, viscosity, and menu duration.
- Dark material with the `dark` class or `data-liquid-theme="dark"`.

#### Accessibility

- Semantics, focus, and keyboard behavior come from the base components. Decorative copies of controls are `inert` and hidden from assistive technology.
- Reduced motion, reduced transparency, increased contrast, and forced colors are honored, and each has an attribute to apply it to part of a page.
- Every page of the site is checked against WCAG 2.1 A and AA on a desktop browser and a touch phone.

#### Registry and docs

- A shadcn registry at https://liquidcn.snmandela.com/r/, usable by URL or as the `@liquidcn` namespace. Your base shadcn components are never replaced: the CLI adds them only when they are missing.
- Components read ARIA state, never a primitive library's own attributes, so they work with whichever primitives your shadcn components are built on.
- A docs site with live examples, theming controls, and the numbers behind the motion, plus `/llms.txt` and `/llms-full.txt` for AI agents.

[0.1.0]: https://github.com/nelsonmandeladev/liquidcn/releases/tag/v0.1.0
