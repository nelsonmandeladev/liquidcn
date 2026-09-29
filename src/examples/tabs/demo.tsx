import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/liquid/tabs";

export default function TabsDemo() {
  return (
    <Tabs defaultValue="photos" className="items-center gap-4 text-center">
      <TabsList aria-label="Photo library">
        <TabsTrigger value="photos">Photos</TabsTrigger>
        <TabsTrigger value="albums">Albums</TabsTrigger>
        <TabsTrigger value="favorites">Favorites</TabsTrigger>
      </TabsList>
      <TabsContent value="photos">All your moments.</TabsContent>
      <TabsContent value="albums">A place for every adventure.</TabsContent>
      <TabsContent value="favorites">The ones worth keeping.</TabsContent>
    </Tabs>
  );
}
