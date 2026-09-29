"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLiquidIndicator } from "@/lib/liquid/lens";
import { useLiquidElement } from "@/lib/liquid/motion";
import { cn } from "@/lib/utils";
import { currentLink, type NavLink } from "@/www/nav";

/** Header links. The current section sits under the same lens the Tabs use. */
export function MainNav({ links }: { links: NavLink[] }) {
  const pathname = usePathname();
  const current = currentLink(pathname, links);
  const [node, ref] = useLiquidElement<HTMLDivElement>();
  useLiquidIndicator(node, { selected: ".site-nav-link[aria-current]", items: ".site-nav-link" });
  return (
    <nav aria-label="Main" className="site-nav-wrap">
      <div ref={ref} className="site-nav">
        {links.map((link) => {
          const here = link === current;
          return (
            <Link
              key={link.href}
              href={link.href}
              // `class` changes wake the lens; aria-current alone is not observed.
              className={cn("site-nav-link", here && "is-current")}
              aria-current={here ? (link.href === pathname ? "page" : "true") : undefined}
            >
              {link.title}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
