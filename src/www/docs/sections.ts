import { components } from "@/examples";
import { guides, type NavLink, type NavSection } from "@/www/nav";

// Server-side: importing the component list pulls in every example, so client code receives
// these as props instead of importing them.

export const componentLinks: NavLink[] = components.map((component) => ({
  href: `/docs/components/${component.slug}`,
  title: component.name,
}));

export const docsSections: NavSection[] = [
  { title: "Getting started", links: guides },
  { title: "Components", links: componentLinks },
];

/** Every docs page in sidebar order, for the pager and the sitemap. */
export const docsOrder: NavLink[] = [...guides, ...componentLinks];
