import type { MetadataRoute } from "next";
import { site } from "@/site";
import { docsOrder } from "@/www/docs/sections";

export default function sitemap(): MetadataRoute.Sitemap {
  return [{ href: "/" }, ...docsOrder].map(({ href }) => ({ url: new URL(href, site.url).href }));
}
