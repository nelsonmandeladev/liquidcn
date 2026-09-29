"use client";
import { createContext, useContext, useEffect, useRef, type ComponentProps, type RefObject } from "react";
import { DropdownMenu as BaseMenu, DropdownMenuTrigger as BaseTrigger, DropdownMenuContent as BaseContent, DropdownMenuSubContent as BaseSubContent } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useLiquidElement } from "@/components/ui/liquid-motion";
import "./liquid.css";
export { DropdownMenuGroup, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel, DropdownMenuCheckboxItem, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuShortcut, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuPortal } from "@/components/ui/dropdown-menu";

const TriggerContext = createContext<RefObject<HTMLButtonElement | null> | null>(null);

export function DropdownMenu(props: ComponentProps<typeof BaseMenu>) {
  const trigger = useRef<HTMLButtonElement>(null);
  return <TriggerContext.Provider value={trigger}><BaseMenu {...props} /></TriggerContext.Provider>;
}

export function DropdownMenuTrigger({ ref, ...props }: ComponentProps<typeof BaseTrigger>) {
  const context = useContext(TriggerContext);
  const [node, mergedRef] = useLiquidElement(ref);
  useEffect(() => {
    if (!context) return;
    context.current = node;
    return () => { context.current = null; };
  }, [context, node]);
  return <BaseTrigger ref={mergedRef} {...props} />;
}

function useMenuMorph(node: HTMLDivElement | null, trigger?: RefObject<HTMLButtonElement | null> | null) {
  useEffect(() => {
    if (!node) return;
    const measure = () => {
      const anchor = trigger?.current ?? document.getElementById(node.getAttribute("aria-labelledby") ?? "");
      if (!anchor) return;
      const from = anchor.getBoundingClientRect();
      // Popper positions the wrapper; the content itself may still be springing.
      const wrapper = node.parentElement?.getBoundingClientRect();
      if (!wrapper || !node.offsetWidth || !node.offsetHeight) return;
      node.style.setProperty("--liquid-menu-x", `${from.left + from.width / 2 - (wrapper.left + node.offsetWidth / 2)}px`);
      node.style.setProperty("--liquid-menu-y", `${from.top + from.height / 2 - (wrapper.top + node.offsetHeight / 2)}px`);
      node.style.setProperty("--liquid-menu-scale-x", String(Math.min(1, from.width / node.offsetWidth)));
      node.style.setProperty("--liquid-menu-scale-y", String(Math.min(1, from.height / node.offsetHeight)));
    };
    // Wait for Radix collision resolution before measuring the destination.
    const frame = requestAnimationFrame(() => { measure(); node.dataset.liquidMorph = "ready"; });
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
      delete node.dataset.liquidMorph;
    };
  }, [node, trigger]);
}

export function DropdownMenuContent({ className, sideOffset = 10, ref, ...props }: ComponentProps<typeof BaseContent>) {
  const trigger = useContext(TriggerContext);
  const [node, mergedRef] = useLiquidElement(ref);
  useMenuMorph(node, trigger);
  return <BaseContent ref={mergedRef} sideOffset={sideOffset} className={cn("liquid-surface liquid-menu", className)} {...props} />;
}
export function DropdownMenuSubContent({ className, ref, ...props }: ComponentProps<typeof BaseSubContent>) {
  const [node, mergedRef] = useLiquidElement(ref);
  useMenuMorph(node);
  return <BaseSubContent ref={mergedRef} className={cn("liquid-surface liquid-menu", className)} {...props} />;
}
