/** A page the header search can find. `text` is extra words it should match. */
export type SearchPage = { href: string; title: string; section: string; text: string };

/** Words people search for that the guide titles do not contain. */
export const guideKeywords: Record<string, string> = {
  "/docs": "overview introduction liquid glass apple inspiration ios 26 shadcn radix why",
  "/docs/installation": "install setup cli npx pnpm registry add tailwind",
  "/docs/components": "all components list gallery",
  "/docs/theming":
    "theme dark mode material blur tint ink accent colors css custom properties tokens",
  "/docs/motion":
    "spring animation timing lens press swell menu morph droplet fusion refraction viscosity",
  "/docs/accessibility":
    "a11y reduced motion transparency contrast forced colors keyboard screen reader focus",
};

/**
 * Rank of a page for the search terms, lower is better, or -1 when some term is missing:
 * exact title, then title prefix, then a title word starting with a term, then any match.
 */
export function rank(page: SearchPage, terms: string[]) {
  const title = page.title.toLowerCase();
  const haystack = `${title} ${page.section} ${page.text}`.toLowerCase();
  if (!terms.every((term) => haystack.includes(term))) return -1;
  const phrase = terms.join(" ");
  if (title === phrase) return 0;
  if (title.startsWith(phrase)) return 1;
  const words = title.split(/\s+/);
  return terms.some((term) => words.some((word) => word.startsWith(term))) ? 2 : 3;
}

/** Pages matching every word of `query`, best first. An empty query suggests the guides. */
export function searchPages(query: string, pages: SearchPage[], limit = 8) {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (!terms.length) return pages.filter((page) => page.href in guideKeywords).slice(0, limit);
  return pages
    .map((page, index) => ({ page, index, score: rank(page, terms) }))
    .filter(({ score }) => score >= 0)
    .sort((a, b) => a.score - b.score || a.index - b.index)
    .slice(0, limit)
    .map(({ page }) => page);
}
