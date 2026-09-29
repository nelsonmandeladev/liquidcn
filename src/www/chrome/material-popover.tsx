"use client";

import { SlidersHorizontal } from "lucide-react";
import { Popover } from "radix-ui";
import { Button } from "@/components/ui/liquid/button";
import { MaterialControls } from "@/www/material-controls";

/** The material controls from anywhere on the site. */
export function MaterialPopover() {
  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <Button variant="ghost" size="icon" aria-label="Glass material">
          <SlidersHorizontal />
        </Button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="end"
          sideOffset={14}
          collisionPadding={12}
          aria-label="Glass material"
          className="material-popover liquid-surface"
        >
          <p className="material-popover-title">Material</p>
          <p className="material-popover-note">Applies to every glass surface on this site.</p>
          <MaterialControls />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
