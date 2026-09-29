import { describe, expect, it } from "vitest";
import { components } from "@/examples";
import { site } from "@/site";
import { guideSummaries, llmsFullText, llmsText } from "@/www/llms";
import { guides } from "@/www/nav";
import { jsonLdScript, siteJsonLd } from "@/www/structured-data";

describe("llms.txt", () => {
  const text = llmsText(guides, components);

  it("summarizes every guide, and nothing else", () => {
    expect(Object.keys(guideSummaries).sort()).toEqual(guides.map((link) => link.href).sort());
  });

  it("links every guide and component with an absolute URL", () => {
    for (const { href, title } of guides) expect(text).toContain(`[${title}](${site.url}${href})`);
    for (const { name, slug } of components) {
      expect(text).toContain(`[${name}](${site.url}/docs/components/${slug})`);
    }
  });

  it("gives the install command for every registry item", () => {
    for (const { registry } of components) {
      expect(text).toContain(`npx shadcn@latest add ${site.url}/r/${registry.name}.json`);
    }
  });

  it("opens with the title and summary the format expects", () => {
    expect(text.startsWith(`# ${site.name}\n\n> ${site.description}\n`)).toBe(true);
  });
});

describe("llms-full.txt", () => {
  const text = llmsFullText(components);

  it("carries each component's usage, API, and accessibility notes", () => {
    for (const component of components) {
      expect(text).toContain(`## ${component.name}\n`);
      expect(text).toContain(component.usage);
      for (const entry of component.api) expect(text).toContain(`#### ${entry.component}`);
      for (const note of component.accessibility) expect(text).toContain(`- ${note}`);
    }
  });
});

describe("structured data", () => {
  it("describes the site and its repository", () => {
    const [website, code] = siteJsonLd()["@graph"];
    expect(website).toMatchObject({ "@type": "WebSite", url: site.url });
    expect(code).toMatchObject({ "@type": "SoftwareSourceCode", codeRepository: site.repository });
  });

  it("cannot close its script tag", () => {
    expect(jsonLdScript({ text: "</script><script>" })).not.toContain("<");
  });
});
