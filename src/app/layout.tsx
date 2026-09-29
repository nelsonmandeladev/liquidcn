import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Toaster } from "@/components/ui/liquid/sonner";
import { site } from "@/site";
import { SiteFooter } from "@/www/chrome/footer";
import { SiteHeader } from "@/www/chrome/header";
import { preferencesScript } from "@/www/material";
// Order matters: site rules come after the library's so they win at equal specificity.
import "@/components/ui/liquid/liquid.css";
import "@/styles.css";
import "@/www/styles/chrome.css";
import "@/www/styles/stage.css";
import "@/www/styles/controls.css";
import "@/www/styles/code.css";
import "@/www/styles/docs.css";
import "@/www/styles/home.css";

const title = "liquidcn: Liquid Glass for shadcn/ui";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: title, template: "%s · liquidcn" },
  description: site.description,
  icons: { icon: "/favicon.svg" },
  // The shared image is app/opengraph-image.tsx.
  openGraph: {
    type: "website",
    siteName: site.name,
    title,
    description: site.tagline,
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0b0c" },
  ],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    // The <head> script sets the theme class and material before first paint.
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: preferencesScript() }} />
      </head>
      <body>
        <a className="skip-link" href="#content">
          Skip to content
        </a>
        <SiteHeader />
        {children}
        <SiteFooter />
        <Toaster />
      </body>
    </html>
  );
}
