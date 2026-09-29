"use client";

import { useState, useSyncExternalStore } from "react";
import Image from "next/image";
import { Code2, Copy } from "lucide-react";
import { ToggleGroup } from "radix-ui";
import { components, examples, interactionHints, type ComponentEntry } from "@/playground/catalog";
import { Demo } from "@/playground/demos/demos";
import { PhotoToolbar } from "@/playground/demos/toolbars";
import { copy } from "@/playground/settings";

type View = "preview" | "code";
const noSubscription = () => () => {};

function Scene({ selected, contrast }: { selected: ComponentEntry; contrast: string }) {
  return (
    <div className="scene" data-liquid-contrast={contrast}>
      <Image
        src="/assets/alpine-lake.png"
        alt="Clear alpine lake below forested Dolomite mountains"
        fill
        priority
        sizes="(max-width: 800px) 100vw, 70vw"
      />
      <div className="scene-motion-label">
        <span />
        Liquid motion
      </div>
      <p className="interaction-hint">{interactionHints[selected.id]}</p>
      <div className="demo-center">
        <Demo key={selected.id} id={selected.id} />
      </div>
      {selected.id !== "liquid-toolbar" && (
        <div className="scene-toolbar">
          <PhotoToolbar />
        </div>
      )}
      <span className="scene-caption">46.4091 N / 11.5754 E</span>
    </div>
  );
}

function CodePanel({ selected }: { selected: ComponentEntry }) {
  return (
    <div className="code-panel">
      <button
        className="icon-button code-copy"
        aria-label="Copy component code"
        onClick={() => copy(examples[selected.id])}
      >
        <Copy />
      </button>
      <pre>
        <code>{examples[selected.id]}</code>
      </pre>
    </div>
  );
}

function Install({ selected }: { selected: ComponentEntry }) {
  // The install URL follows whichever deployment serves the playground.
  const origin = useSyncExternalStore(
    noSubscription,
    () => window.location.origin,
    () => "",
  );
  const command = `npx shadcn@latest add ${origin}/r/${selected.id}.json`;
  return (
    <div className="install">
      <span>Install component</span>
      <div>
        {/* Scrollable when long, so it must be reachable from the keyboard. */}
        <code tabIndex={0}>{command}</code>
        <button
          className="icon-button"
          aria-label="Copy install command"
          onClick={() => copy(command)}
        >
          <Copy />
        </button>
      </div>
    </div>
  );
}

export function Preview({ selected, contrast }: { selected: ComponentEntry; contrast: string }) {
  const [view, setView] = useState<View>("preview");
  const position = components.indexOf(selected) + 1;
  return (
    <>
      <div className="titlebar">
        <div>
          <p className="breadcrumb">Components / {selected.name}</p>
          <h1>{selected.name}</h1>
        </div>
        <span className="component-count">
          0{position} / 0{components.length}
        </span>
      </div>
      <div className="preview-bar">
        <ToggleGroup.Root
          type="single"
          value={view}
          onValueChange={(value) => value && setView(value as View)}
          aria-label="Component view"
          className="segmented"
        >
          <ToggleGroup.Item value="preview">Preview</ToggleGroup.Item>
          <ToggleGroup.Item value="code">
            <Code2 />
            Code
          </ToggleGroup.Item>
        </ToggleGroup.Root>
        <span className="preview-label">
          {view === "preview" ? "Alpine lake" : "React / TypeScript"}
        </span>
      </div>
      {view === "preview" ? (
        <Scene selected={selected} contrast={contrast} />
      ) : (
        <CodePanel selected={selected} />
      )}
      <Install selected={selected} />
    </>
  );
}
