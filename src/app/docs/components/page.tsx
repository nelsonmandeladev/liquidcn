import type { Metadata } from "next";
import Link from "next/link";
import { components } from "@/examples";
import { DocArticle } from "@/www/docs/article";
import { Stage } from "@/www/stage";

export const metadata: Metadata = {
  title: "Components",
  description: "Every liquidcn component, with live previews on the next page.",
  alternates: { canonical: "/docs/components" },
};

export default function Page() {
  return (
    <DocArticle
      path="/docs/components"
      title="Components"
      description="Each one wraps the shadcn/ui component of the same name and keeps its API. Open one to try it on glass."
      toc={[]}
    >
      <ul className="component-grid">
        {components.map((component, index) => (
          <li key={component.slug}>
            <Link href={`/docs/components/${component.slug}`} className="component-card">
              <Stage scene={component.scene} eager={index < 3} className="component-card-stage">
                <span className="component-card-icon liquid-surface" aria-hidden="true">
                  <component.icon />
                </span>
              </Stage>
              <span className="component-card-name">{component.name}</span>
              <span className="component-card-description">{component.registry.description}</span>
            </Link>
          </li>
        ))}
      </ul>
    </DocArticle>
  );
}
