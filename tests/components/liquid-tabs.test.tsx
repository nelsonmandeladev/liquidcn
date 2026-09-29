import { describe, expect, it } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/liquid/tabs";

function Library() {
  return (
    <Tabs defaultValue="photos">
      <TabsList aria-label="Library">
        <TabsTrigger value="photos" id="photos-tab">
          Photos
        </TabsTrigger>
        <TabsTrigger value="albums">Albums</TabsTrigger>
        <TabsTrigger value="shared" disabled>
          Shared
        </TabsTrigger>
      </TabsList>
      <TabsContent value="photos">All photos</TabsContent>
      <TabsContent value="albums">All albums</TabsContent>
    </Tabs>
  );
}

const lensOf = (list: HTMLElement) => list.querySelector<HTMLElement>(".liquid-lens")!;

describe("liquid Tabs", () => {
  it("adds one decorative lens that assistive technology cannot reach", () => {
    render(<Library />);
    const list = screen.getByRole("tablist", { name: "Library" });
    const lens = lensOf(list);
    expect(list.querySelectorAll(".liquid-lens")).toHaveLength(1);
    expect(lens.getAttribute("aria-hidden")).toBe("true");
    expect(lens.hasAttribute("inert")).toBe(true);
    expect(screen.getAllByRole("tab")).toHaveLength(3);
    expect(list.dataset.liquidIndicator).toBe("true");
  });

  it("copies the labels into the lens without duplicating ids", () => {
    render(<Library />);
    const lens = lensOf(screen.getByRole("tablist"));
    expect(lens.textContent).toBe("PhotosAlbumsShared");
    expect(lens.querySelectorAll("[id]")).toHaveLength(0);
    expect(document.querySelectorAll("#photos-tab")).toHaveLength(1);
  });

  it("keeps Radix selection and the lens copy in sync", async () => {
    render(<Library />);
    const albums = screen.getByRole("tab", { name: "Albums" });
    fireEvent.mouseDown(albums, { button: 0 });
    expect(albums.getAttribute("aria-selected")).toBe("true");
    expect(screen.getByRole("tabpanel").textContent).toBe("All albums");
    const lens = lensOf(screen.getByRole("tablist"));
    await waitFor(() =>
      expect(lens.querySelector('[aria-selected="true"]')?.textContent).toBe("Albums"),
    );
  });

  it("forwards refs and consumer class names to the real list", () => {
    let list: HTMLDivElement | null = null;
    render(
      <Tabs defaultValue="a">
        <TabsList ref={(node) => void (list = node)} className="custom" aria-label="Refs">
          <TabsTrigger value="a">A</TabsTrigger>
        </TabsList>
      </Tabs>,
    );
    expect(list).toBe(screen.getByRole("tablist"));
    expect(list!.className).toContain("custom");
    expect(list!.className).toContain("liquid-tabs");
  });

  it("removes the lens and its state when unmounted", () => {
    const { unmount } = render(<Library />);
    const list = screen.getByRole("tablist");
    unmount();
    expect(lensOf(list)).toBeNull();
    expect(list.dataset.liquidIndicator).toBeUndefined();
    expect(list.style.getPropertyValue("--liquid-lift")).toBe("");
  });
});
