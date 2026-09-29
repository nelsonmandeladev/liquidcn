import Link from "next/link";
import { PackageCommand } from "@/www/docs/package-command";
import { Hero } from "@/www/home/hero";
import { Showcase } from "@/www/home/showcase";

export default function Home() {
  return (
    <main id="content" className="home">
      <Hero />
      <Showcase />
      <section className="home-install" aria-labelledby="install-title">
        <div>
          <h2 id="install-title">Start with one component.</h2>
          <p>
            Each installs as source through the shadcn CLI and keeps the API you already use.{" "}
            <Link href="/docs/installation">Installation</Link>
          </p>
        </div>
        <PackageCommand args="shadcn@latest add {origin}/r/liquid-button.json" />
      </section>
    </main>
  );
}
