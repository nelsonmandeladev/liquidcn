import { Grid2X2 } from "lucide-react";
import type { ComponentDoc } from "@/examples/types";
import ToolbarDemo from "./demo";
import ToolbarPhotoActions from "./photo-actions";

export const toolbarDoc: ComponentDoc = {
  item: "liquid-toolbar",
  icon: Grid2X2,
  hint: "Choose a tool. One glass lens follows the selection; press the round button beside the group and the two glasses flow together.",
  scene: "shore",
  examples: [
    { name: "demo", title: "Selection lens", component: ToolbarDemo },
    {
      name: "photo-actions",
      title: "Actions and a menu",
      description:
        "A toggle and a plain action share a group; the menu trigger stands beside it as a round button of its own. The lens sits on whichever button has `aria-pressed`.",
      component: ToolbarPhotoActions,
      scene: "sky",
    },
  ],
  usage: `import {
  Toolbar,
  ToolbarButton,
  ToolbarGroup,
  ToolbarSeparator,
} from "@/components/ui/liquid/toolbar"

<Toolbar aria-label="Photo actions">
  <ToolbarGroup>
    <ToolbarButton aria-label="Favorite" aria-pressed={favorite}>
      <Heart />
    </ToolbarButton>
    <ToolbarSeparator />
    <ToolbarButton aria-label="Add to album">
      <Plus />
    </ToolbarButton>
  </ToolbarGroup>
  <ToolbarButton aria-label="More actions">
    <Ellipsis />
  </ToolbarButton>
</Toolbar>`,
  api: [
    {
      component: "Toolbar",
      description:
        "A `div` with the toolbar role that lays out groups and round buttons. Other props go to the `div`.",
      props: [
        {
          name: "orientation",
          type: '"horizontal" | "vertical"',
          default: '"horizontal"',
          description: "Lays the toolbar out in a row or a column; arrow keys follow.",
        },
      ],
    },
    {
      component: "ToolbarGroup",
      description:
        "A capsule of glass around related buttons, with the selection lens. Props go to the `div`.",
      props: [],
    },
    {
      component: "ToolbarButton",
      description:
        "A liquid `Button`, so it takes the shadcn Button props. In a group it sits on the group's glass; directly in the toolbar it is a round glass button of its own.",
      props: [
        {
          name: "aria-pressed",
          type: "boolean",
          description: "The lens lands on the button in a group where this is true.",
        },
        {
          name: "variant",
          type: "LiquidButtonVariant",
          default: '"ghost" in a group, "default" outside',
          description: "Any liquid Button variant, e.g. `prominent` for a tinted round button.",
        },
      ],
    },
    {
      component: "ToolbarSeparator",
      description: "A line between buttons, across the toolbar's direction.",
      props: [],
    },
  ],
  motion: [
    ["Button swell", "Same as Button: up to 1.18 for a 44 px circle"],
    ["Lens", "Lifts and travels to the pressed button, like the Tabs lens"],
    [
      "Fusion",
      "A round button and the group beside it grow a glass neck while pressed, like the tab bar and its search button",
    ],
  ],
  accessibility: [
    "One tab stop for the whole toolbar. Arrow keys along its direction move between buttons and wrap, mirrored in right-to-left layouts; Home and End jump to the ends. Disabled buttons are skipped.",
    "Icon buttons need an `aria-label`. Toggles use `aria-pressed` with a label that stays the same.",
    "The lens and the glass neck are decorative and hidden from assistive technology.",
  ],
};
