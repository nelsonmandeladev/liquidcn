"use client";

import { useState } from "react";
import { CircleUserRound, Clock, Grip } from "lucide-react";
import { TabBar, TabBarItems, TabBarSearch } from "@/components/ui/liquid/tab-bar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/liquid/tabs";

const tabs = [
  { value: "calls", label: "Calls", Icon: Clock },
  { value: "contacts", label: "Contacts", Icon: CircleUserRound },
  { value: "keypad", label: "Keypad", Icon: Grip },
];

const contacts = [
  "Ada Lovelace",
  "Alan Turing",
  "Grace Hopper",
  "Katherine Johnson",
  "Linus Torvalds",
];

export default function TabBarDemo() {
  const [tab, setTab] = useState("contacts");
  const [searching, setSearching] = useState(false);
  const [query, setQuery] = useState("");
  const current = tabs.find((item) => item.value === tab) ?? tabs[0];
  const matches = contacts.filter((name) =>
    name.toLowerCase().includes(query.trim().toLowerCase()),
  );
  const toggleSearch = (next: boolean) => {
    setSearching(next);
    if (!next) setQuery("");
  };
  return (
    <Tabs value={tab} onValueChange={setTab} className="items-center gap-6 text-center">
      <div className="grid min-h-28 place-items-center">
        {searching && (
          <div>
            <p aria-live="polite">{query ? `${matches.length} found` : "Search your contacts"}</p>
            <p className="font-normal">{query && matches.slice(0, 3).join(", ")}</p>
          </div>
        )}
        {tabs.map((item) => (
          <TabsContent
            key={item.value}
            value={item.value}
            className={searching ? "hidden" : undefined}
          >
            {item.label}
          </TabsContent>
        ))}
      </div>
      <TabBar searching={searching} onSearchingChange={toggleSearch}>
        <TabBarItems icon={<current.Icon />} label={`Back to ${current.label}`}>
          <TabsList aria-label="Phone" className="liquid-tabbar">
            {tabs.map(({ value, label, Icon }) => (
              <TabsTrigger key={value} value={value}>
                <Icon />
                {label}
              </TabsTrigger>
            ))}
          </TabsList>
        </TabBarItems>
        <TabBarSearch
          placeholder="Search contacts"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </TabBar>
    </Tabs>
  );
}
