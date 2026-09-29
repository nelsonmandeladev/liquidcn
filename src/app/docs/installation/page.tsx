import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/site";
import { CodeBlock } from "@/www/code-block";
import { DocArticle } from "@/www/docs/article";
import { PackageCommand } from "@/www/docs/package-command";
import { Section, tocOf } from "@/www/docs/prose";

export const metadata: Metadata = {
  title: "Installation",
  description: "Add liquidcn components to a shadcn/ui project with the shadcn CLI.",
  alternates: { canonical: "/docs/installation" },
};

const sections = [
  { id: "requirements", title: "Requirements" },
  { id: "add", title: "Add a component" },
  { id: "namespace", title: "Use a namespace" },
  { id: "structure", title: "What lands where" },
  { id: "toaster", title: "Mount the Toaster" },
  { id: "server-components", title: "Server components" },
];

const tree = `components/
  ui/
    button.tsx        the shadcn component, unchanged
    liquid/
      button.tsx      the wrapper you import
      liquid.css      glass, keyframes, accessibility preferences
lib/
  liquid/
    motion.ts         the spring and shared helpers
    press.ts          swell, stretch, and content morph`;

export default function Page() {
  return (
    <DocArticle
      path="/docs/installation"
      title="Installation"
      description="liquidcn installs through the shadcn CLI, into a project that already uses shadcn/ui."
      toc={tocOf(sections)}
    >
      <Section id="requirements" title="Requirements">
        <ul>
          <li>
            React 19. The wrappers take <code>ref</code> as a prop.
          </li>
          <li>Tailwind CSS v4, which the shadcn base components are written for.</li>
          <li>
            A <code>components.json</code>. In a new project, create one with:
          </li>
        </ul>
        <PackageCommand args="shadcn@latest init" />
      </Section>
      <Section id="add" title="Add a component">
        <p>
          Every component has its own registry item. Pick one from{" "}
          <Link href="/docs/components">Components</Link>, or start with the button:
        </p>
        <PackageCommand args="shadcn@latest add {origin}/r/liquid-button.json" />
        <p>
          An item brings the wrapper, the shadcn component it wraps, <code>liquid.css</code>, and
          the motion modules it needs. Installing a second component reuses the shared files.
        </p>
      </Section>
      <Section id="namespace" title="Use a namespace">
        <p>
          To skip the full address, register liquidcn in <code>components.json</code>:
        </p>
        <CodeBlock
          lang="json"
          title="components.json"
          code={`{
  "registries": {
    "@liquidcn": "${site.url}/r/{name}.json"
  }
}`}
        />
        <PackageCommand args="shadcn@latest add @liquidcn/liquid-button" />
      </Section>
      <Section id="structure" title="What lands where">
        <p>
          Files keep their folders, so every <code>@/components/ui/…</code> and <code>@/lib/…</code>{" "}
          import resolves. For the button:
        </p>
        <CodeBlock lang="text" code={tree} />
        <p>
          The shadcn component stays where it was, and other code that imports it is unaffected.
        </p>
      </Section>
      <Section id="toaster" title="Mount the Toaster">
        <p>Toasts need one Toaster near the root of your app. Other components need no setup.</p>
        <CodeBlock
          title="app/layout.tsx"
          code={`import { Toaster } from "@/components/ui/liquid/sonner"

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  )
}`}
        />
      </Section>
      <Section id="server-components" title="Server components">
        <p>
          Every wrapper starts with <code>&quot;use client&quot;</code>, so you can render them from
          server components as usual. Each one imports <code>liquid.css</code> itself; there is
          nothing to add to your global stylesheet.
        </p>
      </Section>
    </DocArticle>
  );
}
