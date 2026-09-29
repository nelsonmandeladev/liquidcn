import { ToggleLeft } from "lucide-react";
import type { ComponentDoc } from "@/examples/types";
import TabsDemo from "./demo";
import TabsNeutral from "./neutral";
import TabsTabBar from "./tab-bar";

export const tabsDoc: ComponentDoc = {
  item: "liquid-tabs",
  icon: ToggleLeft,
  hint: "Press and drag across the tabs. The lens lifts, magnifies what is under it, and lands.",
  scene: "lake",
  examples: [
    { name: "demo", title: "Segmented control", component: TabsDemo },
    {
      name: "tab-bar",
      title: "Tab bar",
      description: "Add `liquid-tabbar` to the list to stack icons over labels, as in iOS apps.",
      component: TabsTabBar,
      scene: "forest",
    },
    {
      name: "neutral",
      title: "Neutral lens",
      description:
        "Set `--liquid-lens-ink` to `var(--liquid-ink)` when blue labels would compete with the content.",
      component: TabsNeutral,
      scene: "shore",
    },
  ],
  usage: `import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/liquid/tabs"

<Tabs defaultValue="photos">
  <TabsList aria-label="Library">
    <TabsTrigger value="photos">Photos</TabsTrigger>
    <TabsTrigger value="albums">Albums</TabsTrigger>
  </TabsList>
  <TabsContent value="photos">Your photos</TabsContent>
  <TabsContent value="albums">Your albums</TabsContent>
</Tabs>`,
  api: [
    {
      component: "TabsList",
      description:
        "Adds the lens. Every prop of the shadcn TabsList is forwarded; `Tabs`, `TabsTrigger`, and `TabsContent` are the shadcn parts with liquid styles.",
      props: [
        {
          name: "className",
          type: "string",
          description: "Add `liquid-tabbar` for an iOS tab bar with icons over labels.",
        },
        {
          name: "--liquid-lens-ink",
          type: "CSS color",
          default: "var(--liquid-accent)",
          description: "Color of the labels under the lens.",
        },
      ],
    },
  ],
  motion: [
    ["Bar press", "The whole bar grows to 1.025"],
    ["Lens lift", "+16% along the bar, +34% across it, 12% magnification"],
    ["Lens stretch", "Along the direction of travel, up to 24% at 5200 px/s"],
    ["Scrub start", "6 px of pointer travel"],
    ["Landing", "Lift returns to 0 once within 15% of the target"],
  ],
  accessibility: [
    "Tabs semantics from the base component: `tablist`, `tab`, and `tabpanel` roles, with arrow keys, Home, and End.",
    "The lens shows an `inert`, `aria-hidden` copy of the list. Screen readers only meet the real tabs.",
    "A drag selects the tab where it is released and moves focus with it, so the roving tab stop stays in sync.",
  ],
};
