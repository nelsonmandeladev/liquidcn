import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import ButtonDemo from "@/examples/button/demo";
import DropdownMenuDemo from "@/examples/dropdown-menu/demo";
import SonnerDemo from "@/examples/sonner/demo";
import TabsDemo from "@/examples/tabs/demo";
import TabsTabBar from "@/examples/tabs/tab-bar";
import ToolbarDemo from "@/examples/toolbar/demo";
import ToolbarPhotoActions from "@/examples/toolbar/photo-actions";
import { MaterialControls } from "@/www/material-controls";
import { Stage } from "@/www/stage";
import type { SceneName } from "@/www/stage-scenes";

type TileProps = {
  area: string;
  scene: SceneName;
  label: string;
  href: string;
  eager?: boolean;
  children: ReactNode;
};

/** A photo with live components on it, and a link to their docs. */
function Tile({ area, scene, label, href, eager, children }: TileProps) {
  return (
    <div className={`tile tile-${area}`}>
      <Stage scene={scene} eager={eager}>
        <Link href={href} className="tile-label liquid-surface">
          {label}
          <ArrowUpRight aria-hidden="true" />
        </Link>
        {children}
      </Stage>
    </div>
  );
}

/** The examples from the docs, composed like screens. Every control here is live. */
export function Showcase() {
  return (
    <section className="showcase" aria-labelledby="showcase-title">
      <h2 id="showcase-title" className="sr-only">
        Try the components
      </h2>
      <Tile area="photos" scene="full" label="Tabs and Toolbar" href="/docs/components/tabs" eager>
        <TabsDemo />
        <ToolbarPhotoActions />
      </Tile>
      <Tile area="phone" scene="forest" label="Tab bar" href="/docs/components/tabs" eager>
        <TabsTabBar />
      </Tile>
      <section className="tile tile-material" aria-labelledby="material-title">
        <h3 id="material-title">Material</h3>
        <p>Every glass surface on this site follows these controls.</p>
        <MaterialControls />
      </section>
      <Tile area="button" scene="lake" label="Button" href="/docs/components/button">
        <ButtonDemo />
      </Tile>
      <Tile area="menu" scene="peaks" label="Dropdown Menu" href="/docs/components/dropdown-menu">
        <DropdownMenuDemo />
      </Tile>
      <Tile area="toast" scene="sky" label="Toast" href="/docs/components/sonner">
        <SonnerDemo />
      </Tile>
      <Tile area="tools" scene="shore" label="Toolbar" href="/docs/components/toolbar">
        <ToolbarDemo />
      </Tile>
    </section>
  );
}
