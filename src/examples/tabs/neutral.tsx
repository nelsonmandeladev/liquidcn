import type { CSSProperties } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/liquid/tabs";

// The lens tints labels with the accent by default. Point it at the ink for a neutral control.
const neutral = { "--liquid-lens-ink": "var(--liquid-ink)" } as CSSProperties;

export default function TabsNeutral() {
  return (
    <Tabs defaultValue="week" className="items-center gap-4 text-center">
      <TabsList aria-label="Calendar range" style={neutral}>
        <TabsTrigger value="day">Day</TabsTrigger>
        <TabsTrigger value="week">Week</TabsTrigger>
        <TabsTrigger value="month">Month</TabsTrigger>
        <TabsTrigger value="year">Year</TabsTrigger>
      </TabsList>
      <TabsContent value="day">Today</TabsContent>
      <TabsContent value="week">This week</TabsContent>
      <TabsContent value="month">This month</TabsContent>
      <TabsContent value="year">This year</TabsContent>
    </Tabs>
  );
}
