import type { ReactNode } from "react";
import { docsOrder } from "@/www/docs/sections";
import { Pager, PagerButtons } from "@/www/docs/pager";
import type { TocItem } from "@/www/docs/prose";
import { Toc } from "@/www/docs/toc";
import { neighbors } from "@/www/nav";

type DocArticleProps = {
  /** The page's own path, for the pager. */
  path: string;
  title: string;
  description: ReactNode;
  eyebrow?: string;
  toc: TocItem[];
  children: ReactNode;
};

export function DocArticle({ path, title, description, eyebrow, toc, children }: DocArticleProps) {
  const around = neighbors(path, docsOrder);
  return (
    <div className="doc-layout">
      <article className="doc">
        <header className="doc-header">
          {eyebrow && <p className="doc-eyebrow">{eyebrow}</p>}
          <div className="doc-title">
            <h1>{title}</h1>
            <PagerButtons {...around} />
          </div>
          <p className="doc-lead">{description}</p>
        </header>
        <div className="doc-body">{children}</div>
        <Pager {...around} />
      </article>
      <Toc items={toc} />
    </div>
  );
}
