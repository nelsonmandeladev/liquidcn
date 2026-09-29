"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useLiquidElement } from "@/lib/liquid/motion";
import { useLiquidRefraction } from "@/lib/liquid/refraction";

/** A capsule of glass around a group of toolbar buttons, refracting what scrolls beneath. */
export function GlassGroup({ className, children }: { className?: string; children: ReactNode }) {
  const [node, ref] = useLiquidElement<HTMLDivElement>();
  useLiquidRefraction(node);
  return (
    <div ref={ref} className={cn("liquid-surface", className)}>
      {children}
    </div>
  );
}
