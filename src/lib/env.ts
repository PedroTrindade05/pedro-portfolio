/** Detecções de ambiente usadas por animações e WebGL. */
export const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
export const isTouch = () => window.matchMedia("(hover: none), (pointer: coarse)").matches;
export const isMobile = () => window.innerWidth < 768;

let glOk: boolean | null = null;
export function hasWebGL() {
  if (glOk !== null) return glOk;
  try {
    const c = document.createElement("canvas");
    glOk = !!c.getContext("webgl2");
  } catch {
    glOk = false;
  }
  return glOk;
}
