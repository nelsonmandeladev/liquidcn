import Link from "next/link";
import { Github } from "lucide-react";
import { Button } from "@/components/ui/liquid/button";
import { site } from "@/site";
import { Logo } from "@/www/chrome/logo";
import { MainNav } from "@/www/chrome/main-nav";
import { MaterialPopover } from "@/www/chrome/material-popover";
import { MobileNav } from "@/www/chrome/mobile-nav";
import { ThemeToggle } from "@/www/chrome/theme-toggle";
import { docsSections } from "@/www/docs/sections";
import { mainNav } from "@/www/nav";

const mobileSections = [
  { title: "liquidcn", links: [{ href: "/", title: "Home" }] },
  ...docsSections,
];

/** A floating glass bar. Pages scroll underneath it, so the blur has something to work on. */
export function SiteHeader() {
  return (
    <header className="site-header-wrap">
      <div className="site-header liquid-surface">
        <Link href="/" className="site-brand">
          <Logo className="site-logo" />
          liquidcn
        </Link>
        <MainNav links={mainNav} />
        <div className="site-actions">
          <MaterialPopover />
          <ThemeToggle />
          <Button asChild variant="ghost" size="icon">
            <a href={site.repository} aria-label="liquidcn on GitHub">
              <Github />
            </a>
          </Button>
          <MobileNav sections={mobileSections} />
        </div>
      </div>
    </header>
  );
}
