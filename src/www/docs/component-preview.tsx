import type { DocumentedComponent } from "@/examples";
import type { Example } from "@/examples/types";
import { CodeBlock } from "@/www/code-block";
import { PreviewTabs } from "@/www/docs/preview-tabs";
import { readExample } from "@/www/docs/source";
import { Stage } from "@/www/stage";

type ComponentPreviewProps = {
  component: DocumentedComponent;
  example: Example;
  /** What to try, written on the photo. */
  hint?: string;
  eager?: boolean;
};

/** A live example on a photo, and the same file's source one tab away. */
export async function ComponentPreview({ component, example, hint, eager }: ComponentPreviewProps) {
  const source = await readExample(component.slug, example.name);
  const Demo = example.component;
  return (
    <PreviewTabs
      label={example.title}
      preview={
        <Stage scene={example.scene ?? component.scene} className="preview-stage" eager={eager}>
          {hint && <p className="stage-hint liquid-surface">{hint}</p>}
          <Demo />
        </Stage>
      }
      code={<CodeBlock code={source} className="preview-code" />}
    />
  );
}
