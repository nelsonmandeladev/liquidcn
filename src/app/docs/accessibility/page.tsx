import type { Metadata } from "next";
import { DocArticle } from "@/www/docs/article";
import { Section, tocOf } from "@/www/docs/prose";
import { ValueTable } from "@/www/docs/tables";

export const metadata: Metadata = {
  title: "Accessibility",
  description:
    "How liquidcn keeps Radix semantics and honors motion, transparency, and contrast settings.",
  alternates: { canonical: "/docs/accessibility" },
};

const sections = [
  { id: "semantics", title: "Semantics and focus" },
  { id: "preferences", title: "Preferences" },
  { id: "touch", title: "Touch" },
  { id: "your-part", title: "Your part" },
  { id: "testing", title: "Testing" },
];

const preferences = [
  [
    "Reduced motion",
    '`prefers-reduced-motion`, or `data-reduced-motion="true"` on an ancestor',
    "No lift, swell, stretch, or morph. Changes are instant.",
  ],
  [
    "Reduced transparency",
    '`prefers-reduced-transparency`, or `data-reduced-transparency="true"`',
    "Opaque fills instead of blurred glass.",
  ],
  ["Increased contrast", "`prefers-contrast: more`", "Opaque fills, as for reduced transparency."],
  [
    "Forced colors",
    "`forced-colors: active`",
    "System colors and borders; the lens becomes Highlight.",
  ],
  ["Dark", '`.dark` or `data-liquid-theme="dark"`', "Dark material and a brighter lens ink."],
];

export default function Page() {
  return (
    <DocArticle
      path="/docs/accessibility"
      title="Accessibility"
      description="The glass sits on top of Radix. Semantics, focus, and keyboard behavior are Radix's, and every interaction works without the motion or the transparency."
      toc={tocOf(sections)}
    >
      <Section id="semantics" title="Semantics and focus">
        <ul>
          <li>Roles, states, and keyboard support come from the Radix primitive underneath.</li>
          <li>
            The lens shows an <code>inert</code>, <code>aria-hidden</code> copy of its list. Screen
            readers and the keyboard only ever reach the real items.
          </li>
          <li>
            Menus keep Radix focus management: opening from the keyboard focuses the first item, and
            Escape returns focus to the trigger.
          </li>
        </ul>
      </Section>
      <Section id="preferences" title="Preferences">
        <p>System settings apply automatically. Each also has an attribute for part of a page.</p>
        <ValueTable
          label="Supported preferences"
          headings={["Preference", "Set by", "What changes"]}
          rows={preferences}
        />
      </Section>
      <Section id="touch" title="Touch">
        <ul>
          <li>Icon buttons are 44 px circles, the minimum touch target on iOS.</li>
          <li>
            A menu opens under the finger that opened it. That press never selects the item that
            appears beneath it, unless the finger moves 10 px or more, so press, drag, and release
            still works.
          </li>
        </ul>
      </Section>
      <Section id="your-part" title="Your part">
        <ul>
          <li>
            Give icon-only buttons an <code>aria-label</code>.
          </li>
          <li>
            For toggles, keep the label constant and use <code>aria-pressed</code>. The toolbar lens
            follows it.
          </li>
          <li>
            Check contrast over your own backdrops. Over a busy photo, raise{" "}
            <code>--liquid-tint</code> or change <code>--liquid-ink</code>.
          </li>
        </ul>
      </Section>
      <Section id="testing" title="Testing">
        <p>
          Component tests cover roles, refs, keyboard use, and cleanup. Every page of this site is
          checked against WCAG 2.1 A and AA with axe, on a desktop browser and a touch phone, on
          every change.
        </p>
      </Section>
    </DocArticle>
  );
}
