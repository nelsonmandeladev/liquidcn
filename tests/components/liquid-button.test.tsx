import { afterEach, describe, expect, it, vi } from "vitest";
import { createRef } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { Button } from "@/components/ui/liquid-button";
import { frameClock } from "../frame-clock";

afterEach(() => vi.unstubAllGlobals());

const scale = (element: HTMLElement) =>
  Number(element.style.getPropertyValue("--liquid-scale-x") || 1);

describe("liquid Button", () => {
  it("maps the prominent variant onto the base button", () => {
    render(<Button variant="prominent">Done</Button>);
    const button = screen.getByRole("button", { name: "Done" });
    expect(button.dataset.liquidVariant).toBe("prominent");
    expect(button.dataset.variant).toBe("default");
  });

  it("forwards refs and keeps consumer handlers", () => {
    const ref = createRef<HTMLButtonElement>();
    const onClick = vi.fn();
    render(
      <Button ref={ref} onClick={onClick}>
        Save
      </Button>,
    );
    fireEvent.click(screen.getByRole("button"));
    expect(ref.current).toBe(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("swells while pressed and springs back on release", () => {
    const time = frameClock();
    render(<Button>Hold</Button>);
    const button = screen.getByRole("button");
    fireEvent.pointerDown(button, { button: 0, pointerId: 1 });
    time.settle();
    expect(scale(button)).toBeGreaterThan(1.04);
    fireEvent.pointerUp(window, { pointerId: 1 });
    time.settle();
    expect(scale(button)).toBe(1);
  });

  it("does not react to presses while disabled", () => {
    const time = frameClock();
    render(<Button disabled>Off</Button>);
    const button = screen.getByRole("button");
    fireEvent.pointerDown(button, { button: 0, pointerId: 1 });
    time.settle();
    expect(scale(button)).toBe(1);
  });

  it("marks a content change so the new content can condense in", async () => {
    const { rerender } = render(<Button>Edit</Button>);
    rerender(<Button variant="prominent">Done</Button>);
    await waitFor(() => expect(screen.getByRole("button").dataset.liquidMorph).toBe("a"));
  });

  it("skips the morph when motion is reduced", async () => {
    const view = (label: string) => (
      <div data-reduced-motion="true">
        <Button>{label}</Button>
      </div>
    );
    const { rerender } = render(view("Edit"));
    rerender(view("Done"));
    await new Promise((resolve) => setTimeout(resolve));
    expect(screen.getByRole("button").dataset.liquidMorph).toBeUndefined();
  });
});
