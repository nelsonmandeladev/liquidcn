"use client";

import Link from "next/link";
import { ArrowRight, Code2, Layers2 } from "lucide-react";
import { site } from "@/site";
import { cn } from "@/lib/utils";
import { components, type ComponentEntry } from "@/playground/catalog";

export type Page = "playground" | "registry";

export function Header({ page, onPage }: { page: Page; onPage: (page: Page) => void }) {
  return (
    <header className="header">
      <Link className="brand" href="/" aria-label="liquidcn home">
        <Layers2 />
        liquidcn<span> / </span>
      </Link>
      <nav aria-label="Main">
        <button
          className={cn(page === "playground" && "active")}
          onClick={() => onPage("playground")}
        >
          Playground
        </button>
        <button className={cn(page === "registry" && "active")} onClick={() => onPage("registry")}>
          Registry
        </button>
      </nav>
      <span className="version">v0.2 / Preview</span>
      <a className="repository" href={site.repository} target="_blank" rel="noreferrer">
        GitHub
      </a>
    </header>
  );
}

type Picker = { selected: ComponentEntry; onSelect: (entry: ComponentEntry) => void };

export function Sidebar({ selected, onSelect }: Picker) {
  return (
    <aside className="sidebar">
      <p className="rail-label">Components</p>
      <nav aria-label="Components">
        {components.map((item) => (
          <button
            key={item.id}
            className={cn(selected.id === item.id && "selected")}
            onClick={() => onSelect(item)}
          >
            <item.icon />
            <span>{item.name}</span>
          </button>
        ))}
      </nav>
      <div className="sidebar-bottom">
        <span className="status-dot" />
        {components.length} components<span>Radix UI</span>
      </div>
    </aside>
  );
}

export function RegistryView({ onSelect }: Pick<Picker, "onSelect">) {
  return (
    <section className="registry">
      <p className="breadcrumb">liquidcn / Registry</p>
      <h1>Registry</h1>
      <div className="registry-list">
        {components.map((item) => (
          <button key={item.id} onClick={() => onSelect(item)}>
            <item.icon />
            <span>
              {item.name}
              <small>{item.id}</small>
            </span>
            <ArrowRight />
          </button>
        ))}
      </div>
      <a className="catalog-link" href="/r/registry.json" target="_blank" rel="noreferrer">
        Open registry manifest <Code2 />
      </a>
    </section>
  );
}

export function Footer() {
  return (
    <footer>
      <span>Made of light. Built on shadcn.</span>
      <a href="https://ui.shadcn.com/docs/registry" target="_blank" rel="noreferrer">
        Registry documentation <ArrowRight />
      </a>
    </footer>
  );
}
