import type { Metadata } from "next";
import Link from "next/link";
import { PackageCommand } from "@/www/docs/package-command";
import { Hero } from "@/www/home/hero";
import { Showcase } from "@/www/home/showcase";
import { jsonLdScript, siteJsonLd } from "@/www/structured-data";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function Home() {
  return (
    <main id="content" className="home">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(siteJsonLd()) }}
      />
      <Hero />
      <Showcase />
      <section className="home-install" aria-labelledby="install-title">
        <div>
          <h2 id="install-title">Start with one component.</h2>
          <p>
            Each installs through the shadcn CLI and keeps the API you already use.{" "}
            <Link href="/docs/installation">Installation</Link>
          </p>
        </div>
        <PackageCommand args="shadcn@latest add {origin}/r/liquid-button.json" />
      </section>
    </main>
  );
}
