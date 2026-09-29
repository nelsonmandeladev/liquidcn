"use client";

import { Bookmark, ChevronDown, Copy, Download } from "lucide-react";
import { Button } from "@/components/ui/liquid/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/liquid/dropdown-menu";
import { toast } from "@/components/ui/liquid/sonner";

async function copyLink() {
  try {
    await navigator.clipboard.writeText(window.location.href);
    toast.success("Copied to clipboard");
  } catch {
    toast.error("Could not copy the link");
  }
}

export default function DropdownMenuDemo() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="lg">
          Options <ChevronDown />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuGroup>
          <DropdownMenuItem onSelect={() => toast.success("Saved to collection")}>
            <Bookmark />
            Save to collection
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={copyLink}>
            <Copy />
            Copy link
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <a href="/assets/alpine-lake.png" download>
              <Download />
              Download photo
            </a>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
