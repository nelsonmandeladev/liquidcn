"use client";
import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
  type ComponentProps,
  type Dispatch,
  type SetStateAction,
} from "react";
import {
  DropdownMenu as BaseMenu,
  DropdownMenuTrigger as BaseTrigger,
  DropdownMenuContent as BaseContent,
  DropdownMenuSubContent as BaseSubContent,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useLiquidElement } from "@/lib/liquid/motion";
import {
  MenuMorph,
  MenuSession,
  coverPlacement,
  measureAnchor,
  sameAnchor,
  type Anchor,
} from "@/lib/liquid/menu-morph";
import "./liquid.css";
export {
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";

type SetAnchor = Dispatch<SetStateAction<Anchor | null>>;
type MenuContextValue = { session: MenuSession; anchor: Anchor | null; setAnchor: SetAnchor };

// Content rendered inside a plain Radix menu still works; it just opens beside its trigger.
const detached: MenuContextValue = {
  session: new MenuSession(),
  anchor: null,
  setAnchor: () => {},
};
const MenuContext = createContext<MenuContextValue>(detached);

function remeasure(element: HTMLElement, setAnchor: SetAnchor) {
  const next = measureAnchor(element);
  setAnchor((previous) => (sameAnchor(previous, next) ? previous : next));
}

export function DropdownMenu(props: ComponentProps<typeof BaseMenu>) {
  const [session] = useState(() => new MenuSession());
  const [anchor, setAnchor] = useState<Anchor | null>(null);
  const value = useMemo(() => ({ session, anchor, setAnchor }), [session, anchor]);
  return (
    <MenuContext.Provider value={value}>
      <BaseMenu {...props} />
    </MenuContext.Provider>
  );
}

export function DropdownMenuTrigger({ ref, ...props }: ComponentProps<typeof BaseTrigger>) {
  const { session, setAnchor } = useContext(MenuContext);
  const [node, mergedRef] = useLiquidElement(ref);
  useEffect(
    () => (node ? session.attach(node, () => remeasure(node, setAnchor)) : undefined),
    [session, setAnchor, node],
  );
  return <BaseTrigger ref={mergedRef} {...props} />;
}

function useMenuMorph(node: HTMLDivElement | null, session?: MenuSession, covering = false) {
  useEffect(() => {
    if (!node) return;
    const anchor = () =>
      session?.anchor() ?? document.getElementById(node.getAttribute("aria-labelledby") ?? "");
    const morph = new MenuMorph(node, anchor, covering);
    return () => morph.destroy();
  }, [node, session, covering]);
}

type LiquidContentProps = ComponentProps<typeof BaseContent> & {
  /** Open over the trigger and grow out of it, as iOS does. Set `false` to open beside it. */
  overlap?: boolean;
};

export function DropdownMenuContent({
  className,
  children,
  side = "bottom",
  sideOffset,
  align,
  overlap = true,
  ref,
  ...props
}: LiquidContentProps) {
  const { session, anchor, setAnchor } = useContext(MenuContext);
  const [node, mergedRef] = useLiquidElement(ref);
  const cover = overlap ? anchor : null;
  // Covers opens that did not come from the trigger, e.g. a controlled `open`.
  useLayoutEffect(() => {
    const trigger = session.anchor();
    if (node && overlap && trigger) remeasure(trigger, setAnchor);
  }, [node, overlap, session, setAnchor]);
  useMenuMorph(node, session, !!cover);
  useEffect(() => (node ? session.guard(node) : undefined), [node, session]);
  return (
    <BaseContent
      ref={mergedRef}
      side={side}
      collisionPadding={8}
      {...coverPlacement(cover, side, { sideOffset, align })}
      className={cn("liquid-surface liquid-menu", className)}
      {...props}
    >
      <div className="liquid-menu-body">{children}</div>
    </BaseContent>
  );
}

export function DropdownMenuSubContent({
  className,
  children,
  ref,
  ...props
}: ComponentProps<typeof BaseSubContent>) {
  const [node, mergedRef] = useLiquidElement(ref);
  useMenuMorph(node);
  return (
    <BaseSubContent
      ref={mergedRef}
      className={cn("liquid-surface liquid-menu", className)}
      {...props}
    >
      <div className="liquid-menu-body">{children}</div>
    </BaseSubContent>
  );
}
