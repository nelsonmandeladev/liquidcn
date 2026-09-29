import type { DocumentedComponent } from "@/examples";
import type { Prop } from "@/examples/types";
import type { NavLink } from "@/www/nav";
import { site } from "@/site";

// Plain-text maps of the site for AI agents, following https://llmstxt.org: /llms.txt is the
// index, /llms-full.txt adds each component's usage, props, and accessibility notes.

/** What an agent finds on each guide, for the index. */
export const guideSummaries: Record<string, string> = {
  "/docs": "What liquidcn is, how each component extends its shadcn/ui base, and its limits.",
  "/docs/installation":
    "Requirements (React 19, Tailwind CSS v4, components.json), the shadcn CLI command, the `@liquidcn` namespace, and where files land.",
  "/docs/components": "Every component, with a live preview.",
  "/docs/theming":
    "The `--liquid-*` CSS custom properties, accent and lens ink, dark material, and opaque glass.",
  "/docs/motion":
    "Motion principles, the spring and its viscosity token, and the numbers behind each interaction.",
  "/docs/accessibility":
    "Semantics and focus, reduced motion and transparency, contrast, forced colors, touch, and what your code must provide.",
};

const url = (path: string) => new URL(path, site.url).href;
const itemUrl = (component: DocumentedComponent) => url(`/r/${component.registry.name}.json`);
const addCommand = (component: DocumentedComponent) =>
  `npx shadcn@latest add ${itemUrl(component)}`;

function intro() {
  return [
    `# ${site.name}`,
    "",
    `> ${site.description}`,
    "",
    "Early stage: APIs may still change, so add liquidcn to existing projects with care.",
    "",
    "Each liquid component extends the shadcn/ui component of the same name and keeps its API: the same props, refs, and events. Install one with the shadcn CLI, then import it from `@/components/ui/liquid/<name>` instead of `@/components/ui/<name>`. It needs React 19, Tailwind CSS v4, and a shadcn `components.json`.",
  ];
}

/** The index at /llms.txt. */
export function llmsText(guides: NavLink[], components: DocumentedComponent[]) {
  return [
    ...intro(),
    "",
    "## Docs",
    "",
    ...guides.map(({ href, title }) => `- [${title}](${url(href)}): ${guideSummaries[href]}`),
    "",
    "## Components",
    "",
    ...components.map(
      (component) =>
        `- [${component.name}](${url(`/docs/components/${component.slug}`)}): ${component.registry.description} Install: \`${addCommand(component)}\``,
    ),
    "",
    "## Registry",
    "",
    `- [Registry index](${url("/r/registry.json")}): every item in the shadcn registry format, with its files and dependencies.`,
    `- [Full component reference](${url("/llms-full.txt")}): usage, props, and accessibility for every component.`,
    "",
    "## Optional",
    "",
    `- [Source code](${site.repository})`,
    `- [Changelog](${site.repository}/blob/HEAD/CHANGELOG.md)`,
    "",
  ].join("\n");
}

function propLine({ name, type, default: fallback, description }: Prop) {
  const detail = fallback ? `\`${type}\`, default \`${fallback}\`` : `\`${type}\``;
  return `- \`${name}\` (${detail}): ${description}`;
}

function componentSection(component: DocumentedComponent) {
  return [
    `## ${component.name}`,
    "",
    component.registry.description,
    "",
    `- Docs: ${url(`/docs/components/${component.slug}`)}`,
    `- Install: \`${addCommand(component)}\``,
    "",
    "### Usage",
    "",
    "```tsx",
    component.usage,
    "```",
    "",
    "### API",
    ...component.api.flatMap((entry) => [
      "",
      `#### ${entry.component}`,
      "",
      entry.description,
      ...(entry.props.length ? ["", ...entry.props.map(propLine)] : []),
    ]),
    "",
    "### Accessibility",
    "",
    ...component.accessibility.map((note) => `- ${note}`),
  ];
}

/** Everything at /llms-full.txt: the intro, then every component in full. */
export function llmsFullText(components: DocumentedComponent[]) {
  return [...intro(), "", ...components.flatMap((c) => [...componentSection(c), ""])].join("\n");
}
