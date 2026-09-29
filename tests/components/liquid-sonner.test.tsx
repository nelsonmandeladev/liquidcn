import { describe, expect, it } from "vitest";
import { act, render, screen } from "@testing-library/react";
import { Toaster, toast } from "@/components/ui/liquid/sonner";

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
