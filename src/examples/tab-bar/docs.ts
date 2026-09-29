import { Search } from "lucide-react";
import type { ComponentDoc } from "@/examples/types";
import TabBarDemo from "./demo";
import TabBarLabels from "./labels";

export const tabBarDoc: ComponentDoc = {
  item: "liquid-tab-bar",
  icon: Search,
  hint: "Tap search: the tabs fold into a circle as the button stretches into a field. Hold the button to see the two surfaces fuse.",
  scene: "forest",
  examples: [
    { name: "demo", title: "Search morph", component: TabBarDemo },
    {
      name: "labels",
      title: "Text tabs",
      description:
        "Any liquid `TabsList` works inside `TabBarItems`, like the iPad tab bar. Uncontrolled, the tab bar keeps its own search state.",
      component: TabBarLabels,
      scene: "sky",
    },
  ],
  usage: `import { TabBar, TabBarItems, TabBarSearch } from "@/components/ui/liquid/tab-bar"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/liquid/tabs"

<Tabs defaultValue="calls">
  <TabBar>
    <TabBarItems icon={<Clock />} label="Back to Calls">
      <TabsList aria-label="Phone" className="liquid-tabbar">
        <TabsTrigger value="calls"><Clock />Calls</TabsTrigger>
        <TabsTrigger value="contacts"><CircleUserRound />Contacts</TabsTrigger>
      </TabsList>
    </TabBarItems>
    <TabBarSearch placeholder="Search" value={query} onChange={search} />
  </TabBar>
</Tabs>`,
  api: [
    {
      component: "TabBar",
      description: "Lays out the tabs and the search button, and owns the search state.",
      props: [
        {
          name: "searching",
          type: "boolean",
          description: "Whether search is open. Leave it undefined to let the tab bar manage it.",
        },
        {
          name: "defaultSearching",
          type: "boolean",
          default: "false",
          description: "Initial state when uncontrolled.",
        },
        {
          name: "onSearchingChange",
          type: "(searching: boolean) => void",
          description: "Called when search opens or closes.",
        },
      ],
    },
    {
      component: "TabBarItems",
      description:
        "The glass around a liquid `TabsList` (or a list of links with a lens). While searching, the tabs are `inert` and a circle stands in for them.",
      props: [
        {
          name: "icon",
          type: "ReactNode",
          description: "Shown in the circle, usually the selected tab's icon.",
        },
        {
          name: "label",
          type: "string",
          default: '"Show tabs"',
          description: "Accessible name of the circle, which closes search.",
        },
      ],
    },
    {
      component: "TabBarSearch",
      description:
        "The search button that becomes the field. Props, ref, and events go to the `<input>`; `className` styles the glass.",
      props: [
        {
          name: "closeLabel",
          type: "string",
          default: '"Close search"',
          description: "Accessible name of the close button in the field.",
        },
        {
          name: "--liquid-tab-bar-width",
          type: "CSS length",
          default: "the bar's resting width",
          description: "Width of the whole bar while searching, set on `TabBar`.",
        },
      ],
    },
  ],
  motion: [
    ["Search morph", "Each part's width springs from the old layout to the new one"],
    ["Tabs out", "Fade, 6 px blur, and 0.86 scale over 220–360 ms"],
    ["Field in", "Search glass pops with a 2.4/s scale impulse; content condenses in 380 ms"],
    ["Fusion", "Metaball neck while pressed, spread up to 0.5 of the gap"],
    ["Refraction", "Rim bends the backdrop up to 60% of an 18 px bezel (Chromium)"],
  ],
  accessibility: [
    "The search button has an accessible name, and opening search moves focus to the field.",
    "Escape, the close button, or the circle closes search and returns focus to the search button.",
    "While searching, the tabs are `inert` and hidden from assistive technology, so focus cannot reach what is folded away.",
    "The neck and the refraction are decorative: `aria-hidden`, off under reduced motion, reduced transparency, increased contrast, and forced colors.",
  ],
};
