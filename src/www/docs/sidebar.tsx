"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLiquidIndicator } from "@/lib/liquid/lens";
import { useLiquidElement } from "@/lib/liquid/motion";
import { cn } from "@/lib/utils";
import type { NavSection } from "@/www/nav";

/**
 * One list for every group, so a single vertical lens can travel between groups when the page
 * changes, stretching to each label's width as it goes.
 */
export function DocsSidebar({ sections }: { sections: NavSection[] }) {
  const pathname = usePathname();
  const [node, ref] = useLiquidElement<HTMLDivElement>();
  useLiquidIndicator(node, {
    selected: '.docs-nav-link[aria-current="page"]',
    items: ".docs-nav-link",
  });
  return (
    <nav aria-label="Docs" className="docs-sidebar">
      <div ref={ref} className="docs-nav" data-orientation="vertical">
        {sections.map((section) => (
          <div key={section.title} className="docs-nav-group">
            <p className="docs-nav-title">{section.title}</p>
            <ul aria-label={section.title}>
              {section.links.map((link) => {
                const here = link.href === pathname;
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className={cn("docs-nav-link", here && "is-current")}
                      aria-current={here ? "page" : undefined}
                    >
                      {link.title}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </nav>
  );
}
