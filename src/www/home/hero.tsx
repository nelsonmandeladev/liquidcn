import Link from "next/link";
import { Button } from "@/components/ui/liquid/button";

export function Hero() {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <h1 id="hero-title">shadcn/ui, made of glass.</h1>
      <p className="hero-lead">
        Liquid Glass components that swell under your finger, lift a lens across tabs, and grow
        menus out of their buttons. Just liquid glass on top of shadcn components you already use.
      </p>
      <div className="hero-actions">
        <Button asChild variant="prominent" size="lg">
          <Link href="/docs">Get started</Link>
        </Button>
        <Button asChild size="lg">
          <Link href="/docs/components">Browse components</Link>
        </Button>
      </div>
    </section>
  );
}
