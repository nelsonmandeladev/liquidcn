import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { site } from "@/site";
import "@/components/ui/liquid.css";
import "@/styles.css";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: "liquidcn - Liquid Glass for shadcn/ui", template: "%s - liquidcn" },
  description: site.description,
  icons: { icon: "/favicon.svg" },
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: site.name,
    title: "liquidcn - Liquid Glass for shadcn/ui",
    description: site.description,
    images: [{ url: "/assets/alpine-lake.png", width: 1536, height: 1024 }],
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = { themeColor: "#ffffff" };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
