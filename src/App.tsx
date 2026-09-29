"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { ArrowRight, Check, ChevronDown, Code2, Copy, Heart, Layers2, MoreHorizontal, Plus, RectangleHorizontal, RotateCcw, SlidersHorizontal, ToggleLeft, Grid2X2, Download, Bookmark, Bell, MousePointer2, Crop, Sparkles } from "lucide-react";
import { ToggleGroup, Switch } from "radix-ui";
import { Toaster, toast } from "@/components/ui/liquid-sonner";
import { Button } from "@/components/ui/liquid-button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/liquid-tabs";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem } from "@/components/ui/liquid-dropdown-menu";
import { Toolbar, ToolbarButton, ToolbarSeparator } from "@/components/ui/liquid-toolbar";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const components = [
  { id: "liquid-button", name: "Button", icon: RectangleHorizontal },
  { id: "liquid-tabs", name: "Segmented control", icon: ToggleLeft },
  { id: "liquid-dropdown-menu", name: "Dropdown menu", icon: ChevronDown },
  { id: "liquid-toolbar", name: "Toolbar", icon: Grid2X2 },
  { id: "liquid-sonner", name: "Toast notification", icon: Bell },
];
const examples: Record<string, string> = {
  "liquid-sonner": 'import { Toaster, toast } from "@/components/ui/liquid-sonner";\n\n// Mount once in your app. Defaults to top center.\n<Toaster />\n\ntoast.success("Saved to your collection", {\n  description: "A little moment, kept forever.",\n});',
  "liquid-button": 'import { Button } from "@/components/ui/liquid-button";\n\n<Button onClick={() => console.log("Continue")} size="lg">\n  Continue\n</Button>',
  "liquid-tabs": 'import { Tabs, TabsList, TabsTrigger, TabsContent }\n  from "@/components/ui/liquid-tabs";\n\n<Tabs defaultValue="photos">\n  <TabsList aria-label="Library">\n    <TabsTrigger value="photos">Photos</TabsTrigger>\n    <TabsTrigger value="albums">Albums</TabsTrigger>\n  </TabsList>\n  <TabsContent value="photos">Your photos</TabsContent>\n  <TabsContent value="albums">Your albums</TabsContent>\n</Tabs>',
  "liquid-dropdown-menu": 'import { DropdownMenu, DropdownMenuTrigger,\n  DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem\n} from "@/components/ui/liquid-dropdown-menu";\n\n<DropdownMenu>\n  <DropdownMenuTrigger>Options</DropdownMenuTrigger>\n  <DropdownMenuContent>\n    <DropdownMenuGroup>\n      <DropdownMenuItem>Save to collection</DropdownMenuItem>\n    </DropdownMenuGroup>\n  </DropdownMenuContent>\n</DropdownMenu>',
  "liquid-toolbar": 'import { Toolbar, ToolbarButton, ToolbarSeparator }\n  from "@/components/ui/liquid-toolbar";\n\n<Toolbar aria-label="Photo actions">\n  <ToolbarButton aria-label="Save">Save</ToolbarButton>\n  <ToolbarSeparator />\n  <ToolbarButton aria-label="Add">Add</ToolbarButton>\n</Toolbar>',
};
async function copy(text: string) { try { await navigator.clipboard.writeText(text); toast.success("Copied to clipboard"); } catch { toast.error("Clipboard unavailable. Select and copy the text."); } }

function PhotoToolbar() {
  const [saved, setSaved] = useState(false);
  return <Toolbar aria-label="Photo actions">
    <Tooltip><TooltipTrigger asChild><ToolbarButton aria-label={saved ? "Unsave photo" : "Save photo"} aria-pressed={saved} onClick={() => setSaved(!saved)}><Heart fill={saved ? "currentColor" : "none"} /></ToolbarButton></TooltipTrigger><TooltipContent>{saved ? "Unsave photo" : "Save photo"}</TooltipContent></Tooltip>
    <ToolbarSeparator />
    <Tooltip><TooltipTrigger asChild><ToolbarButton aria-label="Add to collection" onClick={() => toast.success("Added to your collection")}><Plus /></ToolbarButton></TooltipTrigger><TooltipContent>Add to collection</TooltipContent></Tooltip>
    <ToolbarSeparator />
    <DropdownMenu><DropdownMenuTrigger asChild><ToolbarButton aria-label="More photo actions"><MoreHorizontal /></ToolbarButton></DropdownMenuTrigger><DropdownMenuContent><DropdownMenuGroup><DropdownMenuItem onSelect={() => toast("Alpine lake", { description: "Generated Dolomite landscape / 1536 x 1024" })}>Photo details</DropdownMenuItem><DropdownMenuItem onSelect={() => copy(window.location.href)}>Copy playground link</DropdownMenuItem></DropdownMenuGroup></DropdownMenuContent></DropdownMenu>
  </Toolbar>;
}

function EditingToolbar() {
  const [tool, setTool] = useState("select");
  const tools = [{ id: "select", name: "Select", icon: MousePointer2 }, { id: "crop", name: "Crop", icon: Crop }, { id: "adjust", name: "Adjust", icon: SlidersHorizontal }];
  return <div className="toolbar-demo"><Toolbar aria-label="Editing tools">{tools.map(item => <Tooltip key={item.id}><TooltipTrigger asChild><ToolbarButton aria-label={item.name} aria-pressed={tool === item.id} onClick={() => setTool(item.id)}><item.icon /></ToolbarButton></TooltipTrigger><TooltipContent>{item.name}</TooltipContent></Tooltip>)}<ToolbarSeparator /><Tooltip><TooltipTrigger asChild><ToolbarButton aria-label="Auto enhance" onClick={() => toast.success("Auto enhance applied")}><Sparkles /></ToolbarButton></TooltipTrigger><TooltipContent>Auto enhance</TooltipContent></Tooltip></Toolbar><p aria-live="polite">{tools.find(item => item.id === tool)?.name} tool selected</p></div>;
}

const interactionHints: Record<string, string> = {
  "liquid-sonner": "Send a notification. A glass pill forms at the top.",
  "liquid-button": "Move across the glass. Press, then release.",
  "liquid-tabs": "Switch tabs and watch the lens stretch into place.",
  "liquid-dropdown-menu": "Open the menu. The glass unfolds from its trigger.",
  "liquid-toolbar": "Choose a tool. One glass lens follows your selection.",
};

function ToastDemo() {
  return <div className="toast-demo"><Button size="lg" onClick={() => toast.success("Saved to your collection", { description: "A little moment, kept forever." })}><Bell data-icon="inline-start" />Show notification</Button><div className="toast-demo-options"><Button size="sm" onClick={() => toast.promise(new Promise(resolve => setTimeout(resolve, 1500)), { loading: "Preparing your preview…", success: "Your preview is ready", error: "Could not prepare preview", description: "Liquid glass, in motion." })}>Loading → success</Button><Button size="sm" onClick={() => toast.error("Something went wrong", { description: "This is a notification preview. Try again whenever you like." })}>Error</Button></div><p>Top center. Softly in, softly out.</p></div>;
}

function Demo({ id }: { id: string }) {
  const [done, setDone] = useState(false);
  if (id === "liquid-sonner") return <ToastDemo />;
  if (id === "liquid-tabs") return <Tabs defaultValue="photos" className="demo-tabs"><TabsList aria-label="Photo library"><TabsTrigger value="photos">Photos</TabsTrigger><TabsTrigger value="albums">Albums</TabsTrigger><TabsTrigger value="favorites">Favorites</TabsTrigger></TabsList><TabsContent value="photos">All your moments.</TabsContent><TabsContent value="albums">A place for every adventure.</TabsContent><TabsContent value="favorites">The ones worth keeping.</TabsContent></Tabs>;
  if (id === "liquid-dropdown-menu") return <DropdownMenu><DropdownMenuTrigger asChild><Button size="lg">Options <ChevronDown data-icon="inline-end" /></Button></DropdownMenuTrigger><DropdownMenuContent><DropdownMenuGroup><DropdownMenuItem onSelect={() => toast.success("Saved to collection")}><Bookmark />Save to collection</DropdownMenuItem><DropdownMenuItem onSelect={() => copy(window.location.href)}><Copy />Copy link</DropdownMenuItem><DropdownMenuItem asChild><a href="/assets/alpine-lake.png" download><Download />Download photo</a></DropdownMenuItem></DropdownMenuGroup></DropdownMenuContent></DropdownMenu>;
  if (id === "liquid-toolbar") return <EditingToolbar />;
  return <Button size="lg" className="hero-button" data-complete={done} onClick={() => setDone(!done)}>{done ? "All set" : "Continue"}{done ? <Check data-icon="inline-end" /> : <ArrowRight data-icon="inline-end" />}</Button>;
}

export default function App() {
  const [selected, setSelected] = useState(components[0]);
  const [page, setPage] = useState("playground");
  const [view, setView] = useState("preview");
  const [blur, setBlur] = useState(20);
  const [tint, setTint] = useState(22);
  const [theme, setTheme] = useState("light");
  const [reduce, setReduce] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [viscosity, setViscosity] = useState(35);
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.liquidTheme = theme;
    root.dataset.reducedTransparency = String(reduce);
    root.dataset.reducedMotion = String(reduceMotion);
    root.style.setProperty("--liquid-viscosity", String(viscosity / 100));
    root.style.setProperty("--liquid-morph-duration", `${380 + viscosity * 4}ms`);
    root.style.setProperty("--preview-blur", `${blur}px`);
    root.style.setProperty("--preview-tint", String(tint / 100));
    return () => {
      delete root.dataset.liquidTheme;
      delete root.dataset.reducedTransparency;
      delete root.dataset.reducedMotion;
      root.style.removeProperty("--liquid-viscosity");
      root.style.removeProperty("--liquid-morph-duration");
      root.style.removeProperty("--preview-blur");
      root.style.removeProperty("--preview-tint");
    };
  }, [blur, tint, theme, reduce, reduceMotion, viscosity]);
  const [origin, setOrigin] = useState("");
  useEffect(() => { setOrigin(window.location.origin); }, []);
  const command = `npx shadcn@latest add ${origin}/r/${selected.id}.json`;
  const material = { "--preview-blur": `${blur}px`, "--preview-tint": tint / 100 } as CSSProperties;
  // Blur changes detail, not brightness. At this opacity even a black backdrop
  // becomes light enough for dark ink; dark material always keeps light ink.
  const sceneContrast = theme === "light" && (reduce || tint >= 55) ? "dark" : "light";
  return <TooltipProvider><div className="app" data-liquid-theme={theme} data-reduced-transparency={reduce} style={material}>
    <header className="header"><a className="brand" href="/" aria-label="liquidcn home"><Layers2 />liquidcn<span> / </span></a><nav aria-label="Main"><button className={cn(page === "playground" && "active")} onClick={() => setPage("playground")}>Playground</button><button className={cn(page === "registry" && "active")} onClick={() => setPage("registry")}>Registry</button></nav><span className="version">v0.2 / Preview</span></header>
    <div className="workspace"><aside className="sidebar"><p className="rail-label">Components</p><nav aria-label="Components">{components.map(item => <button key={item.id} className={cn(selected.id === item.id && "selected")} onClick={() => { setSelected(item); setPage("playground"); }}><item.icon /><span>{item.name}</span></button>)}</nav><div className="sidebar-bottom"><span className="status-dot" />{components.length} components<span>Radix UI</span></div></aside>
    <main>{page === "registry" ? <section className="registry"><p className="breadcrumb">liquidcn / Registry</p><h1>Registry</h1><div className="registry-list">{components.map(item => <button key={item.id} onClick={() => { setSelected(item); setPage("playground"); }}><item.icon /><span>{item.name}<small>{item.id}</small></span><ArrowRight /></button>)}</div><a className="catalog-link" href="/r/registry.json" target="_blank" rel="noreferrer">Open registry manifest <Code2 /></a></section> : <><div className="titlebar"><div><p className="breadcrumb">Components / {selected.name}</p><h1>{selected.name}</h1></div><span className="component-count">0{components.indexOf(selected) + 1} / 0{components.length}</span></div>
    <div className="preview-bar"><ToggleGroup.Root type="single" value={view} onValueChange={v => v && setView(v)} aria-label="Component view" className="segmented"><ToggleGroup.Item value="preview">Preview</ToggleGroup.Item><ToggleGroup.Item value="code"><Code2 />Code</ToggleGroup.Item></ToggleGroup.Root><span className="preview-label">{view === "preview" ? "Alpine lake" : "React / TypeScript"}</span></div>
    {view === "preview" ? <div className="scene" data-liquid-contrast={sceneContrast}><img src="/assets/alpine-lake.png" alt="Clear alpine lake below forested Dolomite mountains" /><div className="scene-motion-label"><span />Liquid motion</div><p className="interaction-hint">{interactionHints[selected.id]}</p><div className="demo-center"><Demo key={selected.id} id={selected.id} /></div>{selected.id !== "liquid-toolbar" && <div className="scene-toolbar"><PhotoToolbar /></div>}<span className="scene-caption">46.4091 N / 11.5754 E</span></div> : <div className="code-panel"><button className="icon-button code-copy" aria-label="Copy component code" onClick={() => copy(examples[selected.id])}><Copy /></button><pre><code>{examples[selected.id]}</code></pre></div>}
    <div className="install"><span>Install component</span><div><code>{command}</code><button className="icon-button" aria-label="Copy install command" onClick={() => copy(command)}><Copy /></button></div></div></>}
    <footer><span>Made of light. Built on shadcn.</span><a href="https://ui.shadcn.com/docs/registry" target="_blank" rel="noreferrer">Registry documentation <ArrowRight /></a></footer></main>
    <aside className="inspector"><div className="inspector-title"><h2>Material</h2><SlidersHorizontal /></div><div className="setting"><label htmlFor="blur">Blur <output>{blur} px</output></label><input id="blur" type="range" min="0" max="40" value={blur} onChange={e => setBlur(+e.target.value)} /></div><div className="setting"><label htmlFor="tint">Tint <output>{tint}%</output></label><input id="tint" type="range" min="8" max="90" value={tint} onChange={e => setTint(+e.target.value)} /></div><div className="setting"><span>Appearance</span><ToggleGroup.Root type="single" value={theme} onValueChange={v => v && setTheme(v)} aria-label="Glass appearance" className="segmented"><ToggleGroup.Item value="light">Light</ToggleGroup.Item><ToggleGroup.Item value="dark">Dark</ToggleGroup.Item></ToggleGroup.Root></div><div className="switch-setting"><label htmlFor="transparency">Reduce transparency</label><Switch.Root id="transparency" checked={reduce} onCheckedChange={setReduce} className="switch"><Switch.Thumb /></Switch.Root></div><div className="motion-settings"><div className="inspector-title"><h2>Motion</h2><Sparkles /></div><div className="setting"><label htmlFor="viscosity">Viscosity <output>{viscosity}%</output></label><input id="viscosity" type="range" min="0" max="100" value={viscosity} onChange={e => setViscosity(+e.target.value)} /><div className="range-labels"><span>Fluid</span><span>Soft</span></div></div><div className="switch-setting"><label htmlFor="motion">Reduce motion</label><Switch.Root id="motion" checked={reduceMotion} onCheckedChange={setReduceMotion} className="switch"><Switch.Thumb /></Switch.Root></div><p className="motion-note">Spring response, surface stretch, and a little give. System motion preferences are always respected.</p></div><button className="reset" onClick={() => { setBlur(20); setTint(22); setTheme("light"); setReduce(false); setReduceMotion(false); setViscosity(35); }}><RotateCcw />Reset playground</button><div className="material-note"><span className="status-dot" />Spring + CSS material<span>Experimental / 0.2</span></div></aside></div><Toaster /></div></TooltipProvider>;
}

