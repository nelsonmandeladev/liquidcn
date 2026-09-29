"use client";

import { useState, type ComponentType } from "react";
import {
  ArrowRight,
  Bell,
  Bookmark,
  Check,
  ChevronDown,
  CircleUserRound,
  Clock,
  Copy,
  Download,
  Grip,
} from "lucide-react";
import { Button } from "@/components/ui/liquid/button";
import { toast } from "@/components/ui/liquid/sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/liquid/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/liquid/dropdown-menu";
import { EditingToolbar } from "@/playground/demos/toolbars";
import { copy } from "@/playground/settings";

function ToastDemo() {
  const later = () => new Promise((resolve) => setTimeout(resolve, 1500));
  return (
    <div className="toast-demo">
      <Button
        size="lg"
        onClick={() =>
          toast.success("Saved to your collection", {
            description: "A little moment, kept forever.",
          })
        }
      >
        <Bell data-icon="inline-start" />
        Show notification
      </Button>
      <div className="toast-demo-options">
        <Button
          size="sm"
          onClick={() =>
            toast.promise(later(), {
              loading: "Preparing your preview…",
              success: "Your preview is ready",
              error: "Could not prepare preview",
              description: "Liquid glass, in motion.",
            })
          }
        >
          Loading → success
        </Button>
        <Button
          size="sm"
          onClick={() =>
            toast.error("Something went wrong", {
              description: "This is a notification preview. Try again whenever you like.",
            })
          }
        >
          Error
        </Button>
      </div>
      <p>Top center. Softly in, softly out.</p>
    </div>
  );
}

function ButtonDemo() {
  const [done, setDone] = useState(false);
  const [editing, setEditing] = useState(false);
  return (
    <div className="button-demo">
      <Button size="lg" className="hero-button" onClick={() => setDone(!done)}>
        {done ? "All set" : "Continue"}
        {done ? <Check data-icon="inline-end" /> : <ArrowRight data-icon="inline-end" />}
      </Button>
      <Button
        variant={editing ? "prominent" : "default"}
        size={editing ? "icon-lg" : "lg"}
        aria-label={editing ? "Done editing" : undefined}
        onClick={() => setEditing(!editing)}
      >
        {editing ? <Check /> : "Edit"}
      </Button>
    </div>
  );
}

function TabsDemo() {
  return (
    <div className="tabs-demo">
      <Tabs defaultValue="photos" className="demo-tabs">
        <TabsList aria-label="Photo library">
          <TabsTrigger value="photos">Photos</TabsTrigger>
          <TabsTrigger value="albums">Albums</TabsTrigger>
          <TabsTrigger value="favorites">Favorites</TabsTrigger>
        </TabsList>
        <TabsContent value="photos">All your moments.</TabsContent>
        <TabsContent value="albums">A place for every adventure.</TabsContent>
        <TabsContent value="favorites">The ones worth keeping.</TabsContent>
      </Tabs>
      <Tabs defaultValue="keypad" className="demo-tabs demo-tabbar">
        <TabsContent value="calls">Recent calls</TabsContent>
        <TabsContent value="contacts">393 contacts</TabsContent>
        <TabsContent value="keypad">Keypad</TabsContent>
        <TabsList aria-label="Phone" className="liquid-tabbar">
          <TabsTrigger value="calls">
            <Clock />
            Calls
          </TabsTrigger>
          <TabsTrigger value="contacts">
            <CircleUserRound />
            Contacts
          </TabsTrigger>
          <TabsTrigger value="keypad">
            <Grip />
            Keypad
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}

function MenuDemo() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="lg">
          Options <ChevronDown data-icon="inline-end" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuGroup>
          <DropdownMenuItem onSelect={() => toast.success("Saved to collection")}>
            <Bookmark />
            Save to collection
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => copy(window.location.href)}>
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

const demos: Record<string, ComponentType> = {
  "liquid-button": ButtonDemo,
  "liquid-tabs": TabsDemo,
  "liquid-dropdown-menu": MenuDemo,
  "liquid-toolbar": EditingToolbar,
  "liquid-sonner": ToastDemo,
};

export function Demo({ id }: { id: string }) {
  const Selected = demos[id] ?? ButtonDemo;
  return <Selected />;
}
