# Design language

liquidcn brings the interaction model of Apple's Liquid Glass (iOS 26, macOS 26) to shadcn/ui components on the web. This document records what we are matching, the rules that follow from it, and the numbers the implementation uses. It is the reference for reviewing any change to how a component looks or moves.

## Reference

The tuning comes from frame-by-frame study of a screen recording of the iOS 26 Phone app (tab bar, Contacts lists, the call-history filter and Edit menus, the keypad, and search). Timings below are from that recording at roughly 60 fps. When you change motion, compare against a recording the same way; the `verify-motion` agent skill describes how.

## Principles

1. **Glass answers the finger.** Pressing a control makes it swell toward you and fill with light; it does not sink. Small controls grow more than large ones. Dragging while pressed stretches the glass like a gel, then it springs back.
2. **Selection is a lens.** The selected tab sits under a frosted pill. Pressing lifts that pill into clear glass that is larger than the bar, magnifies what is beneath it, and tints it with the accent color. It can be dragged. When released, it travels, lands, and frosts over again.
3. **Surfaces grow from their source.** A menu is not placed next to its button; the button becomes the menu. It swells, turns into a round droplet, stretches into the panel over the button, and on close is drawn back into the button, which bulges as it lands.
4. **Content condenses.** New content arrives magnified and out of focus, as if seen through glass that is still forming, then sharpens. Changed content in a button blurs in while the button's width springs to its new size.
5. **Everything is interruptible.** Motion is driven by springs that keep their velocity when retargeted, so a second tap mid-flight redirects the glass instead of restarting it.
6. **Motion is never required.** Every interaction works, with the same result, under reduced motion, reduced transparency, increased contrast, forced colors, keyboard, and touch.

## What the reference shows

| Moment                 | iOS 26 behavior                                                                                                                                                                               | liquidcn                                                                                                   |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Tab press              | Bar grows ~2%. Selection pill lifts into clear glass ~30% taller than the bar, bright rim with faint rainbow fringe. Labels under it magnified and blue; a label can be half blue mid-flight. | `data-liquid-pressed` scales the bar 1.025. Lens lift, magnification, and accent copy clipped to the lens. |
| Tab travel and landing | About 250 ms from press to landing; the lens stretches with speed and overshoots slightly, then shrinks and frosts.                                                                           | Spring travel with velocity stretch; lift returns to 0 once within 15% of the target.                      |
| Button press           | The button whitens and grows (a 44 pt circle grows ~20%); the label fades if a menu is opening.                                                                                               | `swellFor()` growth and pressed light.                                                                     |
| Menu open              | Button swells (0–250 ms), becomes a round refracting blob (~330–420 ms), stretches into the panel over the button with magnified, blurred content (~500 ms), settles with a small overshoot.  | Keyframes through a droplet at 26% and an overshoot at 62% of `--liquid-morph-duration`.                   |
| Menu close             | Content blurs out; the panel shrinks into a teardrop connected to the button, which bulges as the drop merges (~250 ms).                                                                      | Fold through an elongated droplet in 320 ms, then a 420 ms bulge on the trigger.                           |
| Edit → ✓               | Pill whitens, tints blue, overshoots as a larger blue circle, settles to a 44 pt circle; the check blurs in.                                                                                  | Content morph: width spring, pop, color transition, blurred content-in.                                    |

## Material

| Token                 | Default           | Purpose                                                            |
| --------------------- | ----------------- | ------------------------------------------------------------------ |
| `--liquid-blur`       | `20px`            | Backdrop blur of glass surfaces.                                   |
| `--liquid-tint`       | `.22`             | Opacity of the glass fill.                                         |
| `--liquid-fill`       | `255 255 255`     | Fill color as RGB channels; dark material uses `22 27 30`.         |
| `--liquid-ink`        | `#172323`         | Text and icon color on glass.                                      |
| `--liquid-accent`     | `#007aff`         | Prominent buttons and the labels under a lens.                     |
| `--liquid-lens-ink`   | accent            | Tint for the lens only; set it to `var(--liquid-ink)` for neutral. |
| `--liquid-lens-alpha` | `.5` (dark `.16`) | Frost of the resting lens.                                         |

Dark material brightens the default lens ink to `#5aabff` so labels stay legible. Reduced transparency and increased contrast replace glass with opaque fills. Forced colors use system colors and hide the lens copy.

## Motion

| Parameter                 | Value                                                                                                  |
| ------------------------- | ------------------------------------------------------------------------------------------------------ |
| Spring                    | stiffness `440 − 180v`, damping `23 + 15v`, unit mass; `v` is `--liquid-viscosity` (0–1, default 0.5). |
| Press swell               | `1 + clamp(8 / √(width × height), 0.04, 0.18)`.                                                        |
| Press drag                | Rubber band with iOS coefficient 0.55: up to 10 px across, 7 px down.                                  |
| Content pop               | Scale velocity impulse of 2.4/s on the press spring.                                                   |
| Lens lift                 | +16% along the list, +34% across it, 12% magnification.                                                |
| Lens stretch              | Along the direction of travel, up to 24% at 5200 px/s.                                                 |
| Scrub start               | 6 px of pointer travel.                                                                                |
| Menu unfold               | `--liquid-morph-duration`, default 520 ms.                                                             |
| Menu fold / trigger bulge | 320 ms / 420 ms.                                                                                       |
| Still-press threshold     | A menu press that moves less than 10 px never selects an item.                                         |

Springs run only while moving, write CSS custom properties directly, and never re-render React per frame.

## Accessibility

- The lens shows an `inert`, `aria-hidden` copy of the list; real items keep their roles, names, and focus.
- Reduced motion (`prefers-reduced-motion` or `data-reduced-motion="true"` on an ancestor) snaps every change and removes the lift, swell, and morphs.
- Menus keep Radix focus management: keyboard open focuses the first item, and Escape returns focus to the trigger.
- The playground itself passes axe WCAG 2.1 A/AA checks, which the UI tests enforce.

## Not yet matched

Tracked in [`tasks.todo`](../tasks.todo): the search morph (tab bar collapsing while search expands into a field), fusion between separate glass surfaces, and true refraction of the backdrop.
