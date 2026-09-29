import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "@/components/ui/liquid.css";
import "@/styles.css";

export const metadata: Metadata = {
  title: "liquidcn - Material playground",
  description: "Liquid glass components built on shadcn/ui, with spring motion and a source-code registry.",
  icons: { icon: "/favicon.svg" },
};

export const viewport: Viewport = { themeColor: "#ffffff" };

export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
