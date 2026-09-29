import { createHighlighterCore, type HighlighterCore, type ThemeRegistration } from "shiki/core";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";

// Server-only: highlighting happens at build time and ships as plain HTML.

const color = (name: string) => `var(--code-${name})`;

/** Token colors are CSS variables, so light and dark code follow the page theme. */
const theme: ThemeRegistration = {
  name: "liquidcn",
  type: "light",
  colors: { "editor.foreground": color("fg"), "editor.background": "transparent" },
  tokenColors: [
    {
      scope: ["comment", "punctuation.definition.comment"],
      settings: { foreground: color("comment") },
    },
    {
      scope: ["keyword", "storage", "storage.type", "storage.modifier", "variable.language"],
      settings: { foreground: color("keyword") },
    },
    {
      scope: ["string", "punctuation.definition.string"],
      settings: { foreground: color("string") },
    },
    {
      scope: ["entity.name.tag", "support.class.component"],
      settings: { foreground: color("tag") },
    },
    { scope: ["entity.other.attribute-name"], settings: { foreground: color("attribute") } },
    {
      scope: ["entity.name.function", "support.function", "meta.function-call"],
      settings: { foreground: color("function") },
    },
    {
      scope: ["entity.name.type", "support.type", "entity.other.inherited-class"],
      settings: { foreground: color("tag") },
    },
    {
      scope: ["constant.numeric", "constant.language", "support.constant"],
      settings: { foreground: color("constant") },
    },
    {
      scope: ["punctuation", "meta.brace", "keyword.operator"],
      settings: { foreground: color("punctuation") },
    },
  ],
};

export type CodeLanguage = "tsx" | "bash" | "json" | "css" | "text";

let highlighter: Promise<HighlighterCore> | undefined;

function load() {
  highlighter ??= createHighlighterCore({
    themes: [theme],
    langs: [
      import("shiki/langs/tsx.mjs"),
      import("shiki/langs/shellscript.mjs"),
      import("shiki/langs/json.mjs"),
      import("shiki/langs/css.mjs"),
    ],
    engine: createJavaScriptRegexEngine(),
  });
  return highlighter;
}

export async function highlight(code: string, lang: CodeLanguage) {
  const shiki = await load();
  return shiki.codeToHtml(code.trimEnd(), { lang, theme: "liquidcn" });
}
