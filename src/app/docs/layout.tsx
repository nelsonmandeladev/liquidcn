import type { ReactNode } from "react";
import { docsSections } from "@/www/docs/sections";
import { DocsSidebar } from "@/www/docs/sidebar";

export default function DocsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="docs">
      <DocsSidebar sections={docsSections} />
      <main id="content" className="docs-main">
        {children}
      </main>
    </div>
  );
}
