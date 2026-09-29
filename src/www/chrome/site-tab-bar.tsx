"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { Blocks, BookOpen, Compass, Palette, Waves } from "lucide-react";
import { TabBar, TabBarItems, TabBarSearch } from "@/components/ui/liquid/tab-bar";
import { MainNav } from "@/www/chrome/main-nav";
import { currentLink, type NavLink } from "@/www/nav";
import { searchPages, type SearchPage } from "@/www/search";

/** The icon each section folds into while searching, as iOS shows the selected tab's icon. */
const icons: Record<string, ReactNode> = {
  "/docs": <BookOpen />,
  "/docs/components": <Blocks />,
  "/docs/theming": <Palette />,
  "/docs/motion": <Waves />,
};

const listId = "site-search-results";
const steps: Record<string, number> = { ArrowDown: 1, ArrowUp: -1 };
const optionId = (index: number) => `site-search-option-${index}`;

/** "/" or Ctrl/Cmd+K opens search from anywhere but a text field. */
function useSearchShortcut(open: () => void) {
  useEffect(() => {
    const onKey = (event: globalThis.KeyboardEvent) => {
      const target = event.target instanceof Element ? event.target : null;
      const typing = !!target?.closest("input, textarea, select, [contenteditable]");
      const command = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k";
      if (!command && (event.key !== "/" || typing)) return;
      event.preventDefault();
      open();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);
}

type ResultsProps = {
  query: string;
  results: SearchPage[];
  active: number;
  onHover: (index: number) => void;
  onPick: (page: SearchPage) => void;
};

function status(query: string, count: number) {
  if (!query.trim()) return "Suggestions";
  if (!count) return "No pages found";
  return `${count} ${count === 1 ? "page" : "pages"}`;
}

/** Results under the field, as iPadOS shows search suggestions in a panel below it. */
function SearchResults({ query, results, active, onHover, onPick }: ResultsProps) {
  return (
    <div className="site-search-panel liquid-surface site-glass">
      <p className="site-search-status" aria-live="polite">
        {status(query, results.length)}
      </p>
      {results.length > 0 && (
        <ul role="listbox" id={listId} aria-label="Pages">
          {results.map((page, index) => (
            <li
              key={page.href}
              id={optionId(index)}
              role="option"
              aria-selected={index === active}
              onPointerMove={() => onHover(index)}
              // Keep focus in the field; the click still arrives.
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => onPick(page)}
            >
              <span className="site-search-title">{page.title}</span>
              <span className="site-search-section">{page.section}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** The header's tab bar: the sections under a lens, and a search button that becomes a field. */
export function SiteTabBar({ links, pages }: { links: NavLink[]; pages: SearchPage[] }) {
  const pathname = usePathname();
  const router = useRouter();
  const [searching, setSearching] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const results = useMemo(() => searchPages(query, pages), [query, pages]);
  const current = currentLink(pathname, links);
  const icon = (current && icons[current.href]) ?? <Compass />;

  const toggle = useCallback((next: boolean) => {
    setSearching(next);
    setQuery("");
    setActive(0);
  }, []);
  useSearchShortcut(useCallback(() => toggle(true), [toggle]));
  const pick = (page: SearchPage) => {
    toggle(false);
    router.push(page.href);
  };
  const keyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    const step = steps[event.key];
    if (step && results.length) {
      event.preventDefault();
      setActive((active + step + results.length) % results.length);
    } else if (event.key === "Enter" && results[active]) {
      event.preventDefault();
      pick(results[active]);
    }
  };

  return (
    <TabBar className="site-tab-bar" searching={searching} onSearchingChange={toggle}>
      <TabBarItems
        className="site-glass"
        icon={icon}
        label={`Back to ${current?.title ?? "navigation"}`}
      >
        <MainNav links={links} />
      </TabBarItems>
      <TabBarSearch
        className="site-glass"
        placeholder="Search docs"
        aria-label="Search docs"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={results.length > 0}
        aria-controls={results.length ? listId : undefined}
        aria-activedescendant={results[active] ? optionId(active) : undefined}
        autoComplete="off"
        spellCheck={false}
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setActive(0);
        }}
        onKeyDown={keyDown}
      />
      {searching && (
        <SearchResults
          query={query}
          results={results}
          active={active}
          onHover={setActive}
          onPick={pick}
        />
      )}
    </TabBar>
  );
}
