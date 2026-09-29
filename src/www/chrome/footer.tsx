import { site } from "@/site";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <p>
        Built on <a href="https://ui.shadcn.com">shadcn/ui</a> and{" "}
        <a href="https://www.radix-ui.com">Radix</a>. The source is on{" "}
        <a href={site.repository}>GitHub</a> under the MIT license.
      </p>
      <p>Liquid Glass is Apple&rsquo;s design language. liquidcn is an independent project.</p>
    </footer>
  );
}
