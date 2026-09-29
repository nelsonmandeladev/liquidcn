import type { Metadata } from "next";
import Link from "next/link";
import { components } from "@/examples";
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
  { id: "inspiration", title: "Inspiration" },
  { id: "limits", title: "Limits" },
  { id: "browsers", title: "Browser support" },
];

export default function Page() {
  return (
    <DocArticle
      path="/docs"
      title="Introduction"
      description="Liquid Glass components for shadcn/ui. You install them like any shadcn component."
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
            Each extends the shadcn/ui component of the same name and forwards its props, refs, and
            events. The primitives still handle semantics, focus, and keyboard input.
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
      <Section id="inspiration" title="Inspiration">
        <p>
          liquidcn is inspired by Apple&rsquo;s Liquid Glass: the lens that lifts across a tab bar,
          the swell of a pressed control, the menu that grows out of its button, and the Edit button
          that turns into a check. <Link href="/docs/motion">Motion</Link> lists the principles and
          the numbers behind them.
        </p>
      </Section>
      <Section id="limits" title="Limits">
        <p>Where the web version differs from Liquid Glass on Apple platforms:</p>
        <ul>
          <li>
            Refraction of the page behind the glass needs Chromium, the only engine that renders SVG
            filters in <code>backdrop-filter</code>. Elsewhere the glass keeps its blur without the
            bend at the rim.
          </li>
          <li>
            The lens magnifies a copy of the control&rsquo;s own labels. The page behind a bar bends
            at the bar&rsquo;s rim, but the lens does not magnify it.
          </li>
          <li>
            Surfaces fuse where the library knows they meet: a tab bar and its search button, and a
            menu and its trigger.
          </li>
        </ul>
      </Section>
      <Section id="browsers" title="Browser support">
        <p>
          Current Chrome, Edge, Safari, and Firefox all support backdrop blur. Where it is missing,
          glass falls back to an opaque fill. Chrome and Edge also bend the backdrop at the rim of
          bars and toolbars. Pointer events cover mouse, pen, and touch, and every interaction has a
          keyboard path.
        </p>
      </Section>
    </DocArticle>
  );
}
