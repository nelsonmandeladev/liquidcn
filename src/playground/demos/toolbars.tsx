"use client";

import { useState, type ReactNode } from "react";
import {
  Crop,
  Heart,
  MoreHorizontal,
  MousePointer2,
  Plus,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";
import { toast } from "@/components/ui/liquid-sonner";
import { Toolbar, ToolbarButton, ToolbarSeparator } from "@/components/ui/liquid-toolbar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/liquid-dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { copy } from "@/playground/settings";

function Tip({ label, children }: { label: string; children: ReactNode }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

export function PhotoToolbar() {
  const [saved, setSaved] = useState(false);
  const label = saved ? "Unsave photo" : "Save photo";
  return (
    <Toolbar aria-label="Photo actions">
      <Tip label={label}>
        <ToolbarButton aria-label={label} aria-pressed={saved} onClick={() => setSaved(!saved)}>
          <Heart fill={saved ? "currentColor" : "none"} />
        </ToolbarButton>
      </Tip>
      <ToolbarSeparator />
      <Tip label="Add to collection">
        <ToolbarButton
          aria-label="Add to collection"
          onClick={() => toast.success("Added to your collection")}
        >
          <Plus />
        </ToolbarButton>
      </Tip>
      <ToolbarSeparator />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <ToolbarButton aria-label="More photo actions">
            <MoreHorizontal />
          </ToolbarButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuGroup>
            <DropdownMenuItem
              onSelect={() =>
                toast("Alpine lake", { description: "Generated Dolomite landscape / 1536 x 1024" })
              }
            >
              Photo details
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => copy(window.location.href)}>
              Copy playground link
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </Toolbar>
  );
}

const tools = [
  { id: "select", name: "Select", icon: MousePointer2 },
  { id: "crop", name: "Crop", icon: Crop },
  { id: "adjust", name: "Adjust", icon: SlidersHorizontal },
];

export function EditingToolbar() {
  const [tool, setTool] = useState("select");
  return (
    <div className="toolbar-demo">
      <Toolbar aria-label="Editing tools">
        {tools.map((item) => (
          <Tip key={item.id} label={item.name}>
            <ToolbarButton
              aria-label={item.name}
              aria-pressed={tool === item.id}
              onClick={() => setTool(item.id)}
            >
              <item.icon />
            </ToolbarButton>
          </Tip>
        ))}
        <ToolbarSeparator />
        <Tip label="Auto enhance">
          <ToolbarButton
            aria-label="Auto enhance"
            onClick={() => toast.success("Auto enhance applied")}
          >
            <Sparkles />
          </ToolbarButton>
        </Tip>
      </Toolbar>
      <p aria-live="polite">{tools.find((item) => item.id === tool)?.name} tool selected</p>
    </div>
  );
}
