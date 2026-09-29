import { cn } from "@/lib/utils";
import { CopyButton } from "@/www/copy-button";
import { highlight, type CodeLanguage } from "@/www/highlight";

type CodeBlockProps = {
  code: string;
  lang?: CodeLanguage;
  /** A file name or short label above the code. */
  title?: string;
  className?: string;
};

export async function CodeBlock({ code, lang = "tsx", title, className }: CodeBlockProps) {
  const html = await highlight(code, lang);
  return (
    <figure className={cn("code-block", className)}>
      {title && <figcaption>{title}</figcaption>}
      <div className="code-body" dangerouslySetInnerHTML={{ __html: html }} />
      <CopyButton value={code.trimEnd()} />
    </figure>
  );
}
