"use client";

import { useEffect, useState } from "react";
import type { TocItem } from "@/www/docs/prose";

/** The heading most recently scrolled past the top of the window. */
function useActiveHeading(key: string) {
  const [active, setActive] = useState<string>();
  useEffect(() => {
    const headings = key
      .split(" ")
      .map((id) => document.getElementById(id))
      .filter((heading) => heading !== null);
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting);
        if (visible.length) setActive(visible[0].target.id);
      },
      { rootMargin: "-96px 0px -66% 0px" },
    );
    headings.forEach((heading) => observer.observe(heading));
    return () => observer.disconnect();
  }, [key]);
  return active;
}

export function Toc({ items }: { items: TocItem[] }) {
  const active = useActiveHeading(items.map((item) => item.id).join(" "));
  if (!items.length) return <div className="toc" />;
  return (
    <nav className="toc" aria-label="On this page">
      <p className="toc-title">On this page</p>
      <ul>
        {items.map((item) => (
          <li key={item.id} data-level={item.level}>
            <a href={`#${item.id}`} aria-current={item.id === active ? "location" : undefined}>
              {item.title}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
