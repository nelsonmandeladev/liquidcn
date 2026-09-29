import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/liquid/button";
import type { NavLink } from "@/www/nav";

type Neighbors = { previous?: NavLink; next?: NavLink };

/** Small arrows beside the title. */
export function PagerButtons({ previous, next }: Neighbors) {
  return (
    <div className="pager-buttons">
      {previous && (
        <Button asChild variant="secondary" size="icon-sm">
          <Link href={previous.href} aria-label={`Previous: ${previous.title}`}>
            <ArrowLeft />
          </Link>
        </Button>
      )}
      {next && (
        <Button asChild variant="secondary" size="icon-sm">
          <Link href={next.href} aria-label={`Next: ${next.title}`}>
            <ArrowRight />
          </Link>
        </Button>
      )}
    </div>
  );
}

/** Previous and next pages at the end of an article. */
export function Pager({ previous, next }: Neighbors) {
  return (
    <nav className="pager" aria-label="Pages">
      {previous && (
        <Link href={previous.href} className="pager-link" rel="prev">
          <span>Previous</span>
          {previous.title}
        </Link>
      )}
      {next && (
        <Link href={next.href} className="pager-link pager-next" rel="next">
          <span>Next</span>
          {next.title}
        </Link>
      )}
    </nav>
  );
}
