import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/liquid-dropdown-menu";

function Menu({ onSave, overlap }: { onSave: () => void; overlap?: boolean }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>Options</DropdownMenuTrigger>
      <DropdownMenuContent overlap={overlap}>
        <DropdownMenuItem onSelect={onSave}>Save</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

const trigger = () => screen.getByRole("button", { name: "Options", hidden: true });
const press = (pointerType = "mouse") =>
  fireEvent.pointerDown(trigger(), { button: 0, pointerId: 1, pointerType, clientX: 0 });

describe("liquid DropdownMenu", () => {
  it("does not select the item that opens under a still click", async () => {
    const onSave = vi.fn();
    render(<Menu onSave={onSave} />);
    press();
    const item = await screen.findByRole("menuitem", { name: "Save" });
    fireEvent.pointerUp(item, { pointerId: 1 });
    expect(onSave).not.toHaveBeenCalled();
    expect(screen.getByRole("menu")).toBeTruthy();
  });

  it("swallows the click that follows a tap", async () => {
    const onSave = vi.fn();
    render(<Menu onSave={onSave} />);
    press("touch");
    const item = await screen.findByRole("menuitem", { name: "Save" });
    // Touch releases go to the element that was pressed; the click lands under the finger.
    fireEvent.pointerUp(trigger(), { pointerId: 1 });
    fireEvent.click(item);
    expect(onSave).not.toHaveBeenCalled();
  });

  it("selects when the press is dragged onto an item, as on iOS", async () => {
    const onSave = vi.fn();
    render(<Menu onSave={onSave} />);
    press();
    const item = await screen.findByRole("menuitem", { name: "Save" });
    fireEvent.pointerMove(window, { pointerId: 1, clientX: 40, clientY: 30 });
    fireEvent.pointerUp(item, { pointerId: 1 });
    expect(onSave).toHaveBeenCalledOnce();
  });

  it("lets a fresh click inside the open menu select", async () => {
    const onSave = vi.fn();
    render(<Menu onSave={onSave} />);
    press();
    const item = await screen.findByRole("menuitem", { name: "Save" });
    fireEvent.pointerUp(item, { pointerId: 1 });
    fireEvent.pointerDown(item, { button: 0, pointerId: 2 });
    fireEvent.pointerUp(item, { pointerId: 2 });
    fireEvent.click(item);
    expect(onSave).toHaveBeenCalledOnce();
  });

  it("opens from the keyboard and selects with Enter", async () => {
    const onSave = vi.fn();
    render(<Menu onSave={onSave} />);
    fireEvent.keyDown(trigger(), { key: "Enter" });
    const item = await screen.findByRole("menuitem", { name: "Save" });
    fireEvent.keyDown(item, { key: "Enter" });
    expect(onSave).toHaveBeenCalledOnce();
  });

  it("covers the trigger while open, unless overlap is off", async () => {
    const { unmount } = render(<Menu onSave={() => {}} />);
    press();
    await screen.findByRole("menu");
    expect(trigger().dataset.liquidCovered).toBe("");
    unmount();
    render(<Menu onSave={() => {}} overlap={false} />);
    press();
    await screen.findByRole("menu");
    expect(trigger().dataset.liquidCovered).toBeUndefined();
  });

  it("wraps content so it can come into focus as the surface forms", async () => {
    render(<Menu onSave={() => {}} />);
    press();
    const menu = await screen.findByRole("menu");
    expect(menu.className).toContain("liquid-menu");
    expect(menu.firstElementChild?.className).toBe("liquid-menu-body");
  });
});
