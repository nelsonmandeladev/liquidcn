"use client";

import { useCallback, useEffect, useState, type Ref } from "react";

/** A small, interruptible spring. Values stay outside React's render cycle. */
export function createLiquidSpring(initial: number[], render: (values: number[]) => void) {
  let values = [...initial];
  let target = [...initial];
  let velocity = initial.map(() => 0);
  let frame = 0;
  let previous = 0;
  let viscosity = .5;

  function tick(time: number) {
    const dt = Math.min((time - previous) / 1000, .032);
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
    render(values);
    frame = settled ? 0 : requestAnimationFrame(tick);
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
        render(values);
      } else if (!frame) {
        previous = performance.now();
        frame = requestAnimationFrame(tick);
      }
    },
    stop() { cancelAnimationFrame(frame); frame = 0; },
  };
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

/** Native listeners add decoration without replacing Radix or consumer handlers. */
export function useLiquidInteraction(node: HTMLElement | null) {
  useEffect(() => {
    if (!node) return;
    const rest = [0, 0, 1, 1, 50, 25, 0];
    let target = [...rest];
    let pressing = false;
    let hovered = false;
    const properties = ["--liquid-x", "--liquid-y", "--liquid-scale-x", "--liquid-scale-y", "--liquid-light-x", "--liquid-light-y", "--liquid-light"];
    const spring = createLiquidSpring(rest, values => {
      values.forEach((value, i) => node.style.setProperty(properties[i], `${value}${i < 2 ? "px" : i === 4 || i === 5 ? "%" : ""}`));
    });
    const disabled = () => node.matches(':disabled, [aria-disabled="true"], [data-disabled]');
    const update = () => spring.to(motionReduced(node) || disabled() ? rest : target, motionReduced(node) || disabled(), liquidViscosity(node));
    const move = (event: PointerEvent) => {
      if (event.pointerType === "touch" || disabled() || motionReduced(node)) return;
      hovered = true;
      const box = node.getBoundingClientRect();
      const x = Math.max(-1, Math.min(1, (event.clientX - box.left) / box.width * 2 - 1));
      const y = Math.max(-1, Math.min(1, (event.clientY - box.top) / box.height * 2 - 1));
      target = [x * (pressing ? 1 : 3), y * (pressing ? 1 : 2), pressing ? .96 : 1.015, pressing ? .94 : 1.025, (x + 1) * 50, (y + 1) * 50, 1];
      update();
    };
    const down = (event: PointerEvent) => {
      if (event.button !== 0 || disabled()) return;
      pressing = true;
      target = [0, 0, .96, .94, target[4], target[5], 1];
      update();
    };
    const release = () => {
      pressing = false;
      target = hovered ? [0, 0, 1.015, 1.025, target[4], target[5], 1] : [...rest];
      update();
    };
    const leave = () => { hovered = false; pressing = false; target = [...rest]; update(); };
    const keyDown = (event: KeyboardEvent) => {
      if ((event.key === " " || event.key === "Enter") && !event.repeat && !disabled()) {
        target = [0, 0, .96, .94, 50, 50, 1]; update();
      }
    };
    const keyUp = (event: KeyboardEvent) => { if (event.key === " " || event.key === "Enter") leave(); };
    const unobserve = observeMotion(node, update);
    const disabledObserver = new MutationObserver(update);
    disabledObserver.observe(node, { attributes: true, attributeFilter: ["disabled", "aria-disabled", "data-disabled"] });
    node.addEventListener("pointermove", move, { passive: true });
    node.addEventListener("pointerdown", down, { passive: true });
    node.addEventListener("pointerleave", leave);
    node.addEventListener("pointercancel", leave);
    node.addEventListener("keydown", keyDown);
    node.addEventListener("keyup", keyUp);
    node.addEventListener("blur", leave);
    window.addEventListener("pointerup", release);
    window.addEventListener("blur", leave);
    return () => {
      spring.stop(); unobserve(); disabledObserver.disconnect();
      node.removeEventListener("pointermove", move);
      node.removeEventListener("pointerdown", down);
      node.removeEventListener("pointerleave", leave);
      node.removeEventListener("pointercancel", leave);
      node.removeEventListener("keydown", keyDown);
      node.removeEventListener("keyup", keyUp);
      node.removeEventListener("blur", leave);
      window.removeEventListener("pointerup", release);
      window.removeEventListener("blur", leave);
      properties.forEach(property => node.style.removeProperty(property));
    };
  }, [node]);
}

/** One continuous lens, retargeted from its current position on rapid selection. */
export function useLiquidIndicator(node: HTMLElement | null, selector: string) {
  useEffect(() => {
    if (!node) return;
    let initialized = false;
    let last: HTMLElement | null = null;
    let previousX = 0;
    let previousY = 0;
    let snapping = false;
    let reduced = motionReduced(node);
    let geometry: number[] | null = null;
    const spring = createLiquidSpring([0, 0, 0, 0], ([x, y, width, height]) => {
      node.style.setProperty("--liquid-indicator-x", `${x}px`);
      node.style.setProperty("--liquid-indicator-y", `${y}px`);
      node.style.setProperty("--liquid-indicator-width", `${Math.max(0, width)}px`);
      node.style.setProperty("--liquid-indicator-height", `${Math.max(0, height)}px`);
      const stretchX = initialized && !reduced && !snapping ? Math.min(.18, Math.abs(x - previousX) * .012) : 0;
      const stretchY = initialized && !reduced && !snapping ? Math.min(.18, Math.abs(y - previousY) * .012) : 0;
      node.style.setProperty("--liquid-indicator-scale-x", String(1 + stretchX - stretchY * .2));
      node.style.setProperty("--liquid-indicator-scale-y", String(1 + stretchY - stretchX * .2));
      previousX = x; previousY = y;
    });
    const measure = () => {
      const selected = node.querySelector<HTMLElement>(selector);
      if (!selected) { node.removeAttribute("data-liquid-indicator"); initialized = false; return; }
      reduced = motionReduced(node);
      const next = [selected.offsetLeft, selected.offsetTop, selected.offsetWidth, selected.offsetHeight];
      if (initialized && !reduced && last === selected && geometry?.every((value, i) => value === next[i])) return;
      const immediate = !initialized || last === selected || reduced;
      last = selected;
      geometry = next;
      node.dataset.liquidIndicator = "true";
      // offset geometry is independent of animated transforms and works in RTL/vertical lists.
      snapping = immediate;
      spring.to(next, immediate, liquidViscosity(node));
      snapping = false;
      initialized = true;
    };
    const resize = new ResizeObserver(measure);
    const observeSizes = () => { resize.disconnect(); resize.observe(node); node.querySelectorAll<HTMLElement>(".liquid-tab, .liquid-toolbar-button").forEach(child => resize.observe(child)); };
    const mutations = new MutationObserver(records => {
      if (records.some(record => record.type === "childList")) observeSizes();
      measure();
    });
    mutations.observe(node, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ["data-state", "aria-pressed", "data-orientation", "dir"] });
    const unobserve = observeMotion(node, measure);
    observeSizes(); measure();
    return () => {
      spring.stop(); resize.disconnect(); mutations.disconnect(); unobserve();
      node.removeAttribute("data-liquid-indicator");
      ["x", "y", "width", "height", "scale-x", "scale-y"].forEach(key => node.style.removeProperty(`--liquid-indicator-${key}`));
    };
  }, [node, selector]);
}
