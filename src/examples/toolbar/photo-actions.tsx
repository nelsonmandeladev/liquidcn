"use client";

import { useState } from "react";
import { Ellipsis, Heart, Plus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/liquid/dropdown-menu";
import { toast } from "@/components/ui/liquid/sonner";
import {
  Toolbar,
  ToolbarButton,
  ToolbarGroup,
  ToolbarSeparator,
} from "@/components/ui/liquid/toolbar";

export default function ToolbarPhotoActions() {
  const [favorite, setFavorite] = useState(false);
  return (
    <Toolbar aria-label="Photo actions">
      <ToolbarGroup>
        <ToolbarButton
          aria-label="Favorite"
          aria-pressed={favorite}
          onClick={() => setFavorite(!favorite)}
        >
          <Heart fill={favorite ? "currentColor" : "none"} />
        </ToolbarButton>
        <ToolbarSeparator />
        <ToolbarButton
          aria-label="Add to album"
          onClick={() => toast.success("Added to your album")}
        >
          <Plus />
        </ToolbarButton>
      </ToolbarGroup>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <ToolbarButton aria-label="More actions">
            <Ellipsis />
          </ToolbarButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem
            onSelect={() => toast("Alpine lake", { description: "1536 × 1024, Dolomites" })}
          >
            Photo details
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => toast.success("Hidden from your library")}>
            Hide
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </Toolbar>
  );
}
