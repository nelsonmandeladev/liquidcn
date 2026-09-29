import Link from "next/link";
import { Github } from "lucide-react";
import { Button } from "@/components/ui/liquid/button";
import { site } from "@/site";
import { GlassGroup } from "@/www/chrome/glass-group";
import { Logo } from "@/www/chrome/logo";
import { MaterialPopover } from "@/www/chrome/material-popover";
import { MobileNav } from "@/www/chrome/mobile-nav";
import { SiteTabBar } from "@/www/chrome/site-tab-bar";
import { ThemeToggle } from "@/www/chrome/theme-toggle";
import { docsSections, searchIndex } from "@/www/docs/sections";
import { mainNav } from "@/www/nav";

const mobileSections = [
  { title: "liquidcn", links: [{ href: "/", title: "Home" }] },
  ...docsSections,
];

/**
 * Floating glass controls in the layout of an iPadOS toolbar: the title leading, a tab bar with
 * its search button centered, and actions trailing. Each group is only as wide as its content;
 * pages scroll beneath a soft scroll edge rather than a full-width bar.
 */
export function SiteHeader() {
  return (
    <header className="site-header">
      <Link href="/" className="site-brand">
        <Logo className="site-logo" />
        liquidcn
      </Link>
      <SiteTabBar links={mainNav} pages={searchIndex} />
      <GlassGroup className="site-actions site-glass">
        <MaterialPopover />
        <ThemeToggle />
        <Button asChild variant="ghost" size="icon">
          <a href={site.repository} aria-label="liquidcn on GitHub">
            <Github />
          </a>
        </Button>
        <MobileNav sections={mobileSections} />
      </GlassGroup>
    </header>
  );
}
