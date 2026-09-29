"use client";

import { useId, type CSSProperties, type ReactNode } from "react";
import { RotateCcw } from "lucide-react";
import { Switch } from "radix-ui";
import { cn } from "@/lib/utils";
import { defaultMaterial, type Material } from "@/www/material";
import { setDarkTheme, setMaterial, useDarkTheme, useMaterial } from "@/www/preferences";

type RangeKey = "blur" | "tint" | "viscosity";

type RangeProps = {
  name: RangeKey;
  label: string;
  min: number;
  max: number;
  format: (value: number) => string;
  children?: ReactNode;
};

function Range({ name, label, min, max, format, children }: RangeProps) {
  const id = useId();
  const material = useMaterial();
  const value = material[name];
  return (
    <div className="control-range">
      <div className="control-row">
        <label htmlFor={id}>{label}</label>
        <output htmlFor={id}>{format(value)}</output>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        value={value}
        aria-valuetext={format(value)}
        style={{ "--fill": `${((value - min) / (max - min)) * 100}%` } as CSSProperties}
        onChange={(event) => setMaterial({ ...material, [name]: Number(event.target.value) })}
      />
      {children}
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  const id = useId();
  return (
    <div className="control-row control-switch">
      <label htmlFor={id}>{label}</label>
      <Switch.Root id={id} checked={checked} onCheckedChange={onChange} className="switch">
        <Switch.Thumb className="switch-thumb" />
      </Switch.Root>
    </div>
  );
}

/** Blur, tint, and spring feel for every glass surface on the site, plus the opt-outs. */
export function MaterialControls({ className }: { className?: string }) {
  const material = useMaterial();
  const dark = useDarkTheme();
  const toggle = (key: keyof Material) => (checked: boolean) =>
    setMaterial({ ...material, [key]: checked });
  return (
    <div className={cn("material-controls", className)}>
      <Range name="blur" label="Blur" min={0} max={40} format={(value) => `${value} px`} />
      <Range name="tint" label="Tint" min={8} max={90} format={(value) => `${value}%`} />
      <Range name="viscosity" label="Viscosity" min={0} max={100} format={(value) => `${value}%`}>
        <div className="control-scale" aria-hidden="true">
          <span>Fluid</span>
          <span>Soft</span>
        </div>
      </Range>
      <div className="control-switches">
        <Toggle label="Dark appearance" checked={dark} onChange={setDarkTheme} />
        <Toggle
          label="Reduce transparency"
          checked={material.reduceTransparency}
          onChange={toggle("reduceTransparency")}
        />
        <Toggle
          label="Reduce motion"
          checked={material.reduceMotion}
          onChange={toggle("reduceMotion")}
        />
      </div>
      <button type="button" className="control-reset" onClick={() => setMaterial(defaultMaterial)}>
        <RotateCcw aria-hidden="true" />
        Reset material
      </button>
    </div>
  );
}
