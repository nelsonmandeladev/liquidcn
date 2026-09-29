import { describe, expect, it, vi } from "vitest";
import { act, createRef } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import {
  Toolbar,
  ToolbarButton,
  ToolbarGroup,
  ToolbarSeparator,
} from "@/components/ui/liquid/toolbar";

type ToolsProps = {
  pressed?: string;
  disabled?: string;
  orientation?: "horizontal" | "vertical";
  dir?: "ltr" | "rtl";
  round?: boolean;
};

function Tools({ pressed, disabled, orientation, dir, round = true }: ToolsProps) {
  return (
    <div dir={dir}>
      <Toolbar aria-label="Tools" orientation={orientation}>
        <ToolbarGroup>
          {["Select", "Crop"].map((name) => (
            <ToolbarButton
              key={name}
              aria-label={name}
              aria-pressed={pressed === name}
              disabled={disabled === name}
            >
              {name[0]}
            </ToolbarButton>
          ))}
          <ToolbarSeparator />
          <ToolbarButton aria-label="Adjust">A</ToolbarButton>
        </ToolbarGroup>
        {round && <ToolbarButton aria-label="Enhance">E</ToolbarButton>}
      </Toolbar>
    </div>
  );
}

const button = (name: string) => screen.getByRole("button", { name });
const group = () => document.querySelector<HTMLElement>(".liquid-toolbar-group")!;
const press = (key: string) => fireEvent.keyDown(document.activeElement!, { key });
const focusOn = (name: string) => act(() => button(name).focus());
const focused = () => document.activeElement?.getAttribute("aria-label");

describe("liquid Toolbar", () => {
  it("extends the base Button: ghost on the group's glass, glass of its own beside it", () => {
    render(<Tools />);
    const toolbar = screen.getByRole("toolbar", { name: "Tools" });
    expect(toolbar.getAttribute("aria-orientation")).toBe("horizontal");
    for (const name of ["Select", "Crop", "Adjust", "Enhance"]) {
      expect(button(name).dataset.slot).toBe("button");
      expect(button(name).classList).toContain("liquid-button");
    }
    expect(button("Select").dataset.liquidVariant).toBe("ghost");
    expect(button("Enhance").dataset.liquidVariant).toBe("default");
  });

  it("shows the group's lens only while one button is pressed", async () => {
    const { rerender } = render(<Tools />);
    expect(group().dataset.liquidIndicator).toBeUndefined();
    rerender(<Tools pressed="Crop" />);
    await waitFor(() => expect(group().dataset.liquidIndicator).toBe("true"));
    rerender(<Tools />);
    await waitFor(() => expect(group().dataset.liquidIndicator).toBeUndefined());
  });

  it("keeps the lens copy out of the accessibility tree", () => {
    render(<Tools pressed="Select" />);
    expect(screen.getAllByRole("button")).toHaveLength(4);
    expect(screen.getAllByRole("separator")).toHaveLength(1);
    expect(button("Select").getAttribute("aria-pressed")).toBe("true");
  });

  it("has one tab stop, which follows focus", () => {
    render(<Tools />);
    const stops = () => screen.getAllByRole("button").filter((item) => item.tabIndex === 0);
    expect(stops()).toEqual([button("Select")]);
    focusOn("Enhance");
    expect(stops()).toEqual([button("Enhance")]);
  });

  it("moves between buttons with arrow keys, Home, and End, wrapping at the ends", () => {
    render(<Tools />);
    focusOn("Select");
    const keys = ["ArrowRight", "ArrowRight", "ArrowRight", "ArrowRight", "ArrowLeft", "Home"];
    const path = keys.map((key) => (press(key), focused()));
    expect(path).toEqual(["Crop", "Adjust", "Enhance", "Select", "Enhance", "Select"]);
    press("End");
    expect(focused()).toBe("Enhance");
    press("ArrowDown");
    expect(focused()).toBe("Enhance");
  });

  it("follows a vertical toolbar and a right-to-left layout", () => {
    const { unmount } = render(<Tools orientation="vertical" />);
    expect(group().dataset.orientation).toBe("vertical");
    expect(screen.getByRole("separator").getAttribute("aria-orientation")).toBe("horizontal");
    focusOn("Select");
    press("ArrowRight");
    expect(focused()).toBe("Select");
    press("ArrowDown");
    expect(focused()).toBe("Crop");
    unmount();
    render(<Tools dir="rtl" />);
    focusOn("Select");
    press("ArrowLeft");
    expect(focused()).toBe("Crop");
  });

  it("skips disabled buttons and leaves modified keys alone", () => {
    render(<Tools disabled="Crop" />);
    focusOn("Select");
    press("ArrowRight");
    expect(focused()).toBe("Adjust");
    fireEvent.keyDown(document.activeElement!, { key: "ArrowRight", altKey: true });
    expect(focused()).toBe("Adjust");
  });

  it("moves the tab stop off a button that becomes disabled", async () => {
    const { rerender } = render(<Tools />);
    rerender(<Tools disabled="Select" />);
    await waitFor(() => expect(button("Crop").tabIndex).toBe(0));
  });

  it("forwards refs, props, and events to the button", () => {
    const ref = createRef<HTMLButtonElement>();
    const onClick = vi.fn();
    render(
      <Toolbar aria-label="Tools">
        <ToolbarButton ref={ref} className="custom" onClick={onClick} aria-label="Share">
          S
        </ToolbarButton>
      </Toolbar>,
    );
    expect(ref.current).toBe(button("Share"));
    expect(ref.current?.classList).toContain("custom");
    fireEvent.click(button("Share"));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("fuses a round button with the group beside it, and stops when it goes", () => {
    const { rerender } = render(<Tools />);
    const toolbar = screen.getByRole("toolbar");
    const neck = toolbar.querySelector(":scope > .liquid-fusion");
    expect(neck?.getAttribute("aria-hidden")).toBe("true");
    expect(neck?.hasAttribute("hidden")).toBe(true);
    rerender(<Tools round={false} />);
    expect(toolbar.querySelector(".liquid-fusion")).toBeNull();
  });
});
