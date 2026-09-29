"use client";
import { createContext, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState, type ComponentProps, type Dispatch, type RefObject, type SetStateAction } from "react";
import { DropdownMenu as BaseMenu, DropdownMenuTrigger as BaseTrigger, DropdownMenuContent as BaseContent, DropdownMenuSubContent as BaseSubContent } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { motionReduced, useLiquidElement } from "@/components/ui/liquid-motion";
import "./liquid.css";
export { DropdownMenuGroup, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel, DropdownMenuCheckboxItem, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuShortcut, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuPortal } from "@/components/ui/dropdown-menu";

type Anchor = { width: number; height: number; align: "start" | "center" | "end" };
type Press = { id: number; x: number; y: number; moved: boolean };
type MenuContextValue = {
  trigger: RefObject<HTMLButtonElement | null>;
  press: RefObject<Press | null>;
  anchor: Anchor | null;
  setAnchor: Dispatch<SetStateAction<Anchor | null>>;
};
const MenuContext = createContext<MenuContextValue | null>(null);

// Like iOS, a menu hugs the screen edge its trigger is nearest to.
function measureAnchor(element: HTMLElement): Anchor {
  const box = element.getBoundingClientRect();
  const center = box.left + box.width / 2;
  const third = window.innerWidth / 3;
  return { width: element.offsetWidth, height: element.offsetHeight, align: center < third ? "start" : center > third * 2 ? "end" : "center" };
}
const sameAnchor = (a: Anchor | null, b: Anchor) => !!a && a.width === b.width && a.height === b.height && a.align === b.align;

export function DropdownMenu(props: ComponentProps<typeof BaseMenu>) {
  const trigger = useRef<HTMLButtonElement>(null);
  const press = useRef<Press>(null);
  const [anchor, setAnchor] = useState<Anchor | null>(null);
  const value = useMemo(() => ({ trigger, press, anchor, setAnchor }), [anchor]);
  return <MenuContext.Provider value={value}><BaseMenu {...props} /></MenuContext.Provider>;
}

export function DropdownMenuTrigger({ ref, ...props }: ComponentProps<typeof BaseTrigger>) {
  const context = useContext(MenuContext);
  const [node, mergedRef] = useLiquidElement(ref);
  const trigger = context?.trigger;
  const press = context?.press;
  const setAnchor = context?.setAnchor;
  useEffect(() => {
    if (!trigger || !press || !setAnchor || !node) return;
    trigger.current = node;
    const measure = () => { const next = measureAnchor(node); setAnchor(previous => sameAnchor(previous, next) ? previous : next); };
    const track = (event: PointerEvent) => {
      const current = press.current;
      if (current?.id === event.pointerId && Math.hypot(event.clientX - current.x, event.clientY - current.y) > 10) current.moved = true;
    };
    const release = (event: PointerEvent) => {
      if (press.current?.id !== event.pointerId) return;
      window.removeEventListener("pointermove", track, true);
      window.removeEventListener("pointerup", release, true);
      window.removeEventListener("pointercancel", release, true);
      // Keep the guard for the click that follows a touch release, then drop it.
      const pressed = press.current;
      setTimeout(() => { if (press.current === pressed) press.current = null; }, 600);
    };
    // Runs before Radix opens the menu on the same pointerdown.
    const down = (event: PointerEvent) => {
      if (event.button !== 0) return;
      measure();
      press.current = { id: event.pointerId, x: event.clientX, y: event.clientY, moved: false };
      window.addEventListener("pointermove", track, true);
      window.addEventListener("pointerup", release, true);
      window.addEventListener("pointercancel", release, true);
    };
    const key = (event: KeyboardEvent) => { if (["Enter", " ", "ArrowDown"].includes(event.key)) { press.current = null; measure(); } };
    node.addEventListener("pointerdown", down);
    node.addEventListener("keydown", key);
    return () => {
      node.removeEventListener("pointerdown", down);
      node.removeEventListener("keydown", key);
      window.removeEventListener("pointermove", track, true);
      window.removeEventListener("pointerup", release, true);
      window.removeEventListener("pointercancel", release, true);
      if (trigger.current === node) trigger.current = null;
    };
  }, [trigger, press, setAnchor, node]);
  return <BaseTrigger ref={mergedRef} {...props} />;
}

function useMenuMorph(node: HTMLDivElement | null, trigger?: RefObject<HTMLElement | null> | null, covering = false) {
  useEffect(() => {
    if (!node) return;
    const anchorElement = () => trigger?.current ?? document.getElementById(node.getAttribute("aria-labelledby") ?? "");
    const set = (name: string, value: string | number) => node.style.setProperty(`--liquid-menu-${name}`, String(value));
    const measure = () => {
      const anchor = anchorElement();
      // Popper positions the wrapper; the content itself may still be springing.
      const wrapper = node.parentElement?.getBoundingClientRect();
      const width = node.offsetWidth, height = node.offsetHeight;
      if (!anchor || !wrapper || !width || !height) return;
      const from = anchor.getBoundingClientRect();
      const raw = getComputedStyle(anchor).borderTopLeftRadius;
      const radius = Math.min(raw.endsWith("%") ? parseFloat(raw) / 100 * Math.min(from.width, from.height) : parseFloat(raw) || 0, from.width / 2, from.height / 2);
      const sx = Math.max(.05, Math.min(1, from.width / width));
      const sy = Math.max(.05, Math.min(1, from.height / height));
      const dx = from.left + from.width / 2 - (wrapper.left + width / 2);
      const dy = from.top + from.height / 2 - (wrapper.top + height / 2);
      // Mid-flight the glass is a round droplet, part way between trigger and panel.
      const diameter = Math.min(Math.max(width, height), Math.max(from.width, from.height, Math.sqrt(width * height) * .6));
      set("x", `${dx}px`);
      set("y", `${dy}px`);
      set("scale-x", sx);
      set("scale-y", sy);
      // Unscaled radii that render as the trigger's own corners at the trigger's size.
      set("radius", `${radius / sx}px / ${radius / sy}px`);
      set("mid-x", `${dx * .45}px`);
      set("mid-y", `${dy * .45}px`);
      set("mid-scale-x", Math.min(1, diameter / width));
      set("mid-scale-y", Math.min(1, diameter / height));
    };
    // Wait for Radix placement and collision resolution before measuring the destination.
    let frame = requestAnimationFrame(() => { frame = requestAnimationFrame(() => { measure(); node.dataset.liquidMorph = "ready"; }); });
    const covered = covering ? anchorElement() : null;
    if (covered) covered.dataset.liquidCovered = "";
    const closing = new MutationObserver(() => { if (node.dataset.state === "closed") measure(); });
    closing.observe(node, { attributes: true, attributeFilter: ["data-state"] });
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      cancelAnimationFrame(frame);
      closing.disconnect();
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
      const closed = node.dataset.state === "closed";
      delete node.dataset.liquidMorph;
      if (covered) delete covered.dataset.liquidCovered;
      // The droplet lands in its trigger with a small bulge.
      const anchor = anchorElement();
      if (closed && anchor && !motionReduced(anchor)) {
        anchor.animate?.([{ scale: "1" }, { scale: "1.1 1.14", offset: .35 }, { scale: ".97 .95", offset: .7 }, { scale: "1" }], { duration: 420, easing: "ease-out" });
      }
    };
  }, [node, trigger, covering]);
}

// Radix selects an item on pointerup even when the press began on the trigger. A menu that
// opens over its trigger would then pick whatever landed under a still finger or cursor.
function usePressGuard(node: HTMLElement | null, press?: RefObject<Press | null>) {
  useEffect(() => {
    if (!node || !press) return;
    const still = (event: MouseEvent) => {
      const current = press.current;
      if (!current || current.moved || (event instanceof PointerEvent && event.pointerId !== current.id)) return;
      event.stopPropagation();
      if (event.type === "click") { event.preventDefault(); press.current = null; }
    };
    // A fresh press inside the menu is a deliberate choice.
    const fresh = () => { press.current = null; };
    node.addEventListener("pointerdown", fresh, true);
    node.addEventListener("pointerup", still, true);
    node.addEventListener("click", still, true);
    return () => {
      node.removeEventListener("pointerdown", fresh, true);
      node.removeEventListener("pointerup", still, true);
      node.removeEventListener("click", still, true);
    };
  }, [node, press]);
}

type LiquidContentProps = ComponentProps<typeof BaseContent> & {
  /** Open over the trigger and grow out of it, as iOS does. Set `false` to open beside it. */
  overlap?: boolean;
};

export function DropdownMenuContent({ className, children, side = "bottom", sideOffset, align, collisionPadding = 8, overlap = true, ref, ...props }: LiquidContentProps) {
  const context = useContext(MenuContext);
  const [node, mergedRef] = useLiquidElement(ref);
  const anchor = overlap ? context?.anchor ?? null : null;
  const across = side === "left" || side === "right";
  const setAnchor = context?.setAnchor;
  const trigger = context?.trigger;
  // Covers opens that did not come from the trigger, e.g. a controlled `open`.
  useLayoutEffect(() => {
    if (!node || !overlap || !setAnchor || !trigger?.current) return;
    const next = measureAnchor(trigger.current);
    setAnchor(previous => sameAnchor(previous, next) ? previous : next);
  }, [node, overlap, setAnchor, trigger]);
  useMenuMorph(node, trigger, !!anchor);
  usePressGuard(node, context?.press);
  return <BaseContent
    ref={mergedRef}
    side={side}
    sideOffset={sideOffset ?? (anchor ? -(across ? anchor.width : anchor.height) : 10)}
    align={align ?? (anchor && !across ? anchor.align : "center")}
    collisionPadding={collisionPadding}
    className={cn("liquid-surface liquid-menu", className)}
    {...props}
  ><div className="liquid-menu-body">{children}</div></BaseContent>;
}
export function DropdownMenuSubContent({ className, children, ref, ...props }: ComponentProps<typeof BaseSubContent>) {
  const [node, mergedRef] = useLiquidElement(ref);
  useMenuMorph(node);
  return <BaseSubContent ref={mergedRef} className={cn("liquid-surface liquid-menu", className)} {...props}><div className="liquid-menu-body">{children}</div></BaseSubContent>;
}
