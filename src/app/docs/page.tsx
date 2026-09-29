import type { Metadata } from "next";
import Link from "next/link";
import { components } from "@/examples";
import { site } from "@/site";
import { CodeBlock } from "@/www/code-block";
import { DocArticle } from "@/www/docs/article";
import { Section, tocOf } from "@/www/docs/prose";

export const metadata: Metadata = {
  title: "Introduction",
  description: "What liquidcn is, how it relates to shadcn/ui, and what it does not do yet.",
  alternates: { canonical: "/docs" },
};

const sections = [
  { id: "what-you-get", title: "What you get" },
  { id: "one-import", title: "One import away" },
  { id: "reference", title: "Where the motion comes from" },
  { id: "not-yet", title: "Not there yet" },
  { id: "browsers", title: "Browser support" },
];

export default function Page() {
  return (
    <DocArticle
      path="/docs"
      title="Introduction"
      description="Liquid Glass components for shadcn/ui. They look and move like the controls in iOS 26, and you install them like any shadcn component: as source code you own."
      toc={tocOf(sections)}
    >
      <Section id="what-you-get" title="What you get">
        <ul>
          <li>
            {components.length} components so far:{" "}
            {components.map((component, index) => (
              <span key={component.slug}>
                {index > 0 && ", "}
                <Link href={`/docs/components/${component.slug}`}>{component.name}</Link>
              </span>
            ))}
            .
          </li>
          <li>
            Each wraps the shadcn/ui component of the same name and forwards its props, refs, and
            events. Radix still handles semantics, focus, and keyboard input.
          </li>
          <li>
            The glass is CSS: a backdrop blur, a tinted fill, and a few highlights. The motion is a
            spring in plain TypeScript that writes CSS custom properties. There is no animation
            library, no WebGL, and no React render per frame.
          </li>
        </ul>
      </Section>
      <Section id="one-import" title="One import away">
        <p>Install a component, then change where you import it from. The JSX stays the same.</p>
        <CodeBlock
          code={`// Before
import { Button } from "@/components/ui/button"

// After
import { Button } from "@/components/ui/liquid/button"`}
        />
      </Section>
      <Section id="reference" title="Where the motion comes from">
        <p>
          The timings come from a frame-by-frame study of a screen recording of the iOS 26 Phone
          app: the tab bar lens, the press swell, the menu that grows out of its button, and the
          Edit button that turns into a check. <Link href="/docs/motion">Motion</Link> lists what
          was matched and the numbers behind it.
        </p>
      </Section>
      <Section id="not-yet" title="Not there yet">
        <p>Some of the reference is still missing, and it is better to say so:</p>
        <ul>
          <li>
            The search morph, where the tab bar collapses into a circle while search stretches into
            a field.
          </li>
          <li>
            The neck between two glass surfaces as they merge. A closing menu is drawn back into its
            button as an ellipse, not a true teardrop.
          </li>
          <li>
            Refraction of the page behind the glass. The lens magnifies a copy of the
            control&rsquo;s own labels, not the backdrop.
          </li>
        </ul>
        <p>
          Progress is tracked in <a href={`${site.repository}/blob/HEAD/tasks.todo`}>tasks.todo</a>.
        </p>
      </Section>
      <Section id="browsers" title="Browser support">
        <p>
          Current Chrome, Edge, Safari, and Firefox all support backdrop blur. Where it is missing,
          glass falls back to an opaque fill. Pointer events cover mouse, pen, and touch, and every
          interaction has a keyboard path through Radix.
        </p>
      </Section>
    </DocArticle>
  );
}
