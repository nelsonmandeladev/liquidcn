"use client";

import { useState } from "react";
import { Crop, MousePointer2, SlidersHorizontal, Sparkles } from "lucide-react";
import { toast } from "@/components/ui/liquid/sonner";
import { Toolbar, ToolbarButton, ToolbarGroup } from "@/components/ui/liquid/toolbar";

const tools = [
  { id: "select", name: "Select", icon: MousePointer2 },
  { id: "crop", name: "Crop", icon: Crop },
  { id: "adjust", name: "Adjust", icon: SlidersHorizontal },
];

export default function ToolbarDemo() {
  const [tool, setTool] = useState("select");
  return (
    <div className="flex flex-col items-center gap-5 text-center">
      <Toolbar aria-label="Editing tools">
        <ToolbarGroup>
          {tools.map((item) => (
            <ToolbarButton
              key={item.id}
              aria-label={item.name}
              aria-pressed={tool === item.id}
              onClick={() => setTool(item.id)}
            >
              <item.icon />
            </ToolbarButton>
          ))}
        </ToolbarGroup>
        <ToolbarButton
          aria-label="Auto enhance"
          onClick={() => toast.success("Auto enhance applied")}
        >
          <Sparkles />
        </ToolbarButton>
      </Toolbar>
      <p aria-live="polite">{tools.find((item) => item.id === tool)?.name} tool selected</p>
    </div>
  );
}
