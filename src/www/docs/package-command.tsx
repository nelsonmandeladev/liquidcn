"use client";

import { useSyncExternalStore } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/liquid/tabs";
import { site } from "@/site";
import { CopyButton } from "@/www/copy-button";

const managers = ["pnpm", "npm", "yarn", "bun"] as const;
type Manager = (typeof managers)[number];

const runners: Record<Manager, string> = {
  pnpm: "pnpm dlx",
  npm: "npx",
  yarn: "yarn dlx",
  bun: "bunx --bun",
};

const storageKey = "liquidcn:package-manager";
const listeners = new Set<() => void>();
let chosen: Manager | null = null;

function stored(): Manager {
  try {
    const value = localStorage.getItem(storageKey);
    return managers.find((manager) => manager === value) ?? "pnpm";
  } catch {
    return "pnpm";
  }
}

function choose(manager: Manager) {
  chosen = manager;
  try {
    localStorage.setItem(storageKey, manager);
  } catch {
    // Remembered until reload.
  }
  listeners.forEach((listener) => listener());
}

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

/** The chosen package manager, shared by every command on every page. */
function usePackageManager() {
  return useSyncExternalStore(
    subscribe,
    () => (chosen ??= stored()),
    () => "pnpm" as Manager,
  );
}

const noSubscription = () => () => {};

/** Commands point at whichever deployment serves the page, so previews install from themselves. */
function useOrigin() {
  return useSyncExternalStore(
    noSubscription,
    () => window.location.origin,
    () => site.url,
  );
}

/** A package-runner command with a tab per manager. `{origin}` becomes this site's origin. */
export function PackageCommand({ args }: { args: string }) {
  const manager = usePackageManager();
  const resolved = args.replaceAll("{origin}", useOrigin());
  return (
    <Tabs value={manager} onValueChange={(value) => choose(value as Manager)} className="command">
      <div className="command-bar">
        <TabsList aria-label="Package manager" className="segmented segmented-small">
          {managers.map((name) => (
            <TabsTrigger key={name} value={name}>
              {name}
            </TabsTrigger>
          ))}
        </TabsList>
        <CopyButton value={`${runners[manager]} ${resolved}`} label="Copy command" />
      </div>
      {managers.map((name) => (
        <TabsContent key={name} value={name} className="command-body">
          <pre tabIndex={0}>
            <code>
              <span className="command-runner">{runners[name]}</span> {resolved}
            </code>
          </pre>
        </TabsContent>
      ))}
    </Tabs>
  );
}
