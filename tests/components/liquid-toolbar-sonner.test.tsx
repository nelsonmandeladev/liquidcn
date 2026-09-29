import { describe, expect, it } from "vitest";
import { act, render, screen, waitFor } from "@testing-library/react";
import { Toolbar, ToolbarButton, ToolbarSeparator } from "@/components/ui/liquid/toolbar";
import { Toaster, toast } from "@/components/ui/liquid/sonner";

function Tools({ pressed }: { pressed?: string }) {
  return (
    <Toolbar aria-label="Tools">
      {["Select", "Crop"].map((name) => (
        <ToolbarButton key={name} aria-label={name} aria-pressed={pressed === name}>
          {name[0]}
        </ToolbarButton>
      ))}
      <ToolbarSeparator />
      <ToolbarButton aria-label="Enhance">E</ToolbarButton>
    </Toolbar>
  );
}

describe("liquid Toolbar", () => {
  it("shows the lens only while one action is pressed", async () => {
    const { rerender } = render(<Tools />);
    const toolbar = screen.getByRole("toolbar");
    expect(toolbar.dataset.liquidIndicator).toBeUndefined();
    rerender(<Tools pressed="Crop" />);
    await waitFor(() => expect(toolbar.dataset.liquidIndicator).toBe("true"));
    rerender(<Tools />);
    await waitFor(() => expect(toolbar.dataset.liquidIndicator).toBeUndefined());
  });

  it("keeps the lens copy out of the accessibility tree", () => {
    render(<Tools pressed="Select" />);
    expect(screen.getAllByRole("button")).toHaveLength(3);
    expect(screen.getByRole("button", { name: "Select" }).getAttribute("aria-pressed")).toBe(
      "true",
    );
  });
});

describe("liquid Toaster", () => {
  it("renders toasts as glass surfaces", async () => {
    render(<Toaster />);
    act(() => {
      toast("Saved to your collection");
    });
    const text = await screen.findByText("Saved to your collection");
    const surface = text.closest("[data-sonner-toast]");
    expect(surface?.className).toContain("liquid-surface");
    expect(surface?.className).toContain("liquid-toast");
  });
});
