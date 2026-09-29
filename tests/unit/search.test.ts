import { describe, expect, it } from "vitest";
import { searchIndex } from "@/www/docs/sections";
import { rank, searchPages, type SearchPage } from "@/www/search";

const page = (title: string, text = "", href = `/${title}`): SearchPage => ({
  href,
  title,
  section: "Components",
  text,
});

describe("rank", () => {
  it("prefers exact titles, then prefixes, then title words, then any match", () => {
    expect(rank(page("Tabs"), ["tabs"])).toBe(0);
    expect(rank(page("Tab Bar"), ["tab"])).toBe(1);
    expect(rank(page("Dropdown Menu"), ["menu"])).toBe(2);
    expect(rank(page("Toast", "sonner notifications"), ["sonner"])).toBe(3);
  });

  it("needs every term", () => {
    expect(rank(page("Tab Bar", "search"), ["tab", "search"])).toBe(2);
    expect(rank(page("Tab Bar"), ["tab", "toast"])).toBe(-1);
  });
});

describe("searchPages", () => {
  it("finds docs pages by title and by what they are about", () => {
    const titles = (query: string) => searchPages(query, searchIndex).map((result) => result.title);
    expect(titles("menu")[0]).toBe("Dropdown Menu");
    expect(titles("tab")).toEqual(expect.arrayContaining(["Tab Bar", "Tabs"]));
    expect(titles("reduced motion")).toContain("Accessibility");
    expect(titles("install")[0]).toBe("Installation");
    expect(titles("zzz")).toEqual([]);
  });

  it("suggests the guides before anything is typed", () => {
    const suggestions = searchPages("  ", searchIndex);
    expect(suggestions.map((result) => result.section)).toEqual(
      suggestions.map(() => "Getting started"),
    );
    expect(suggestions[0].title).toBe("Introduction");
  });

  it("keeps the index order among equal matches and respects the limit", () => {
    const pages = [page("Alpha", "glass"), page("Beta", "glass"), page("Gamma", "glass")];
    expect(searchPages("glass", pages, 2).map((result) => result.title)).toEqual(["Alpha", "Beta"]);
  });
});
