import { afterEach, describe, expect, it, vi } from "vitest";
import { createRef, useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { Clock, Grip } from "lucide-react";
import { TabBar, TabBarItems, TabBarSearch } from "@/components/ui/liquid/tab-bar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/liquid/tabs";
import { frameClock } from "../frame-clock";

afterEach(() => vi.unstubAllGlobals());

type BarProps = { onKeyDown?: (event: React.KeyboardEvent) => void; reduced?: boolean };

function Phone({ onKeyDown, reduced }: BarProps) {
  return (
    <div data-reduced-motion={reduced ? "true" : undefined}>
      <Tabs defaultValue="calls">
        <TabBar>
          <TabBarItems icon={<Clock />} label="Back to Calls">
            <TabsList aria-label="Phone">
              <TabsTrigger value="calls">Calls</TabsTrigger>
              <TabsTrigger value="keypad">
                <Grip />
                Keypad
              </TabsTrigger>
            </TabsList>
          </TabBarItems>
          <TabBarSearch placeholder="Search contacts" onKeyDown={onKeyDown} />
        </TabBar>
      </Tabs>
    </div>
  );
}

const openSearch = () => fireEvent.click(screen.getByRole("button", { name: "Search" }));
const bar = () => document.querySelector<HTMLElement>(".liquid-tab-bar")!;
const part = (name: string) => document.querySelector<HTMLElement>(`.liquid-tab-bar-${name}`)!;

/** jsdom has no layout: give each part the width the CSS gives it in each state. */
function layout() {
  const sizes: Record<string, [number, number]> = {
    "liquid-tab-bar": [370, 370],
    "liquid-tab-bar-items": [300, 60],
    "liquid-tab-bar-search": [60, 300],
  };
  vi.spyOn(HTMLElement.prototype, "offsetWidth", "get").mockImplementation(function (
    this: HTMLElement,
  ) {
    if (this.style.width) return parseFloat(this.style.width);
    const size = sizes[[...this.classList].find((name) => name in sizes) ?? ""];
    return size ? size[this.closest("[data-searching]") ? 1 : 0] : 0;
  });
  vi.spyOn(HTMLElement.prototype, "offsetHeight", "get").mockReturnValue(60);
}

describe("liquid TabBar", () => {
  it("opens search from its button and moves focus into the field", () => {
    render(<Phone />);
    openSearch();
    const field = screen.getByRole("searchbox", { name: "Search" });
    expect(document.activeElement).toBe(field);
    expect(field.getAttribute("placeholder")).toBe("Search contacts");
    expect(bar().hasAttribute("data-searching")).toBe(true);
  });

  it("folds the tabs away from focus and assistive technology while searching", () => {
    render(<Phone />);
    openSearch();
    const tabs = part("tabs");
    expect(tabs.hasAttribute("inert")).toBe(true);
    expect(tabs.getAttribute("aria-hidden")).toBe("true");
    expect(screen.queryByRole("tab")).toBeNull();
    expect(screen.getByRole("button", { name: "Back to Calls" })).toBeTruthy();
  });

  it("closes on Escape and returns focus to the search button", () => {
    render(<Phone />);
    openSearch();
    fireEvent.keyDown(screen.getByRole("searchbox"), { key: "Escape" });
    expect(bar().hasAttribute("data-searching")).toBe(false);
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Search" }));
    expect(screen.getAllByRole("tab")).toHaveLength(2);
  });

  it("closes from the close button and from the circle", () => {
    render(<Phone />);
    openSearch();
    fireEvent.click(screen.getByRole("button", { name: "Close search" }));
    expect(bar().hasAttribute("data-searching")).toBe(false);
    openSearch();
    fireEvent.click(screen.getByRole("button", { name: "Back to Calls" }));
    expect(bar().hasAttribute("data-searching")).toBe(false);
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Search" }));
  });

  it("lets a consumer keep search open on Escape", () => {
    render(<Phone onKeyDown={(event) => event.preventDefault()} />);
    openSearch();
    fireEvent.keyDown(screen.getByRole("searchbox"), { key: "Escape" });
    expect(bar().hasAttribute("data-searching")).toBe(true);
  });

  it("can be controlled", () => {
    const changes: boolean[] = [];
    function Controlled() {
      const [searching, setSearching] = useState(true);
      return (
        <TabBar
          searching={searching}
          onSearchingChange={(next) => {
            changes.push(next);
            setSearching(next);
          }}
        >
          <TabBarItems>tabs</TabBarItems>
          <TabBarSearch />
        </TabBar>
      );
    }
    render(<Controlled />);
    expect(screen.getByRole("searchbox")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Close search" }));
    expect(changes).toEqual([false]);
    expect(screen.queryByRole("searchbox")).toBeNull();
  });

  it("forwards the ref and props to the input and the class name to the glass", () => {
    const ref = createRef<HTMLInputElement>();
    const onChange = vi.fn();
    render(
      <TabBar defaultSearching>
        <TabBarItems>tabs</TabBarItems>
        <TabBarSearch ref={ref} className="custom" aria-label="Find" onChange={onChange} />
      </TabBar>,
    );
    const field = screen.getByRole("searchbox", { name: "Find" });
    expect(ref.current).toBe(field);
    fireEvent.change(field, { target: { value: "ada" } });
    expect(onChange).toHaveBeenCalledOnce();
    expect(part("search").classList.contains("custom")).toBe(true);
  });

  it("springs each part from its old width to its new one", () => {
    layout();
    const time = frameClock();
    render(<Phone />);
    openSearch();
    expect(bar().dataset.liquidMorphing).toBe("");
    expect(bar().style.getPropertyValue("--liquid-tab-bar-width")).toBe("370px");
    expect(part("items").style.width).toBe("300px");
    expect(part("search").style.width).toBe("60px");
    time.step(80);
    const items = parseFloat(part("items").style.width);
    expect(items).toBeLessThan(300);
    expect(items).toBeGreaterThan(40);
    time.settle();
    expect(part("items").style.width).toBe("");
    expect(bar().dataset.liquidMorphing).toBeUndefined();
  });

  it("switches layouts at once when motion is reduced", () => {
    layout();
    frameClock();
    render(<Phone reduced />);
    openSearch();
    expect(bar().dataset.liquidMorphing).toBeUndefined();
    expect(part("items").style.width).toBe("");
  });

  it("does not press the glass while typing in the field", () => {
    const time = frameClock();
    render(<Phone />);
    openSearch();
    const field = screen.getByRole("searchbox");
    fireEvent.pointerDown(field, { button: 0, pointerId: 1 });
    fireEvent.keyDown(field, { key: " " });
    // The pointer stays down, so frames never stop coming: half a second is enough to show a press.
    for (let frame = 0; frame < 30; frame++) time.step();
    expect(Number(part("search").style.getPropertyValue("--liquid-press") || 0)).toBe(0);
  });

  it("adds one decorative neck and removes it with its state on unmount", () => {
    const { unmount } = render(<Phone />);
    const necks = bar().querySelectorAll(".liquid-fusion");
    expect(necks).toHaveLength(1);
    expect(necks[0].getAttribute("aria-hidden")).toBe("true");
    const root = bar();
    unmount();
    expect(document.querySelector(".liquid-fusion")).toBeNull();
    expect(root.style.getPropertyValue("--liquid-tab-bar-circle")).toBe("");
  });
});
