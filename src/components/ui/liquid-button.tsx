"use client";
import type { ComponentProps } from "react";
import { Button as BaseButton } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useLiquidElement, useLiquidInteraction } from "@/components/ui/liquid-motion";
import "./liquid.css";
export function Button({ className, variant = "default", ref, ...props }: ComponentProps<typeof BaseButton>) {
  const [node, mergedRef] = useLiquidElement(ref);
  useLiquidInteraction(node);
  return <BaseButton ref={mergedRef} variant={variant} className={cn("liquid-surface liquid-button liquid-interactive", className)} data-liquid-variant={variant} {...props} />;
}
