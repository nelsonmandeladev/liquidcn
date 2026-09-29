/** The site's glass controls: material tokens and the accessibility opt-outs. */
export type Material = {
  blur: number;
  tint: number;
  viscosity: number;
  reduceTransparency: boolean;
  reduceMotion: boolean;
};

export const defaultMaterial: Material = {
  blur: 20,
  tint: 22,
  viscosity: 35,
  reduceTransparency: false,
  reduceMotion: false,
};

export const materialKey = "liquidcn:material";
export const themeKey = "liquidcn:theme";

export type MaterialOutput = { style: Record<string, string>; data: Record<string, string> };

/** Custom properties and data attributes a material writes on the root element. */
export function materialOutput(material: Material): MaterialOutput {
  const { blur, tint, viscosity, reduceTransparency, reduceMotion } = material;
  return {
    style: {
      "--liquid-blur": `${blur}px`,
      "--liquid-tint": String(tint / 100),
      "--liquid-viscosity": String(viscosity / 100),
      "--liquid-morph-duration": `${380 + viscosity * 4}ms`,
    },
    data: {
      reducedTransparency: String(reduceTransparency),
      reducedMotion: String(reduceMotion),
      // Nearly opaque glass is light enough for dark ink over any photo.
      glass: reduceTransparency || tint >= 55 ? "opaque" : "clear",
    },
  };
}

export function applyMaterial(root: HTMLElement, { style, data }: MaterialOutput) {
  Object.entries(style).forEach(([name, value]) => root.style.setProperty(name, value));
  Object.assign(root.dataset, data);
}

/**
 * Runs in <head> before first paint: restores the theme (or follows the system) and the
 * session's material. It is a string, so it cannot import; the material arrives precomputed.
 */
export function preferencesScript() {
  const fallback = JSON.stringify(materialOutput(defaultMaterial));
  return `(function(){var r=document.documentElement;try{var t=localStorage.getItem(${JSON.stringify(themeKey)});var d=t?t==="dark":matchMedia("(prefers-color-scheme: dark)").matches;r.classList.toggle("dark",d);r.style.colorScheme=d?"dark":"light"}catch(e){}var o=${fallback};try{var s=JSON.parse(sessionStorage.getItem(${JSON.stringify(materialKey)})||"null");if(s&&s.output)o=s.output}catch(e){}for(var k in o.style)r.style.setProperty(k,o.style[k]);for(var n in o.data)r.dataset[n]=o.data[n]})()`;
}
