import { Music } from "lucide-react";
import { TabBar, TabBarItems, TabBarSearch } from "@/components/ui/liquid/tab-bar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/liquid/tabs";

export default function TabBarLabels() {
  return (
    <Tabs defaultValue="home" className="items-center gap-6 text-center">
      <TabsContent value="home">Made for you</TabsContent>
      <TabsContent value="new">New this week</TabsContent>
      <TabsContent value="radio">Live now</TabsContent>
      <TabBar>
        <TabBarItems icon={<Music />} label="Back to Music">
          <TabsList aria-label="Music">
            <TabsTrigger value="home">Home</TabsTrigger>
            <TabsTrigger value="new">New</TabsTrigger>
            <TabsTrigger value="radio">Radio</TabsTrigger>
          </TabsList>
        </TabBarItems>
        <TabBarSearch placeholder="Artists, songs, lyrics" />
      </TabBar>
    </Tabs>
  );
}
