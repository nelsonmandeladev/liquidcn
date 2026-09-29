import Link from "next/link";
import { FileCode2 } from "lucide-react";
import type { DocumentedComponent, RegistryItem } from "@/examples";
import type { Example } from "@/examples/types";
import { CodeBlock } from "@/www/code-block";
import { DocArticle } from "@/www/docs/article";
import { ComponentPreview } from "@/www/docs/component-preview";
import { PackageCommand } from "@/www/docs/package-command";
import { Inline, Section, type TocItem } from "@/www/docs/prose";
import { PropsTable, ValueTable } from "@/www/docs/tables";

function InstalledFiles({ item }: { item: RegistryItem }) {
  const packages = item.dependencies ?? [];
  return (
    <div className="installed">
      <p>The command copies these files into your project:</p>
      <ul className="file-list">
        {item.files.map((file) => (
          <li key={file.path}>
            <FileCode2 aria-hidden="true" />
            <code>{file.path.replace(/^src\//, "")}</code>
          </li>
        ))}
      </ul>
      {packages.length > 0 && (
        <p>
          It also installs{" "}
          {packages.map((name, index) => (
            <span key={name}>
              {index > 0 && (index === packages.length - 1 ? " and " : ", ")}
              <code>{name}</code>
            </span>
          ))}
          . The CLI asks before replacing a base component you already have.
        </p>
      )}
    </div>
  );
}

function tocFor(more: Example[]): TocItem[] {
  const examples: TocItem[] = more.length
    ? [
        { id: "examples", title: "Examples", level: 2 },
        ...more.map((example) => ({
          id: `example-${example.name}`,
          title: example.title,
          level: 3 as const,
        })),
      ]
    : [];
  return [
    { id: "installation", title: "Installation", level: 2 },
    { id: "usage", title: "Usage", level: 2 },
    ...examples,
    { id: "api", title: "API reference", level: 2 },
    { id: "motion", title: "Motion", level: 2 },
    { id: "accessibility", title: "Accessibility", level: 2 },
  ];
}

function Examples({ component, more }: { component: DocumentedComponent; more: Example[] }) {
  if (!more.length) return null;
  return (
    <Section id="examples" title="Examples">
      {more.map((example) => (
        <Section key={example.name} id={`example-${example.name}`} title={example.title} level={3}>
          {example.description && (
            <p>
              <Inline text={example.description} />
            </p>
          )}
          <ComponentPreview component={component} example={example} />
        </Section>
      ))}
    </Section>
  );
}

/** Every component page: built from its entry in `src/examples` and its registry item. */
export function ComponentPage({ component }: { component: DocumentedComponent }) {
  const [main, ...more] = component.examples;
  return (
    <DocArticle
      path={`/docs/components/${component.slug}`}
      eyebrow="Components"
      title={component.name}
      description={component.registry.description}
      toc={tocFor(more)}
    >
      <ComponentPreview component={component} example={main} hint={component.hint} eager />
      <Section id="installation" title="Installation">
        <PackageCommand args={`shadcn@latest add {origin}/r/${component.item}.json`} />
        <InstalledFiles item={component.registry} />
      </Section>
      <Section id="usage" title="Usage">
        <CodeBlock code={component.usage} />
      </Section>
      <Examples component={component} more={more} />
      <Section id="api" title="API reference">
        {component.api.map((entry) => (
          <div key={entry.component} className="api-entry">
            <h3>{entry.component}</h3>
            <p>
              <Inline text={entry.description} />
            </p>
            <PropsTable entry={entry} />
          </div>
        ))}
      </Section>
      <Section id="motion" title="Motion">
        <ValueTable label={`${component.name} motion`} rows={component.motion} />
        <p>
          Springs keep their velocity when interrupted, and every value here is removed under
          reduced motion. <Link href="/docs/motion">How the motion works</Link>
        </p>
      </Section>
      <Section id="accessibility" title="Accessibility">
        <ul>
          {component.accessibility.map((line) => (
            <li key={line}>
              <Inline text={line} />
            </li>
          ))}
        </ul>
      </Section>
    </DocArticle>
  );
}
