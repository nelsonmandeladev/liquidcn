"use client";

import { useState, type CSSProperties } from "react";
import { Toaster } from "@/components/ui/liquid/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { components, type ComponentEntry } from "@/playground/catalog";
import { Footer, Header, RegistryView, Sidebar, type Page } from "@/playground/chrome";
import { Inspector } from "@/playground/inspector";
import { Preview } from "@/playground/preview";
import { sceneContrast, useSettings } from "@/playground/settings";

export function Playground() {
  const [selected, setSelected] = useState(components[0]);
  const [page, setPage] = useState<Page>("playground");
  const state = useSettings();
  const { blur, tint, theme, reduceTransparency } = state.settings;
  const material = { "--preview-blur": `${blur}px`, "--preview-tint": tint / 100 } as CSSProperties;
  const open = (entry: ComponentEntry) => {
    setSelected(entry);
    setPage("playground");
  };
  return (
    <TooltipProvider>
      <div
        className="app"
        data-liquid-theme={theme}
        data-reduced-transparency={reduceTransparency}
        style={material}
      >
        <Header page={page} onPage={setPage} />
        <div className="workspace">
          <Sidebar selected={selected} onSelect={open} />
          <main>
            {page === "registry" ? (
              <RegistryView onSelect={open} />
            ) : (
              <Preview selected={selected} contrast={sceneContrast(state.settings)} />
            )}
            <Footer />
          </main>
          <Inspector state={state} />
        </div>
        <Toaster />
      </div>
    </TooltipProvider>
  );
}
