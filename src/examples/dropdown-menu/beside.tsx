"use client";

import { Mail, MessageCircle, Share, Users } from "lucide-react";
import { Button } from "@/components/ui/liquid/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/liquid/dropdown-menu";
import { toast } from "@/components/ui/liquid/sonner";

const targets = [
  { name: "Nearby", icon: Users },
  { name: "Messages", icon: MessageCircle },
  { name: "Mail", icon: Mail },
];

export default function DropdownMenuBeside() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="lg">
          <Share />
          Share
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent overlap={false} sideOffset={10}>
        {targets.map((target) => (
          <DropdownMenuItem key={target.name} onSelect={() => toast(`Shared with ${target.name}`)}>
            <target.icon />
            {target.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
