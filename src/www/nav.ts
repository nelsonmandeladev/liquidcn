export type NavLink = { href: string; title: string };
export type NavSection = { title: string; links: NavLink[] };

/** Header links. The deepest one containing the current page is marked current. */
export const mainNav: NavLink[] = [
  { href: "/docs", title: "Docs" },
  { href: "/docs/components", title: "Components" },
  { href: "/docs/theming", title: "Theming" },
  { href: "/docs/motion", title: "Motion" },
];

export const guides: NavLink[] = [
  { href: "/docs", title: "Introduction" },
  { href: "/docs/installation", title: "Installation" },
  { href: "/docs/components", title: "Components" },
  { href: "/docs/theming", title: "Theming" },
  { href: "/docs/motion", title: "Motion" },
  { href: "/docs/accessibility", title: "Accessibility" },
];

const within = (pathname: string, href: string) =>
  pathname === href || pathname.startsWith(`${href}/`);

/** The link with the longest href that contains `pathname`, or undefined. */
export function currentLink(pathname: string, links: NavLink[]) {
  return links
    .filter((link) => within(pathname, link.href))
    .sort((a, b) => b.href.length - a.href.length)[0];
}

/** Previous and next pages in reading order. */
export function neighbors(pathname: string, order: NavLink[]) {
  const index = order.findIndex((link) => link.href === pathname);
  if (index === -1) return { previous: undefined, next: undefined };
  return { previous: order[index - 1], next: order[index + 1] };
}
