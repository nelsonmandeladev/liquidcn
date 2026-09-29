import { Grid2X2 } from "lucide-react";
import type { ComponentDoc } from "@/examples/types";
import ToolbarDemo from "./demo";
import ToolbarPhotoActions from "./photo-actions";

export const toolbarDoc: ComponentDoc = {
  item: "liquid-toolbar",
  icon: Grid2X2,
  hint: "Choose a tool. One glass lens follows the selection, and every button swells when pressed.",
  scene: "shore",
  examples: [
    { name: "demo", title: "Selection lens", component: ToolbarDemo },
    {
      name: "photo-actions",
      title: "Actions and a menu",
      description:
        "A toggle, a plain action, and a menu trigger. The lens sits on whichever button has `aria-pressed`.",
      component: ToolbarPhotoActions,
      scene: "sky",
    },
  ],
  usage: `import { Toolbar, ToolbarButton, ToolbarSeparator } from "@/components/ui/liquid/toolbar"

<Toolbar aria-label="Photo actions">
  <ToolbarButton aria-label="Favorite" aria-pressed={favorite}>
    <Heart />
  </ToolbarButton>
  <ToolbarSeparator />
  <ToolbarButton aria-label="Add to album">
    <Plus />
  </ToolbarButton>
</Toolbar>`,
  api: [
    {
      component: "Toolbar",
      description: "The Radix Toolbar root, with the glass and the lens. All props are forwarded.",
      props: [
        {
          name: "orientation",
          type: '"horizontal" | "vertical"',
          default: '"horizontal"',
          description: "Lays the buttons out in a row or a column; arrow keys follow.",
        },
      ],
    },
    {
      component: "ToolbarButton",
      description: "A Radix Toolbar button that swells when pressed.",
      props: [
        {
          name: "aria-pressed",
          type: "boolean",
          description: "The lens lands on the button where this is true.",
        },
      ],
    },
  ],
  motion: [
    ["Button swell", "Same as Button: up to 1.18 for a 44 px circle"],
    ["Lens", "Lifts and travels to the pressed button, like the Tabs lens"],
  ],
  accessibility: [
    "Radix Toolbar semantics: one tab stop, arrow keys between buttons.",
    "Icon buttons need an `aria-label`. Toggles use `aria-pressed` with a label that stays the same.",
    "The lens is decorative and hidden from assistive technology.",
  ],
};
