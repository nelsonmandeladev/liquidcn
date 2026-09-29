"use client";

import { useLayoutEffect, useRef } from "react";
import { FusionLoop, LiquidFusion } from "@/lib/liquid/fusion";
import { createLiquidSpring, listen, liquidViscosity, motionReduced } from "@/lib/liquid/motion";
import { LiquidPress } from "@/lib/liquid/press";

const numberOf = (element: HTMLElement | null, property: string) =>
  parseFloat(element?.style.getPropertyValue(property) ?? "") || 0;

/**
 * How strongly the tab bar and its search button fuse: pressing the button swells it into the
 * bar, and lifting the lens on the bar swells the bar into the button.
 */
export function fusionStrength(searchPress: number, barLift: number) {
  return Math.max(0, Math.min(1, Math.max(searchPress * 0.5, barLift * 0.32)));
}

/**
 * The search morph. Entering search collapses the tab bar into a circle and stretches the
 * search button into a field; leaving reverses it. CSS lays out both states. This springs the
 * width of each part from where it was to where the new layout puts it, so any layout works.
 */
export class TabBarMorph {
  private readonly items: HTMLElement | null;
  private readonly search: HTMLElement | null;
  private readonly press: LiquidPress | null = null;
  private readonly fusion: FusionLoop | null = null;
  private readonly spring;
  private readonly sizes = new ResizeObserver(() => this.measure());
  private readonly cleanups: (() => void)[] = [];
  private resting = [0, 0];
  private target = [0, 0];
  private morphing = false;

  constructor(private readonly root: HTMLElement) {
    this.items = root.querySelector<HTMLElement>(":scope > .liquid-tab-bar-items");
    this.search = root.querySelector<HTMLElement>(":scope > .liquid-tab-bar-search");
    this.spring = createLiquidSpring([0, 0], (values) => this.render(values));
    if (this.search) this.press = new LiquidPress(this.search);
    if (this.items && this.search) this.fusion = this.fuse(this.items, this.search);
    for (const element of [root, this.items, this.search]) if (element) this.sizes.observe(element);
    this.measure();
  }

  /** Call once the DOM shows the new state, before paint. */
  toggle() {
    const { items, search, root } = this;
    if (!items || !search) return;
    const from = this.morphing ? [items.offsetWidth, search.offsetWidth] : this.resting;
    this.settle();
    const to = [items.offsetWidth, search.offsetWidth];
    this.resting = to;
    if (motionReduced(root) || from.every((width, i) => Math.abs(width - to[i]) < 1)) return;
    this.morphing = true;
    this.target = to;
    root.dataset.liquidMorphing = "";
    this.spring.to(from, true);
    this.spring.to(to, false, liquidViscosity(root));
    this.press?.pop();
  }

  destroy() {
    this.settle();
    this.sizes.disconnect();
    this.press?.destroy();
    this.fusion?.destroy();
    this.cleanups.forEach((cleanup) => cleanup());
    this.root.style.removeProperty("--liquid-tab-bar-circle");
    this.root.style.removeProperty("--liquid-tab-bar-width");
  }

  private fuse(items: HTMLElement, search: HTMLElement) {
    const fusion = new LiquidFusion(items, search, this.root);
    const strength = () => {
      if (motionReduced(this.root) || this.morphing) return 0;
      const list = items.querySelector<HTMLElement>("[data-liquid-indicator]");
      return fusionStrength(numberOf(search, "--liquid-press"), numberOf(list, "--liquid-lift"));
    };
    // Repaint before each press, so the neck follows theme and material changes.
    const paint = () => fusion.paint(items);
    this.cleanups.push(listen(this.root, { pointerdown: paint }, { capture: true }));
    return new FusionLoop(fusion, () => ({ strength: strength() })).wakeOn(items, search);
  }

  // Remember the resting layout, so the next toggle knows where the morph starts.
  private measure() {
    const { root, items, search } = this;
    if (!items || !search) return;
    // Hidden tabs (say, on a phone) leave the circle size to CSS.
    const circle = items.offsetHeight;
    if (circle) root.style.setProperty("--liquid-tab-bar-circle", `${circle}px`);
    else root.style.removeProperty("--liquid-tab-bar-circle");
    if (this.morphing) return;
    this.resting = [items.offsetWidth, search.offsetWidth];
    if (!root.hasAttribute("data-searching"))
      root.style.setProperty("--liquid-tab-bar-width", `${root.offsetWidth}px`);
  }

  private render([items, search]: number[]) {
    if (!this.morphing || !this.items || !this.search) return;
    this.items.style.width = `${items}px`;
    this.search.style.width = `${search}px`;
    if (items === this.target[0] && search === this.target[1]) this.settle();
  }

  private settle() {
    this.spring.stop();
    this.morphing = false;
    this.items?.style.removeProperty("width");
    this.search?.style.removeProperty("width");
    delete this.root.dataset.liquidMorphing;
  }
}

/** Attach the search morph, fusion, and search button press to a tab bar. */
export function useTabBarMorph(node: HTMLElement | null, searching: boolean) {
  const morph = useRef<TabBarMorph | null>(null);
  useLayoutEffect(() => {
    if (!node) return;
    const instance = new TabBarMorph(node);
    morph.current = instance;
    return () => {
      instance.destroy();
      morph.current = null;
    };
  }, [node]);
  useLayoutEffect(() => {
    morph.current?.toggle();
  }, [searching]);
}
