"use client";
import type { ComponentProps } from "react";
import { TabsList as BaseList, TabsTrigger as BaseTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useLiquidElement, useLiquidIndicator } from "@/components/ui/liquid-motion";
import "./liquid.css";
export { Tabs, TabsContent } from "@/components/ui/tabs";
export function TabsList({ className, ref, ...props }: ComponentProps<typeof BaseList>) {
  const [node, mergedRef] = useLiquidElement(ref);
  useLiquidIndicator(node, '.liquid-tab[data-state="active"]');
  return <BaseList ref={mergedRef} className={cn("liquid-surface liquid-tabs", className)} {...props} />;
}
export function TabsTrigger({ className, ...props }: ComponentProps<typeof BaseTrigger>) {
  return <BaseTrigger className={cn("liquid-tab", className)} {...props} />;
}
