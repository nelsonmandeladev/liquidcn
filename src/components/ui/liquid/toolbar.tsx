"use client";
import type { ComponentProps } from "react";
import { Toolbar as Primitive } from "radix-ui";
import { cn } from "@/lib/utils";
import { useLiquidElement } from "@/lib/liquid/motion";
import { useLiquidIndicator } from "@/lib/liquid/lens";
import { useLiquidInteraction } from "@/lib/liquid/press";
import "./liquid.css";
export function Toolbar({ className, ref, ...props }: ComponentProps<typeof Primitive.Root>) {
  const [node, mergedRef] = useLiquidElement(ref);
  useLiquidIndicator(node, {
    selected: '.liquid-toolbar-button[aria-pressed="true"]',
    items: ".liquid-toolbar-button",
  });
  return (
    <Primitive.Root
      ref={mergedRef}
      className={cn("liquid-surface liquid-toolbar", className)}
      {...props}
    />
  );
}
export function ToolbarButton({
  className,
  ref,
  ...props
}: ComponentProps<typeof Primitive.Button>) {
  const [node, mergedRef] = useLiquidElement(ref);
  useLiquidInteraction(node);
  return (
    <Primitive.Button
      ref={mergedRef}
      className={cn("liquid-toolbar-button liquid-interactive", className)}
      {...props}
    />
  );
}
export function ToolbarSeparator(props: ComponentProps<typeof Primitive.Separator>) {
  return <Primitive.Separator className="liquid-toolbar-separator" {...props} />;
}
