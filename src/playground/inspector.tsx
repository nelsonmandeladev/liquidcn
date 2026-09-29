"use client";

import type { ReactNode } from "react";
import { RotateCcw, SlidersHorizontal, Sparkles } from "lucide-react";
import { Switch, ToggleGroup } from "radix-ui";
import type { Settings, SettingsState } from "@/playground/settings";

type Range = { id: keyof Settings; label: string; unit: string; min: number; max: number };

function Slider({
  id,
  label,
  unit,
  min,
  max,
  state,
  children,
}: Range & { state: SettingsState; children?: ReactNode }) {
  const value = state.settings[id] as number;
  return (
    <div className="setting">
      <label htmlFor={id}>
        {label}{" "}
        <output>
          {value}
          {unit}
        </output>
      </label>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(event) => state.update(id, Number(event.target.value))}
      />
      {children}
    </div>
  );
}

function Toggle({
  id,
  label,
  state,
}: { id: "reduceTransparency" | "reduceMotion" } & {
  label: string;
  state: SettingsState;
}) {
  return (
    <div className="switch-setting">
      <label htmlFor={id}>{label}</label>
      <Switch.Root
        id={id}
        checked={state.settings[id]}
        onCheckedChange={(checked) => state.update(id, checked)}
        className="switch"
      >
        <Switch.Thumb />
      </Switch.Root>
    </div>
  );
}

function Title({ children, icon }: { children: ReactNode; icon: ReactNode }) {
  return (
    <div className="inspector-title">
      <h2>{children}</h2>
      {icon}
    </div>
  );
}

export function Inspector({ state }: { state: SettingsState }) {
  return (
    <aside className="inspector">
      <Title icon={<SlidersHorizontal />}>Material</Title>
      <Slider id="blur" label="Blur" unit=" px" min={0} max={40} state={state} />
      <Slider id="tint" label="Tint" unit="%" min={8} max={90} state={state} />
      <div className="setting">
        <span>Appearance</span>
        <ToggleGroup.Root
          type="single"
          value={state.settings.theme}
          onValueChange={(value) => value && state.update("theme", value as Settings["theme"])}
          aria-label="Glass appearance"
          className="segmented"
        >
          <ToggleGroup.Item value="light">Light</ToggleGroup.Item>
          <ToggleGroup.Item value="dark">Dark</ToggleGroup.Item>
        </ToggleGroup.Root>
      </div>
      <Toggle id="reduceTransparency" label="Reduce transparency" state={state} />
      <div className="motion-settings">
        <Title icon={<Sparkles />}>Motion</Title>
        <Slider id="viscosity" label="Viscosity" unit="%" min={0} max={100} state={state}>
          <div className="range-labels">
            <span>Fluid</span>
            <span>Soft</span>
          </div>
        </Slider>
        <Toggle id="reduceMotion" label="Reduce motion" state={state} />
        <p className="motion-note">
          Spring response, surface stretch, and a little give. System motion preferences are always
          respected.
        </p>
      </div>
      <button className="reset" onClick={state.reset}>
        <RotateCcw />
        Reset playground
      </button>
      <div className="material-note">
        <span className="status-dot" />
        Spring + CSS material<span>Experimental / 0.2</span>
      </div>
    </aside>
  );
}
