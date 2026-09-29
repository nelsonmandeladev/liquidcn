import { site } from "@/site";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <p className="site-footer-notice">
        <strong>Early stage.</strong> APIs may still change, so add liquidcn to existing projects
        with care.
      </p>
      <p>
        Built on <a href="https://ui.shadcn.com">shadcn/ui</a>. The source is on{" "}
        <a href={site.repository}>GitHub</a> under the MIT license.
      </p>
    </footer>
  );
}
