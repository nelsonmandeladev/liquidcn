import { site } from "@/site";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <p>
        Built on <a href="https://ui.shadcn.com">shadcn/ui</a>. The source is on{" "}
        <a href={site.repository}>GitHub</a> under the MIT license.
      </p>
    </footer>
  );
}
