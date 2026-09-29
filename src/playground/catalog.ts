import {
  Bell,
  ChevronDown,
  Grid2X2,
  RectangleHorizontal,
  ToggleLeft,
  type LucideIcon,
} from "lucide-react";

export type ComponentEntry = { id: string; name: string; icon: LucideIcon };

export const components: ComponentEntry[] = [
  { id: "liquid-button", name: "Button", icon: RectangleHorizontal },
  { id: "liquid-tabs", name: "Segmented control", icon: ToggleLeft },
  { id: "liquid-dropdown-menu", name: "Dropdown menu", icon: ChevronDown },
  { id: "liquid-toolbar", name: "Toolbar", icon: Grid2X2 },
  { id: "liquid-sonner", name: "Toast notification", icon: Bell },
];

export const interactionHints: Record<string, string> = {
  "liquid-sonner": "Send a notification. A glass pill forms at the top.",
  "liquid-button": "Press and hold. The glass swells toward you. Tap Edit to morph it.",
  "liquid-tabs": "Press and drag across the tab bar. The lens lifts, magnifies, and lands.",
  "liquid-dropdown-menu": "Open the menu. The button swells into a droplet, then a panel.",
  "liquid-toolbar": "Choose a tool. One glass lens follows your selection.",
};

export const examples: Record<string, string> = {
  "liquid-sonner": `import { Toaster, toast } from "@/components/ui/liquid-sonner";

// Mount once in your app. Defaults to top center.
<Toaster />

toast.success("Saved to your collection", {
  description: "A little moment, kept forever.",
});`,
  "liquid-button": `import { Button } from "@/components/ui/liquid-button";

<Button onClick={() => console.log("Continue")} size="lg">
  Continue
</Button>

// Accent-tinted glass. Content and width changes morph.
<Button variant="prominent" size="icon-lg" aria-label="Done">
  <Check />
</Button>`,
  "liquid-tabs": `import { Tabs, TabsList, TabsTrigger, TabsContent }
  from "@/components/ui/liquid-tabs";

<Tabs defaultValue="photos">
  <TabsList aria-label="Library">
    <TabsTrigger value="photos">Photos</TabsTrigger>
    <TabsTrigger value="albums">Albums</TabsTrigger>
  </TabsList>
  <TabsContent value="photos">Your photos</TabsContent>
  <TabsContent value="albums">Your albums</TabsContent>
</Tabs>`,
  "liquid-dropdown-menu": `import { DropdownMenu, DropdownMenuTrigger,
  DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem
} from "@/components/ui/liquid-dropdown-menu";

<DropdownMenu>
  <DropdownMenuTrigger>Options</DropdownMenuTrigger>
  {/* Grows out of and over its trigger. overlap={false} opens beside it. */}
  <DropdownMenuContent>
    <DropdownMenuGroup>
      <DropdownMenuItem>Save to collection</DropdownMenuItem>
    </DropdownMenuGroup>
  </DropdownMenuContent>
</DropdownMenu>`,
  "liquid-toolbar": `import { Toolbar, ToolbarButton, ToolbarSeparator }
  from "@/components/ui/liquid-toolbar";

<Toolbar aria-label="Photo actions">
  <ToolbarButton aria-label="Save">Save</ToolbarButton>
  <ToolbarSeparator />
  <ToolbarButton aria-label="Add">Add</ToolbarButton>
</Toolbar>`,
};
