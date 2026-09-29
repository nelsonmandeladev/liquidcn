/**
 * Crops of the one backdrop photo. `x` and `y` are the focal point in percent, `zoom` scales
 * about it, and `ink` is the glass text color that reads best over that part of the photo.
 */
export const scenes = {
  full: { x: 50, y: 46, zoom: 1, ink: "dark" },
  peaks: { x: 60, y: 22, zoom: 2.3, ink: "dark" },
  forest: { x: 26, y: 56, zoom: 2.6, ink: "light" },
  lake: { x: 64, y: 70, zoom: 1.9, ink: "light" },
  sky: { x: 24, y: 10, zoom: 2.4, ink: "dark" },
  shore: { x: 12, y: 88, zoom: 2.2, ink: "light" },
} as const;

export type SceneName = keyof typeof scenes;
