import { listen, motionReduced } from "@/components/ui/liquid-motion";

export type Anchor = { width: number; height: number; align: "start" | "center" | "end" };
export type Press = { id: number; x: number; y: number; moved: boolean };
type Rect = Pick<DOMRect, "left" | "top" | "width" | "height">;

/** Like iOS, a menu hugs the screen edge its trigger is nearest to. */
export function measureAnchor(element: HTMLElement, viewportWidth = window.innerWidth): Anchor {
  const box = element.getBoundingClientRect();
  const center = box.left + box.width / 2;
  const third = viewportWidth / 3;
  const align = center < third ? "start" : center > third * 2 ? "end" : "center";
  return { width: element.offsetWidth, height: element.offsetHeight, align };
}

export function sameAnchor(a: Anchor | null, b: Anchor) {
  return !!a && a.width === b.width && a.height === b.height && a.align === b.align;
}

/** Corner radius in px, from a computed `border-*-radius` value. */
export function radiusOf(value: string, box: Rect) {
  const raw = value.endsWith("%")
    ? (parseFloat(value) / 100) * Math.min(box.width, box.height)
    : parseFloat(value) || 0;
  return Math.min(raw, box.width / 2, box.height / 2);
}

/**
 * CSS variables for the morph between a trigger and its menu panel: the trigger's own shape,
 * then a round droplet part way between the two, then the panel.
 */
export function morphVariables(from: Rect, panel: Rect, radius: number) {
  const { width, height } = panel;
  const sx = Math.max(0.05, Math.min(1, from.width / width));
  const sy = Math.max(0.05, Math.min(1, from.height / height));
  const dx = from.left + from.width / 2 - (panel.left + width / 2);
  const dy = from.top + from.height / 2 - (panel.top + height / 2);
  const droplet = Math.max(from.width, from.height, Math.sqrt(width * height) * 0.6);
  const diameter = Math.min(Math.max(width, height), droplet);
  return {
    x: `${dx}px`,
    y: `${dy}px`,
    "scale-x": String(sx),
    "scale-y": String(sy),
    // Unscaled radii that render as the trigger's own corners at the trigger's size.
    radius: `${radius / sx}px / ${radius / sy}px`,
    "mid-x": `${dx * 0.45}px`,
    "mid-y": `${dy * 0.45}px`,
    "mid-scale-x": String(Math.min(1, diameter / width)),
    "mid-scale-y": String(Math.min(1, diameter / height)),
  };
}

/** Drives the unfold and fold of one menu surface relative to its anchor element. */
export class MenuMorph {
  private frame = 0;
  private readonly covered: HTMLElement | null;
  private readonly cleanups: (() => void)[] = [];

  constructor(
    private readonly node: HTMLElement,
    private readonly anchor: () => HTMLElement | null,
    covering: boolean,
  ) {
    // Wait for Radix placement and collision resolution before measuring the destination.
    this.frame = requestAnimationFrame(() => {
      this.frame = requestAnimationFrame(() => {
        this.measure();
        node.dataset.liquidMorph = "ready";
      });
    });
    this.covered = covering ? anchor() : null;
    if (this.covered) this.covered.dataset.liquidCovered = "";
    const closing = new MutationObserver(() => {
      if (node.dataset.state === "closed") this.measure();
    });
    closing.observe(node, { attributes: true, attributeFilter: ["data-state"] });
    this.cleanups.push(
      () => closing.disconnect(),
      listen(window, { resize: this.measure }),
      listen(window, { scroll: this.measure }, { capture: true }),
    );
  }

  destroy() {
    cancelAnimationFrame(this.frame);
    this.cleanups.forEach((cleanup) => cleanup());
    const closed = this.node.dataset.state === "closed";
    delete this.node.dataset.liquidMorph;
    if (this.covered) delete this.covered.dataset.liquidCovered;
    if (closed) landIn(this.anchor());
  }

  private measure = () => {
    const anchor = this.anchor();
    // Popper positions the wrapper; the content itself may still be springing.
    const wrapper = this.node.parentElement?.getBoundingClientRect();
    const { offsetWidth: width, offsetHeight: height } = this.node;
    if (!anchor || !wrapper || !width || !height) return;
    const from = anchor.getBoundingClientRect();
    const radius = radiusOf(getComputedStyle(anchor).borderTopLeftRadius, from);
    const panel = { left: wrapper.left, top: wrapper.top, width, height };
    for (const [name, value] of Object.entries(morphVariables(from, panel, radius))) {
      this.node.style.setProperty(`--liquid-menu-${name}`, value);
    }
  };
}

/** The droplet lands in its trigger with a small bulge. */
function landIn(anchor: HTMLElement | null) {
  if (!anchor || motionReduced(anchor)) return;
  anchor.animate?.(
    [
      { scale: "1" },
      { scale: "1.1 1.14", offset: 0.35 },
      { scale: ".97 .95", offset: 0.7 },
      { scale: "1" },
    ],
    { duration: 420, easing: "ease-out" },
  );
}

/** Placement that covers the trigger, unless the consumer chose their own offset or alignment. */
export function coverPlacement(
  anchor: Anchor | null,
  side: "top" | "right" | "bottom" | "left",
  chosen: { sideOffset?: number; align?: Anchor["align"] },
) {
  const across = side === "left" || side === "right";
  const cover = anchor ? -(across ? anchor.width : anchor.height) : 10;
  const align = anchor && !across ? anchor.align : "center";
  return { sideOffset: chosen.sideOffset ?? cover, align: chosen.align ?? align };
}

/**
 * State shared by one menu's trigger and content: which element opened it, and the press that
 * did. Radix opens on pointerdown, so the release lands on whatever the menu put under it.
 */
export class MenuSession {
  private press: Press | null = null;
  private trigger: HTMLElement | null = null;

  anchor() {
    return this.trigger;
  }

  /** Track presses on the trigger. `onPress` runs before Radix opens the menu. */
  attach(node: HTMLElement, onPress: () => void) {
    this.trigger = node;
    let stop = () => {};
    const track = (event: PointerEvent) => {
      const press = this.press;
      if (press?.id !== event.pointerId) return;
      if (Math.hypot(event.clientX - press.x, event.clientY - press.y) > 10) press.moved = true;
    };
    const release = (event: PointerEvent) => {
      const pressed = this.press;
      if (pressed?.id !== event.pointerId) return;
      stop();
      // Keep the guard for the click that follows a touch release, then drop it.
      setTimeout(() => {
        if (this.press === pressed) this.press = null;
      }, 600);
    };
    const down = (event: PointerEvent) => {
      if (event.button !== 0) return;
      onPress();
      this.press = { id: event.pointerId, x: event.clientX, y: event.clientY, moved: false };
      stop();
      const handlers = { pointermove: track, pointerup: release, pointercancel: release };
      stop = listen(window, handlers, { capture: true });
    };
    const key = (event: KeyboardEvent) => {
      if (!["Enter", " ", "ArrowDown"].includes(event.key)) return;
      this.press = null;
      onPress();
    };
    const unlisten = listen(node, { pointerdown: down, keydown: key });
    return () => {
      unlisten();
      stop();
      if (this.trigger === node) this.trigger = null;
    };
  }

  /**
   * Radix selects an item on pointerup even when the press began on the trigger. A menu that
   * opens over its trigger would then pick whatever landed under a still finger or cursor.
   * Pressing the trigger and dragging onto an item still selects it, as on iOS.
   */
  guard(content: HTMLElement) {
    const still = (event: MouseEvent) => {
      const press = this.press;
      if (!press || press.moved) return;
      if (event instanceof PointerEvent && event.pointerId !== press.id) return;
      event.stopPropagation();
      if (event.type !== "click") return;
      event.preventDefault();
      this.press = null;
    };
    // A fresh press inside the menu is a deliberate choice.
    const fresh = () => {
      this.press = null;
    };
    const handlers = { pointerdown: fresh, pointerup: still, click: still };
    return listen(content, handlers, { capture: true });
  }
}
