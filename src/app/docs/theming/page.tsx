import type { Metadata } from "next";
import ButtonVariants from "@/examples/button/variants";
import TabsDemo from "@/examples/tabs/demo";
import { CodeBlock } from "@/www/code-block";
import { DocArticle } from "@/www/docs/article";
import { Section, tocOf } from "@/www/docs/prose";
import { ValueTable } from "@/www/docs/tables";
import { MaterialControls } from "@/www/material-controls";
import { Stage } from "@/www/stage";

export const metadata: Metadata = {
  title: "Theming",
  description: "The CSS custom properties behind liquidcn's glass, dark material, and accent.",
  alternates: { canonical: "/docs/theming" },
};

const sections = [
  { id: "tokens", title: "Material tokens" },
  { id: "try", title: "Try them" },
  { id: "accent", title: "Accent and lens" },
  { id: "dark", title: "Dark material" },
  { id: "opaque", title: "Opaque glass" },
];

const tokens = [
  ["`--liquid-blur`", "`20px`", "Backdrop blur behind glass."],
  ["`--liquid-tint`", "`0.22`", "Opacity of the glass fill."],
  ["`--liquid-fill`", "`255 255 255`", "Fill color as RGB channels."],
  ["`--liquid-ink`", "`#172323`", "Text and icons on glass."],
  ["`--liquid-accent`", "`#155dfc`", "Prominent buttons and labels under a lens."],
  ["`--liquid-lens-ink`", "the accent", "Labels under a lens only."],
  ["`--liquid-viscosity`", "`0.5`", "Spring feel, from 0 (firm, bouncy) to 1 (slow, soft)."],
  ["`--liquid-morph-duration`", "`520ms`", "How long a menu takes to form."],
];

export default function Page() {
  return (
    <DocArticle
      path="/docs/theming"
      title="Theming"
      description="Glass is a handful of CSS custom properties. Set them on the root to change every surface, or on any element to change the glass inside it."
      toc={tocOf(sections)}
    >
      <Section id="tokens" title="Material tokens">
        <ValueTable
          label="Material tokens"
          headings={["Property", "Default", "Effect"]}
          rows={tokens}
        />
        <p>
          Menus and toasts render in a portal at the end of the page, so give them their values on
          the root element.
        </p>
        <CodeBlock
          lang="css"
          title="globals.css"
          code={`:root {
  --liquid-blur: 28px;
  --liquid-tint: 0.3;
  --liquid-viscosity: 0.3;
}`}
        />
      </Section>
      <Section id="try" title="Try them">
        <p>These controls set the same properties on this page&rsquo;s root.</p>
        <div className="theming-lab">
          <Stage scene="peaks" className="theming-stage">
            <div className="theming-stage-content">
              <TabsDemo />
              <ButtonVariants />
            </div>
          </Stage>
          <MaterialControls className="theming-controls" />
        </div>
      </Section>
      <Section id="accent" title="Accent and lens">
        <p>
          <code>--liquid-accent</code> colors prominent buttons and the labels under a lens. To keep
          lens labels neutral while buttons stay tinted, point the lens at the ink:
        </p>
        <CodeBlock
          lang="css"
          code={`:root {
  --liquid-accent: #ff375f;
}

.filters {
  --liquid-lens-ink: var(--liquid-ink);
}`}
        />
      </Section>
      <Section id="dark" title="Dark material">
        <p>
          Glass inside an element with the <code>dark</code> class, the shadcn convention, or with{" "}
          <code>data-liquid-theme=&quot;dark&quot;</code> turns dark: a charcoal fill, white ink,
          and a brighter lens so labels stay legible.
        </p>
        <CodeBlock
          code={`<html className="dark">
  …
</html>

<section data-liquid-theme="dark">
  <Toolbar aria-label="Playback">…</Toolbar>
</section>`}
        />
      </Section>
      <Section id="opaque" title="Opaque glass">
        <p>
          When someone asks for less transparency or more contrast in their system settings, glass
          becomes an opaque fill with no blur. To do the same for part of a page, set{" "}
          <code>data-reduced-transparency=&quot;true&quot;</code> on an ancestor.
        </p>
      </Section>
    </DocArticle>
  );
}
