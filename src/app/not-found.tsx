import Link from "next/link";
import { Button } from "@/components/ui/liquid/button";
import { Stage } from "@/www/stage";

export default function NotFound() {
  return (
    <main id="content" className="not-found">
      <Stage scene="full" className="not-found-stage">
        <div className="not-found-card liquid-surface">
          <p className="not-found-code">404</p>
          <h1>Nothing here</h1>
          <p>This page does not exist, or it moved.</p>
          <Button asChild variant="prominent">
            <Link href="/docs">Go to the docs</Link>
          </Button>
        </div>
      </Stage>
    </main>
  );
}
