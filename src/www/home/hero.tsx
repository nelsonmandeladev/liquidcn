import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/liquid/button";

export function Hero() {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <Button asChild variant="secondary" size="sm" className="hero-badge">
        <Link href="/docs/motion">
          Tuned frame by frame against iOS 26
          <ArrowRight />
        </Link>
      </Button>
      <h1 id="hero-title">
        shadcn/ui,
        <br /> made of glass.
      </h1>
      <p className="hero-lead">
        Liquid Glass components that swell under your finger, lift a lens across tabs, and grow
        menus out of their buttons. The shadcn/ui API you know, on Radix, installed as source.
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
