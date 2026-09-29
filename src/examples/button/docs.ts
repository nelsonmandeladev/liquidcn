import { RectangleHorizontal } from "lucide-react";
import type { ComponentDoc } from "@/examples/types";
import ButtonDemo from "./demo";
import ButtonIcons from "./icons";
import ButtonVariants from "./variants";

export const buttonDoc: ComponentDoc = {
  item: "liquid-button",
  icon: RectangleHorizontal,
  hint: "Press and hold: the glass swells toward you. Tap Edit to morph it into a check.",
  scene: "lake",
  examples: [
    { name: "demo", title: "Content morph", component: ButtonDemo },
    {
      name: "variants",
      title: "Variants",
      description:
        "Every shadcn variant, plus `prominent`: accent-tinted glass for the primary action.",
      component: ButtonVariants,
      scene: "peaks",
    },
    {
      name: "icons",
      title: "Icons",
      description: "Icon sizes are 44 px circles, the minimum touch target on iOS.",
      component: ButtonIcons,
      scene: "shore",
    },
  ],
  usage: `import { Button } from "@/components/ui/liquid/button"

<Button onClick={save}>Save</Button>
<Button variant="prominent" size="icon-lg" aria-label="Done">
  <Check />
</Button>`,
  api: [
    {
      component: "Button",
      description: "Every prop of the shadcn Button is forwarded, including refs and `asChild`.",
      props: [
        {
          name: "variant",
          type: '"default" | "prominent" | "secondary" | "outline" | "ghost" | "destructive" | "link"',
          default: '"default"',
          description: "`prominent` is tinted with `--liquid-accent`, like iOS `.glassProminent`.",
        },
        {
          name: "size",
          type: '"default" | "xs" | "sm" | "lg" | "icon" | "icon-xs" | "icon-sm" | "icon-lg"',
          default: '"default"',
          description: "Text sizes keep a 44 px minimum height; icon sizes are 44 px circles.",
        },
        {
          name: "asChild",
          type: "boolean",
          default: "false",
          description: "Render the child element, such as a link, with the button's glass.",
        },
      ],
    },
  ],
  motion: [
    ["Press swell", "1 + clamp(8 / √(width × height), 0.04, 0.18)"],
    ["Press drag", "Rubber band, up to 10 px across and 7 px down"],
    ["Content pop", "Scale impulse of 2.4/s on the press spring"],
    ["Content morph", "Width springs to the new size; new content blurs in over 420 ms"],
  ],
  accessibility: [
    "Renders a native `button` (or your element with `asChild`), so focus, Enter, and Space work as usual.",
    "Icon-only buttons need an `aria-label`. When content morphs, update the label with it.",
    "Under reduced motion the swell, stretch, and morph are removed; the button still changes instantly.",
  ],
};
