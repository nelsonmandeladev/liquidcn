import { site } from "@/site";

/** schema.org data for the home page: the site, and the library as open-source code. */
export function siteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${site.url}/#website`,
        name: site.name,
        url: site.url,
        description: site.description,
      },
      {
        "@type": "SoftwareSourceCode",
        name: site.name,
        description: site.description,
        url: site.url,
        codeRepository: site.repository,
        license: "https://opensource.org/licenses/MIT",
        programmingLanguage: ["TypeScript", "CSS"],
        runtimePlatform: "React",
      },
    ],
  };
}

/** JSON for a `<script type="application/ld+json">`, with `<` escaped so it cannot close the tag. */
export function jsonLdScript(data: object) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
