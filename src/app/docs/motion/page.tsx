import type { Metadata } from "next";
import { CodeBlock } from "@/www/code-block";
import { DocArticle } from "@/www/docs/article";
import { Section, tocOf } from "@/www/docs/prose";
import { ValueTable } from "@/www/docs/tables";

export const metadata: Metadata = {
  title: "Motion",
  description: "The principles, spring, and numbers behind liquidcn's movement.",
  alternates: { canonical: "/docs/motion" },
};

const sections = [
  { id: "principles", title: "Principles" },
  { id: "spring", title: "The spring" },
  { id: "reference", title: "Against the reference" },
  { id: "numbers", title: "Numbers" },
  { id: "reduced", title: "Reduced motion" },
];

const principles = [
  [
    "Glass answers the finger.",
    "Pressing makes a control swell toward you; it does not sink. Small controls grow more than large ones, and dragging stretches them like a gel.",
  ],
  [
    "Selection is a lens.",
    "The selected tab sits under a frosted pill. Pressing lifts it into clear glass, larger than the bar, that magnifies and tints what is beneath it.",
  ],
  [
    "Surfaces grow from their source.",
    "A menu is not placed next to its button. The button becomes the menu, and on close the menu is drawn back into it.",
  ],
  [
    "Content condenses.",
    "New content arrives magnified and out of focus, as if seen through glass that is still forming, then sharpens.",
  ],
  [
    "Everything is interruptible.",
    "Springs keep their velocity when retargeted, so a second tap mid-flight redirects the glass instead of restarting it.",
  ],
  [
    "Motion is never required.",
    "Every interaction has the same result under reduced motion, reduced transparency, forced colors, keyboard, and touch.",
  ],
];

const reference = [
  [
    "Tab press",
    "The bar grows about 2%; the pill lifts into clear glass about 30% taller than the bar.",
    "The bar scales to 1.025; the lens lifts, magnifies, and tints labels.",
  ],
  [
    "Tab travel",
    "About 250 ms from press to landing, stretching with speed.",
    "Spring travel with velocity stretch; lands within 15% of the target.",
  ],
  [
    "Button press",
    "The button whitens and grows; a 44 pt circle grows about 20%.",
    "Size-dependent swell.",
  ],
  [
    "Menu open",
    "Swells, becomes a round droplet, stretches into the panel, settles with a small overshoot.",
    "Keyframes through a droplet at 26% and an overshoot at 62%.",
  ],
  [
    "Menu close",
    "Content blurs out; the panel shrinks into a teardrop connected to the button, which bulges as the drop merges.",
    "Fold through a droplet in 320 ms, drawn back through a neck, then a 420 ms bulge.",
  ],
  [
    "Search",
    "The tab bar collapses into a circle showing the selected tab's icon; the search button stretches into a field.",
    "Each part's width springs from the old layout to the new; the tabs fade and blur away.",
  ],
  [
    "Fusion",
    "Pressed, the search button and the tab bar flow into each other through a gooey neck.",
    "A metaball neck of glass drawn between the two surfaces while either is pressed.",
  ],
  [
    "Edit → ✓",
    "The pill tints blue, overshoots as a larger circle, settles; the check blurs in.",
    "Width spring, pop, color change, and blurred content.",
  ],
];

const numbers = [
  ["Spring", "Stiffness `440 − 180v`, damping `23 + 15v`, unit mass"],
  ["Press swell", "`1 + clamp(8 / √(width × height), 0.04, 0.18)`"],
  ["Press drag", "Rubber band, coefficient 0.55: up to 10 px across, 7 px down"],
  ["Content pop", "Scale impulse of 2.4/s"],
  ["Lens lift", "+16% along the list, +34% across it, 12% magnification"],
  ["Lens stretch", "Up to 24% at 5200 px/s"],
  ["Scrub start", "6 px of pointer travel"],
  ["Menu unfold", "`--liquid-morph-duration`, 520 ms by default"],
  ["Menu fold, trigger bulge", "320 ms, 420 ms"],
  ["Still press", "A menu press moving less than 10 px never selects an item"],
  ["Search morph", "Width spring per part; tabs out in 220–360 ms with 6 px blur"],
  ["Fusion", "Neck spread up to 0.5 while pressed; 0.5 at the middle of a menu fold"],
  ["Refraction", "Rim bezel up to 18 px, backdrop drawn up to 60% of it inward (Chromium)"],
];

export default function Page() {
  return (
    <DocArticle
      path="/docs/motion"
      title="Motion"
      description="liquidcn moves the way Liquid Glass does in iOS 26. These are the rules it follows and the numbers it uses."
      toc={tocOf(sections)}
    >
      <Section id="principles" title="Principles">
        <dl className="principles">
          {principles.map(([title, body]) => (
            <div key={title}>
              <dt>{title}</dt>
              <dd>{body}</dd>
            </div>
          ))}
        </dl>
      </Section>
      <Section id="spring" title="The spring">
        <p>
          One damped spring drives every continuous movement. It integrates at a fixed 240 Hz
          substep, keeps its velocity when given a new target, and writes CSS custom properties
          directly. React never re-renders during an animation.
        </p>
        <p>
          <code>v</code> is <code>--liquid-viscosity</code>, between 0 and 1. Lower is firmer and
          bouncier, higher is slower and softer. Like every token, it can be set per element:
        </p>
        <CodeBlock
          lang="css"
          code={`:root {
  --liquid-viscosity: 0.35;
}

.playful {
  --liquid-viscosity: 0.1;
}`}
        />
      </Section>
      <Section id="reference" title="Against the reference">
        <p>
          Timings come from a frame-by-frame study of a 60 fps screen recording of the iOS 26 Phone
          app.
        </p>
        <ValueTable
          label="iOS 26 compared with liquidcn"
          headings={["Moment", "iOS 26", "liquidcn"]}
          rows={reference}
        />
      </Section>
      <Section id="numbers" title="Numbers">
        <ValueTable label="Motion parameters" rows={numbers} />
      </Section>
      <Section id="reduced" title="Reduced motion">
        <p>
          With <code>prefers-reduced-motion</code>, or{" "}
          <code>data-reduced-motion=&quot;true&quot;</code> on any ancestor, every change snaps into
          place. There is no lift, swell, stretch, or morph, and every interaction still has the
          same result.
        </p>
      </Section>
    </DocArticle>
  );
}
