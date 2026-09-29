import { CircleUserRound, Clock, Grip } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/liquid/tabs";

export default function TabsTabBar() {
  return (
    <Tabs defaultValue="keypad" className="items-center gap-4 text-center">
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
  );
}
