import { Bell } from "lucide-react";
import type { ComponentDoc } from "@/examples/types";
import SonnerDemo from "./demo";
import SonnerTypes from "./types";

export const sonnerDoc: ComponentDoc = {
  item: "liquid-sonner",
  icon: Bell,
  hint: "Send a notification. A glass pill forms at the top of the window.",
  scene: "sky",
  examples: [
    { name: "demo", title: "Notification", component: SonnerDemo },
    {
      name: "types",
      title: "Types",
      description: "Everything Sonner can show: errors, promises, and actions.",
      component: SonnerTypes,
      scene: "forest",
    },
  ],
  usage: `import { Toaster, toast } from "@/components/ui/liquid/sonner"

// Once, near the root of your app.
<Toaster />

toast.success("Saved to your collection", {
  description: "A little moment, kept forever.",
})`,
  api: [
    {
      component: "Toaster",
      description:
        "Sonner's Toaster with liquid defaults. Every Sonner prop is forwarded, and `toast` is Sonner's own.",
      props: [
        {
          name: "position",
          type: "Position",
          default: '"top-center"',
          description: "Where the pills form. iOS places them at the top.",
        },
        {
          name: "visibleToasts",
          type: "number",
          default: "3",
          description: "How many stay visible before older ones tuck behind.",
        },
        {
          name: "closeButton",
          type: "boolean",
          default: "true",
          description: "A round close button inside each pill.",
        },
      ],
    },
  ],
  motion: [
    ["Formation", "From 0.45 × 0.7 to full size over 520 ms, corners relaxing from a pill"],
    ["Content", "Fades and sharpens in 100 ms after the pill starts forming"],
    ["Dismissal", "Shrinks to 0.55 × 0.75 in 180 ms; swipes keep Sonner's gesture"],
  ],
  accessibility: [
    "Sonner announces each toast in a polite live region, and Alt+T moves focus to the notifications.",
    "Timers pause while the pointer is over a toast or pressing it, and while the page is hidden.",
    "Every toast has a close button and can also be swiped away.",
    "Under reduced motion toasts appear at full size with no formation.",
  ],
};
