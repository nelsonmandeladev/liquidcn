import { ChevronDown } from "lucide-react";
import type { ComponentDoc } from "@/examples/types";
import DropdownMenuBeside from "./beside";
import DropdownMenuDemo from "./demo";
import DropdownMenuSort from "./sort";

export const dropdownMenuDoc: ComponentDoc = {
  item: "liquid-dropdown-menu",
  icon: ChevronDown,
  hint: "Open the menu. The button swells into a droplet, then stretches into the panel.",
  scene: "peaks",
  examples: [
    { name: "demo", title: "Grows from its trigger", component: DropdownMenuDemo },
    {
      name: "sort",
      title: "Checkable items",
      description:
        "Radio groups, checkbox items, labels, and separators are the shadcn parts, restyled for glass.",
      component: DropdownMenuSort,
      scene: "sky",
    },
    {
      name: "beside",
      title: "Beside the trigger",
      description:
        "Pass `overlap={false}` to open next to the button instead of over it. It still unfolds from the button.",
      component: DropdownMenuBeside,
      scene: "lake",
    },
  ],
  usage: `import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/liquid/dropdown-menu"

<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button>Options</Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem>Save to collection</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>`,
  api: [
    {
      component: "DropdownMenuContent",
      description:
        "Every prop of the shadcn DropdownMenuContent is forwarded. The other parts are re-exported unchanged, so imports stay the same.",
      props: [
        {
          name: "overlap",
          type: "boolean",
          default: "true",
          description: "Open over the trigger and grow out of it, as iOS does.",
        },
        {
          name: "side",
          type: '"top" | "right" | "bottom" | "left"',
          default: '"bottom"',
          description: "Which way the panel extends from the trigger.",
        },
        {
          name: "--liquid-morph-duration",
          type: "CSS time",
          default: "520ms",
          description: "Length of the unfold, set on any ancestor or the root.",
        },
      ],
    },
  ],
  motion: [
    ["Unfold", "`--liquid-morph-duration`, through a droplet at 26% and an overshoot at 62%"],
    ["Content", "Arrives magnified 1.3× and blurred 10 px, sharp by the end"],
    ["Fold", "320 ms into an elongated droplet"],
    ["Trigger bulge", "420 ms as the droplet lands"],
    ["Still press", "A press that moves less than 10 px never selects an item"],
  ],
  accessibility: [
    "Radix menu semantics and focus management: opening from the keyboard focuses the first item, Escape returns focus to the trigger.",
    "The press that opens the menu cannot select the item that appears under the finger. Press, drag, and release still selects, as on iOS.",
    "Under reduced motion the panel appears and disappears without the droplet.",
  ],
};
