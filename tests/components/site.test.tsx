import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { components } from "@/examples";
import { MainNav } from "@/www/chrome/main-nav";
import { ThemeToggle } from "@/www/chrome/theme-toggle";
import { PackageCommand } from "@/www/docs/package-command";
import { DocsSidebar } from "@/www/docs/sidebar";
import { MaterialControls } from "@/www/material-controls";
import { themeKey } from "@/www/material";
import { mainNav } from "@/www/nav";

const navigation = vi.hoisted(() => ({ pathname: "/" }));
vi.mock("next/navigation", () => ({ usePathname: () => navigation.pathname }));

const root = document.documentElement;

afterEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  root.className = "";
  root.removeAttribute("style");
});

const examples = components.flatMap((component) =>
  component.examples.map((example) => ({ id: `${component.slug}/${example.name}`, example })),
);

describe.each(examples)("example $id", ({ example }) => {
  it("renders without duplicate ids", () => {
    const { container } = render(<example.component />);
    expect(container.childElementCount).toBeGreaterThan(0);
    const ids = [...container.querySelectorAll("[id]")].map((element) => element.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("MainNav", () => {
  it("marks the current section and puts the lens copy out of reach", () => {
    navigation.pathname = "/docs/components/tabs";
    render(<MainNav links={mainNav} />);
    const nav = screen.getByRole("navigation", { name: "Main" });
    expect(screen.getByRole("link", { name: "Components" }).getAttribute("aria-current")).toBe(
      "true",
    );
    expect(screen.getByRole("link", { name: "Docs" }).hasAttribute("aria-current")).toBe(false);
    expect(screen.getAllByRole("link")).toHaveLength(mainNav.length);
    const lens = nav.querySelector(".liquid-lens")!;
    expect(lens.getAttribute("aria-hidden")).toBe("true");
    expect(lens.hasAttribute("inert")).toBe(true);
  });

  it("uses aria-current=page on the page itself", () => {
    navigation.pathname = "/docs/theming";
    render(<MainNav links={mainNav} />);
    expect(screen.getByRole("link", { name: "Theming" }).getAttribute("aria-current")).toBe("page");
  });
});

describe("DocsSidebar", () => {
  it("marks the current page and lands one lens on it", () => {
    navigation.pathname = "/docs/installation";
    const sections = [
      {
        title: "Getting started",
        links: [
          { href: "/docs", title: "Introduction" },
          { href: "/docs/installation", title: "Installation" },
        ],
      },
      { title: "Components", links: [{ href: "/docs/components/button", title: "Button" }] },
    ];
    render(<DocsSidebar sections={sections} />);
    const current = screen.getByRole("link", { name: "Installation" });
    expect(current.getAttribute("aria-current")).toBe("page");
    const list = current.closest<HTMLElement>(".docs-nav")!;
    expect(list.querySelectorAll(".liquid-lens")).toHaveLength(1);
    expect(list.dataset.liquidIndicator).toBe("true");
  });
});

describe("PackageCommand", () => {
  it("switches package manager for every command and remembers it", async () => {
    const user = userEvent.setup();
    render(
      <>
        <PackageCommand args="shadcn@latest init" />
        <PackageCommand args="shadcn@latest add {origin}/r/liquid-button.json" />
      </>,
    );
    expect(screen.getAllByText("pnpm dlx")).toHaveLength(2);
    await user.click(screen.getAllByRole("tab", { name: "npm" })[0]);
    expect(screen.getAllByText("npx")).toHaveLength(2);
    expect(localStorage.getItem("liquidcn:package-manager")).toBe("npm");
    expect(screen.getByText(`${window.location.origin}/r/liquid-button.json`, { exact: false }));
  });
});

describe("MaterialControls", () => {
  it("writes the material to the root and the session", () => {
    render(<MaterialControls />);
    fireEvent.change(screen.getByRole("slider", { name: "Blur" }), { target: { value: "6" } });
    expect(root.style.getPropertyValue("--liquid-blur")).toBe("6px");
    expect(screen.getByRole("slider", { name: "Blur" }).getAttribute("aria-valuetext")).toBe(
      "6 px",
    );
    fireEvent.click(screen.getByRole("switch", { name: "Reduce motion" }));
    expect(root.dataset.reducedMotion).toBe("true");
    expect(JSON.parse(sessionStorage.getItem("liquidcn:material")!).material).toMatchObject({
      blur: 6,
      reduceMotion: true,
    });
    fireEvent.click(screen.getByRole("button", { name: "Reset material" }));
    expect(root.style.getPropertyValue("--liquid-blur")).toBe("20px");
    expect(root.dataset.reducedMotion).toBe("false");
  });
});

describe("ThemeToggle", () => {
  it("switches the page theme and remembers the choice", () => {
    render(<ThemeToggle />);
    const toggle = screen.getByRole("button", { name: "Toggle dark theme" });
    fireEvent.click(toggle);
    expect(root.classList.contains("dark")).toBe(true);
    expect(localStorage.getItem(themeKey)).toBe("dark");
    fireEvent.click(toggle);
    expect(root.classList.contains("dark")).toBe(false);
    expect(localStorage.getItem(themeKey)).toBe("light");
  });
});
