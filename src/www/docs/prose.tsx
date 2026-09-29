import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Plain text where `backticks` become inline code, for copy stored as strings. */
export function Inline({ text }: { text: string }) {
  const parts = text.split(/(`[^`]+`)/g);
  return (
    <>
      {parts.map((part, index) =>
        /^`.+`$/.test(part) ? <code key={index}>{part.slice(1, -1)}</code> : part,
      )}
    </>
  );
}

export type TocItem = { id: string; title: string; level: 2 | 3 };

type SectionProps = {
  id: string;
  title: string;
  level?: 2 | 3;
  className?: string;
  children: ReactNode;
};

/** A titled part of a page. The heading links to itself, and the TOC points at its id. */
export function Section({ id, title, level = 2, className, children }: SectionProps) {
  const Heading = level === 2 ? "h2" : "h3";
  return (
    <section className={cn("doc-section", `doc-section-${level}`, className)}>
      <Heading id={id} className="doc-heading">
        <a href={`#${id}`}>{title}</a>
      </Heading>
      {children}
    </section>
  );
}

/** Table of contents entries for a list of sections. */
export const tocOf = (sections: { id: string; title: string }[], level: 2 | 3 = 2): TocItem[] =>
  sections.map(({ id, title }) => ({ id, title, level }));
