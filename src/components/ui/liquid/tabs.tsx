"use client";
import type { ComponentProps } from "react";
import { TabsList as BaseList, TabsTrigger as BaseTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useLiquidElement } from "@/lib/liquid/motion";
import { useLiquidIndicator } from "@/lib/liquid/lens";
import "./liquid.css";
export { Tabs, TabsContent } from "@/components/ui/tabs";
export function TabsList({ className, ref, ...props }: ComponentProps<typeof BaseList>) {
  const [node, mergedRef] = useLiquidElement(ref);
  useLiquidIndicator(node, {
    selected: '.liquid-tab[data-state="active"]',
    items: ".liquid-tab",
    scrub: true,
  });
  return (
    <BaseList ref={mergedRef} className={cn("liquid-surface liquid-tabs", className)} {...props} />
  );
}
export function TabsTrigger({ className, ...props }: ComponentProps<typeof BaseTrigger>) {
  return <BaseTrigger className={cn("liquid-tab", className)} {...props} />;
}
