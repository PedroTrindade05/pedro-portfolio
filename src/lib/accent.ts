/**
 * Cor de acento única do site. Troque `DEFAULT_ACCENT` para mudar de vez,
 * ou teste ao vivo com ?accent=lime | red | yellow | cyan na URL.
 */
export const ACCENTS = {
  lime: "#c8ff3c",
  red: "#ff3b30",
  yellow: "#ffd23f",
  cyan: "#3be8ff",
} as const;

export type AccentName = keyof typeof ACCENTS;
export const DEFAULT_ACCENT: AccentName = "lime";

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.replace("#", ""), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

let current: [number, number, number] = hexToRgb(ACCENTS[DEFAULT_ACCENT]);

export function initAccent() {
  let name: AccentName = DEFAULT_ACCENT;
  try {
    const q = new URLSearchParams(location.search).get("accent") as AccentName | null;
    const saved = sessionStorage.getItem("accent") as AccentName | null;
    if (q && q in ACCENTS) {
      name = q;
      sessionStorage.setItem("accent", q);
    } else if (saved && saved in ACCENTS) name = saved;
  } catch {
    /* sem storage: usa o padrão */
  }
  const hex = ACCENTS[name];
  current = hexToRgb(hex);
  const root = document.documentElement.style;
  root.setProperty("--acc", hex);
  root.setProperty("--acc-rgb", current.join(" "));
}

/** Acento em 0..1 (sRGB) para shaders. */
export const accentRGB = () => current.map((c) => c / 255) as [number, number, number];
