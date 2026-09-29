"use client";

import { useCallback, useEffect, useState, type Ref } from "react";

/** A small, interruptible spring. Values stay outside React's render cycle. */
export function createLiquidSpring(initial: number[], render: (values: number[], velocity: number[]) => void) {
  let values = [...initial];
  let target = [...initial];
  const velocity = initial.map(() => 0);
  let frame = 0;
  let previous = 0;
  let viscosity = .5;
  const atRest = () => values.every((value, i) => value === target[i]) && velocity.every(speed => speed === 0);
  const start = () => {
    if (frame) return;
    previous = performance.now();
    frame = requestAnimationFrame(tick);
  };

  function tick(time: number) {
    // A frame's timestamp can precede the input event that scheduled it. Integrating a
    // negative step would run the spring backwards; a small step still answers the touch.
    const dt = time > previous ? Math.min((time - previous) / 1000, .032) : 1 / 120;
    previous = time;
    const steps = Math.max(1, Math.ceil(dt * 240));
    const h = dt / steps;
    const stiffness = 440 - viscosity * 180;
    const damping = 23 + viscosity * 15;
    for (let step = 0; step < steps; step++) {
      values.forEach((value, i) => {
        velocity[i] += (stiffness * (target[i] - value) - damping * velocity[i]) * h;
        values[i] += velocity[i] * h;
      });
    }
    const settled = values.every((value, i) => Math.abs(target[i] - value) < .001 && Math.abs(velocity[i]) < .01);
    if (settled) { values = [...target]; velocity.fill(0); }
    frame = 0;
    render(values, velocity);
    // render may retarget the spring, e.g. when a travelling lens lands.
    if (!atRest()) start();
  }

  return {
    to(next: number[], immediate = false, feel = .5) {
      target = [...next];
      viscosity = Math.max(0, Math.min(1, feel));
      if (immediate) {
        cancelAnimationFrame(frame);
        frame = 0;
        values = [...target];
        velocity.fill(0);
        render(values, velocity);
      } else if (!atRest()) start();
    },
    /** Add velocity without moving the target, for a pop or a nudge. */
    kick(impulse: number[]) {
      impulse.forEach((speed, i) => { velocity[i] += speed; });
      start();
    },
    stop() { cancelAnimationFrame(frame); frame = 0; },
  };
}

/** iOS-style rubber band: follows the finger at first, then resists. */
export function rubberBand(distance: number, limit: number) {
  return Math.sign(distance) * limit * (1 - 1 / (Math.abs(distance) * .55 / limit + 1));
}

export function motionReduced(node: HTMLElement) {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
    !!node.closest('[data-reduced-motion="true"]');
}

export function liquidViscosity(node: HTMLElement) {
  const value = parseFloat(getComputedStyle(node).getPropertyValue("--liquid-viscosity"));
  return Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : .5;
}

// Listen to OS preferences and explicit opt-outs, including ancestors of portals.
export function observeMotion(node: HTMLElement, update: () => void) {
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  media.addEventListener("change", update);
  const observer = new MutationObserver(update);
  for (let ancestor: HTMLElement | null = node; ancestor; ancestor = ancestor.parentElement) {
    observer.observe(ancestor, { attributes: true, attributeFilter: ["data-reduced-motion"] });
  }
  return () => { media.removeEventListener("change", update); observer.disconnect(); };
}

/** Compose forwarded refs, including React 19 ref cleanups. */
export function useLiquidElement<T extends HTMLElement>(forwardedRef?: Ref<T>) {
  const [node, setNode] = useState<T | null>(null);
  const ref = useCallback((element: T | null) => {
    setNode(element);
    const cleanup = typeof forwardedRef === "function" ? forwardedRef(element) : undefined;
    if (forwardedRef && typeof forwardedRef !== "function") forwardedRef.current = element;
    return () => {
      if (typeof cleanup === "function") cleanup();
      else if (typeof forwardedRef === "function") forwardedRef(null);
      else if (forwardedRef) forwardedRef.current = null;
    };
  }, [forwardedRef]);
  return [node, ref] as const;
}

/**
 * Native listeners add decoration without replacing Radix or consumer handlers.
 * Pressing swells the glass toward the finger; dragging stretches it on a rubber band.
 * Content changes pop the surface and spring its width to the new size.
 */
export function useLiquidInteraction(node: HTMLElement | null) {
  useEffect(() => {
    if (!node) return;
    // offset x/y, scale x/y, light x/y, light, press
    const rest = [0, 0, 1, 1, 50, 25, 0, 0];
    const properties = ["--liquid-x", "--liquid-y", "--liquid-scale-x", "--liquid-scale-y", "--liquid-light-x", "--liquid-light-y", "--liquid-light", "--liquid-press"];
    const units = ["px", "px", "", "", "%", "%", "", ""];
    let hover: number[] | null = null;
    let light = [50, 25];
    let press: { id: number; x: number; y: number } | null = null;
    let drag = [0, 0];
    let keyboard = false;
    const spring = createLiquidSpring(rest, values => {
      values.forEach((value, i) => node.style.setProperty(properties[i], `${value}${units[i]}`));
    });
    const disabled = () => node.matches(':disabled, [aria-disabled="true"], [data-disabled]');
    const target = () => {
      if (press || keyboard) {
        const width = node.offsetWidth || 1;
        const height = node.offsetHeight || 1;
        // Small controls grow more than large ones, as on iOS.
        const swell = 1 + Math.max(.04, Math.min(.18, 8 / Math.sqrt(width * height)));
        const dx = rubberBand(drag[0], 10);
        const dy = rubberBand(drag[1], 7);
        const sx = Math.abs(dx) / width;
        const sy = Math.abs(dy) / height;
        return [dx, dy, swell * (1 + sx * .6 - sy * .25), swell * (1 + sy * .6 - sx * .25), ...light, 1, 1];
      }
      if (hover) return [hover[0] * 2, hover[1] * 1.5, 1.012, 1.018, ...light, 1, 0];
      return [0, 0, 1, 1, ...light, 0, 0];
    };
    const update = () => {
      const still = motionReduced(node) || disabled();
      spring.to(still ? rest : target(), still, liquidViscosity(node));
    };
    const hoverMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      const box = node.getBoundingClientRect();
      hover = [
        Math.max(-1, Math.min(1, (event.clientX - box.left) / box.width * 2 - 1)),
        Math.max(-1, Math.min(1, (event.clientY - box.top) / box.height * 2 - 1)),
      ];
      light = [(hover[0] + 1) * 50, (hover[1] + 1) * 50];
      if (!press) update();
    };
    const track = (event: PointerEvent) => {
      if (!press || event.pointerId !== press.id) return;
      drag = [event.clientX - press.x, event.clientY - press.y];
      update();
    };
    const release = (event?: Event) => {
      if (event instanceof PointerEvent && press && event.pointerId !== press.id) return;
      press = null;
      drag = [0, 0];
      window.removeEventListener("pointermove", track);
      window.removeEventListener("pointerup", release);
      window.removeEventListener("pointercancel", release);
      update();
    };
    const down = (event: PointerEvent) => {
      if (event.button !== 0 || disabled()) return;
      press = { id: event.pointerId, x: event.clientX, y: event.clientY };
      drag = [0, 0];
      window.addEventListener("pointermove", track);
      window.addEventListener("pointerup", release);
      window.addEventListener("pointercancel", release);
      update();
    };
    const leave = () => { hover = null; if (!press) update(); };
    const keyDown = (event: KeyboardEvent) => {
      if ((event.key === " " || event.key === "Enter") && !event.repeat && !disabled()) {
        keyboard = true; light = [50, 50]; update();
      }
    };
    const keyUp = (event: KeyboardEvent) => { if (event.key === " " || event.key === "Enter") { keyboard = false; update(); } };
    const reset = () => { keyboard = false; hover = null; release(); };

    // Content morph: spring the width from the old size and let the new content condense in.
    let width = node.offsetWidth;
    let morphing = false;
    let flip = false;
    const sizer = createLiquidSpring([width], ([value]) => {
      if (!morphing) return;
      node.style.width = `${value}px`;
      if (value === width) { morphing = false; node.style.removeProperty("width"); delete node.dataset.liquidMorphing; }
    });
    const content = new MutationObserver(() => {
      const from = morphing ? node.offsetWidth : width;
      if (morphing) { sizer.stop(); morphing = false; node.style.removeProperty("width"); }
      // A consumer-owned inline width wins.
      if (node.style.width) return;
      width = node.offsetWidth;
      if (motionReduced(node) || disabled()) return;
      flip = !flip;
      node.dataset.liquidMorph = flip ? "a" : "b";
      spring.kick([0, 0, 2.4, 2.4, 0, 0, 0, 0]);
      if (Math.abs(width - from) < 1) return;
      morphing = true;
      node.dataset.liquidMorphing = "";
      sizer.to([from], true);
      sizer.to([width], false, liquidViscosity(node));
    });
    content.observe(node, { childList: true, characterData: true, subtree: true, attributes: true, attributeFilter: ["data-liquid-variant", "aria-pressed"] });
    const sizes = new ResizeObserver(() => { if (!morphing) width = node.offsetWidth; });
    sizes.observe(node);

    const unobserve = observeMotion(node, update);
    const disabledObserver = new MutationObserver(update);
    disabledObserver.observe(node, { attributes: true, attributeFilter: ["disabled", "aria-disabled", "data-disabled"] });
    node.addEventListener("pointermove", hoverMove, { passive: true });
    node.addEventListener("pointerdown", down, { passive: true });
    node.addEventListener("pointerleave", leave);
    node.addEventListener("keydown", keyDown);
    node.addEventListener("keyup", keyUp);
    node.addEventListener("blur", reset);
    window.addEventListener("blur", reset);
    return () => {
      spring.stop(); sizer.stop(); unobserve(); disabledObserver.disconnect(); content.disconnect(); sizes.disconnect();
      node.removeEventListener("pointermove", hoverMove);
      node.removeEventListener("pointerdown", down);
      node.removeEventListener("pointerleave", leave);
      node.removeEventListener("keydown", keyDown);
      node.removeEventListener("keyup", keyUp);
      node.removeEventListener("blur", reset);
      window.removeEventListener("blur", reset);
      window.removeEventListener("pointermove", track);
      window.removeEventListener("pointerup", release);
      window.removeEventListener("pointercancel", release);
      properties.forEach(property => node.style.removeProperty(property));
      if (morphing) node.style.removeProperty("width");
      delete node.dataset.liquidMorph;
      delete node.dataset.liquidMorphing;
    };
  }, [node]);
}

type LensOptions = {
  /** Matches the selected item, e.g. `.liquid-tab[data-state="active"]`. */
  selected: string;
  /** Matches every item the lens can land on. */
  items: string;
  /** Let a press drag the lens across items and select where it is released. */
  scrub?: boolean;
};

const inactive = ':disabled, [data-disabled], [aria-disabled="true"]';

/**
 * One continuous glass lens. It lifts while pressed or travelling, magnifies and tints
 * what is beneath it, then lands and frosts over the selection. The lens is a decorative,
 * inert copy of the list; the real items stay untouched for Radix and assistive technology.
 */
export function useLiquidIndicator(node: HTMLElement | null, { selected, items, scrub = false }: LensOptions) {
  useEffect(() => {
    if (!node) return;
    const lens = document.createElement("span");
    const optics = document.createElement("span");
    lens.className = "liquid-lens";
    lens.setAttribute("aria-hidden", "true");
    lens.inert = true;
    lens.append(optics);
    node.append(lens);

    let elements: HTMLElement[] = [];
    let boxes = new Map<HTMLElement, number[]>();
    const masked = new Set<HTMLElement>();
    let current: HTMLElement | null = null;
    let goal = [0, 0, 0, 0];
    let follow: number[] | null = null;
    let press: { id: number; x: number; y: number; dragging: boolean } | null = null;
    let travelling = false;
    let initialized = false;
    let reduced = motionReduced(node);
    let vertical = false;
    let border = [0, 0];

    const boxOf = (element: HTMLElement) => {
      let x = 0, y = 0;
      for (let at: HTMLElement | null = element; at && at !== node;) {
        x += at.offsetLeft; y += at.offsetTop;
        const parent = at.offsetParent as HTMLElement | null;
        if (!parent || !node.contains(parent)) break;
        if (parent !== node) { x += parent.clientLeft; y += parent.clientTop; }
        at = parent;
      }
      return [x, y, element.offsetWidth, element.offsetHeight];
    };
    const unmask = () => {
      masked.forEach(element => { element.style.removeProperty("mask-image"); element.style.removeProperty("-webkit-mask-image"); });
      masked.clear();
    };
    // Hide the real items where the lens sits so only the magnified copy shows through it.
    const mask = ([left, top, width, height]: number[]) => {
      for (const element of elements) {
        const [x, y, w, h] = boxes.get(element) ?? [0, 0, 0, 0];
        const start = vertical ? top - y : left - x;
        const end = start + (vertical ? height : width);
        if (end <= 0 || start >= (vertical ? h : w)) {
          if (masked.delete(element)) { element.style.removeProperty("mask-image"); element.style.removeProperty("-webkit-mask-image"); }
          continue;
        }
        const soft = Math.min(8, (end - start) / 4);
        const image = `linear-gradient(${vertical ? 180 : 90}deg, #000 ${start}px, transparent ${start + soft}px, transparent ${end - soft}px, #000 ${end}px)`;
        element.style.setProperty("mask-image", image);
        element.style.setProperty("-webkit-mask-image", image);
        masked.add(element);
      }
    };

    const spring = createLiquidSpring([0, 0, 0, 0, 0], ([x, y, w, h, lift], velocity) => {
      if (travelling && !press && Math.hypot(x - goal[0], y - goal[1]) < Math.max(6, (vertical ? goal[3] : goal[2]) * .15)) {
        travelling = false;
        commit();
      }
      const lifted = Math.max(0, lift);
      const stretch = reduced ? 0 : Math.min(.24, Math.abs(velocity[vertical ? 1 : 0]) / 5200);
      const along = (1 + .16 * lifted) * (1 + stretch);
      const across = (1 + .34 * lifted) * (1 - stretch * .3);
      const width = w * (vertical ? across : along);
      const height = h * (vertical ? along : across);
      const cx = x + w / 2, cy = y + h / 2;
      const left = cx - width / 2, top = cy - height / 2;
      lens.style.width = `${width}px`;
      lens.style.height = `${height}px`;
      lens.style.transform = `translate(${left}px, ${top}px)`;
      optics.style.transformOrigin = `${cx + border[0]}px ${cy + border[1]}px`;
      optics.style.transform = `translate(${-left - border[0]}px, ${-top - border[1]}px) scale(${1 + .12 * lifted})`;
      node.style.setProperty("--liquid-lift", lifted.toFixed(3));
      const resting = !press && !travelling && lifted < .005 && [x, y, w, h].every((value, i) => Math.abs(value - goal[i]) < .5);
      node.dataset.liquidLens = resting ? "rest" : "active";
      if (resting) unmask(); else mask([left, top, width, height]);
    });

    function commit(immediate = false) {
      const lifted = !reduced && (press !== null || travelling) ? 1 : 0;
      spring.to([...(follow ?? goal), lifted], immediate || reduced, liquidViscosity(node!));
    }

    const refresh = () => {
      elements = [...node.querySelectorAll<HTMLElement>(items)].filter(element => !lens.contains(element));
      optics.className = `${node.className} liquid-lens-optics`;
      for (const name of ["dir", "data-orientation", "data-variant"]) {
        const value = node.getAttribute(name);
        if (value === null) optics.removeAttribute(name); else optics.setAttribute(name, value);
      }
      optics.replaceChildren(...[...node.children].filter(child => child !== lens).map(child => {
        const copy = child.cloneNode(true) as HTMLElement;
        for (const element of [copy, ...copy.querySelectorAll<HTMLElement>("*")]) {
          element.removeAttribute("id");
          element.style?.removeProperty("mask-image");
          element.style?.removeProperty("-webkit-mask-image");
        }
        return copy;
      }));
    };

    const measure = () => {
      reduced = motionReduced(node);
      vertical = (node.getAttribute("aria-orientation") ?? node.getAttribute("data-orientation")) === "vertical";
      border = [node.clientLeft, node.clientTop];
      boxes = new Map(elements.map(element => [element, boxOf(element)]));
      optics.style.width = `${node.offsetWidth}px`;
      optics.style.height = `${node.offsetHeight}px`;
      const next = elements.find(element => element.matches(selected)) ?? null;
      if (!next) {
        current = null; initialized = false; travelling = false;
        delete node.dataset.liquidIndicator;
        delete node.dataset.liquidLens;
        unmask();
        return;
      }
      const geometry = boxes.get(next)!;
      const moved = initialized && next !== current;
      const resized = geometry.some((value, i) => value !== goal[i]);
      if (initialized && !moved && !resized) return;
      goal = geometry;
      current = next;
      node.dataset.liquidIndicator = "true";
      if (!initialized || reduced) { travelling = false; commit(true); }
      else if (moved) { travelling = true; commit(); }
      else commit(!press);
      initialized = true;
    };

    const local = (event: PointerEvent) => {
      const bounds = node.getBoundingClientRect();
      const sx = bounds.width / (node.offsetWidth || 1);
      const sy = bounds.height / (node.offsetHeight || 1);
      return [(event.clientX - bounds.left) / sx - border[0], (event.clientY - bounds.top) / sy - border[1]];
    };
    const enabled = () => elements.filter(element => !element.matches(inactive));
    const nearest = (position: number) => {
      let best: HTMLElement | null = null;
      let distance = Infinity;
      for (const element of enabled()) {
        const [x, y, w, h] = boxes.get(element)!;
        const gap = Math.abs((vertical ? y + h / 2 : x + w / 2) - position);
        if (gap < distance) { distance = gap; best = element; }
      }
      return best;
    };
    const activate = (element: HTMLElement) => {
      // Radix tabs select on mousedown; focus keeps the roving tab stop in sync.
      element.dispatchEvent(new MouseEvent("mousedown", { bubbles: true, cancelable: true, button: 0, view: window }));
      if (node.contains(document.activeElement)) element.focus({ preventScroll: true });
    };

    const move = (event: PointerEvent) => {
      if (!scrub || !press || event.pointerId !== press.id) return;
      if (!press.dragging && Math.hypot(event.clientX - press.x, event.clientY - press.y) < 6) return;
      press.dragging = true;
      const position = local(event)[vertical ? 1 : 0];
      const under = nearest(position);
      if (!under) return;
      const [x, y, w, h] = boxes.get(under)!;
      const size = vertical ? h : w;
      const spans = enabled().map(element => boxes.get(element)!);
      const min = Math.min(...spans.map(box => vertical ? box[1] : box[0]));
      const max = Math.max(...spans.map(box => vertical ? box[1] + box[3] : box[0] + box[2])) - size;
      let start = position - size / 2;
      if (start < min) start = min - rubberBand(min - start, 14);
      else if (start > max) start = max + rubberBand(start - max, 14);
      follow = vertical ? [x, start, w, h] : [start, y, w, h];
      commit();
    };
    const end = () => {
      press = null;
      follow = null;
      delete node.dataset.liquidPressed;
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
    const up = (event: PointerEvent) => {
      if (!press || event.pointerId !== press.id) return;
      const landing = press.dragging && follow && event.type === "pointerup"
        ? nearest(vertical ? follow[1] + follow[3] / 2 : follow[0] + follow[2] / 2)
        : null;
      end();
      if (landing && landing !== current) activate(landing);
      commit();
    };
    const down = (event: PointerEvent) => {
      if (event.button !== 0 || reduced || !current) return;
      const item = event.target instanceof Element ? event.target.closest<HTMLElement>(items) : null;
      if (!item || !elements.includes(item) || item.matches(inactive)) return;
      press = { id: event.pointerId, x: event.clientX, y: event.clientY, dragging: false };
      node.dataset.liquidPressed = "true";
      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", up);
      window.addEventListener("pointercancel", up);
      commit();
    };

    const resize = new ResizeObserver(measure);
    const observeSizes = () => { resize.disconnect(); resize.observe(node); elements.forEach(element => resize.observe(element)); };
    const mutations = new MutationObserver(records => {
      const relevant = records.filter(record => !lens.contains(record.target));
      if (!relevant.length) return;
      refresh();
      if (relevant.some(record => record.type === "childList")) observeSizes();
      measure();
    });
    mutations.observe(node, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ["data-state", "aria-pressed", "data-orientation", "aria-orientation", "dir", "class", "disabled", "data-disabled"] });
    const unobserve = observeMotion(node, () => { reduced = motionReduced(node); if (initialized) commit(true); });
    node.addEventListener("pointerdown", down, { passive: true });
    refresh(); observeSizes(); measure();
    return () => {
      spring.stop(); resize.disconnect(); mutations.disconnect(); unobserve(); end(); unmask();
      node.removeEventListener("pointerdown", down);
      lens.remove();
      delete node.dataset.liquidIndicator;
      delete node.dataset.liquidLens;
      node.style.removeProperty("--liquid-lift");
    };
  }, [node, selected, items, scrub]);
}
