"use client";

import { useLayoutEffect, useRef } from "react";
import { BarFusion } from "@/lib/liquid/bar";
import { createLiquidSpring, liquidViscosity, motionReduced } from "@/lib/liquid/motion";
import { LiquidPress } from "@/lib/liquid/press";

/**
 * The search morph. Entering search collapses the tab bar into a circle and stretches the
 * search button into a field; leaving reverses it. CSS lays out both states. This springs the
 * width of each part from where it was to where the new layout puts it, so any layout works.
 */
export class TabBarMorph {
  private readonly items: HTMLElement | null;
  private readonly search: HTMLElement | null;
  private readonly press: LiquidPress | null = null;
  private readonly fusion: BarFusion | null = null;
  private readonly spring;
  private readonly sizes = new ResizeObserver(() => this.measure());
  private resting = [0, 0];
  private target = [0, 0];
  private morphing = false;

  constructor(private readonly root: HTMLElement) {
    this.items = root.querySelector<HTMLElement>(":scope > .liquid-tab-bar-items");
    this.search = root.querySelector<HTMLElement>(":scope > .liquid-tab-bar-search");
    this.spring = createLiquidSpring([0, 0], (values) => this.render(values));
    if (this.search) this.press = new LiquidPress(this.search);
    if (this.items && this.search)
      this.fusion = new BarFusion(root, this.items, this.search, () => this.morphing);
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
    this.root.style.removeProperty("--liquid-tab-bar-circle");
    this.root.style.removeProperty("--liquid-tab-bar-width");
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
