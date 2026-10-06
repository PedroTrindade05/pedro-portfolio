import type { Config } from "tailwindcss";

/** Tokens de cor vêm de variáveis CSS (src/index.css), inclusive o acento trocável. */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    screens: { sm: "640px", md: "768px", lg: "1024px", xl: "1280px", "2xl": "1600px" },
    extend: {
      colors: {
        ink: { DEFAULT: "var(--ink)", 2: "var(--ink-2)", 3: "var(--ink-3)" },
        paper: { DEFAULT: "var(--paper)", 2: "var(--paper-2)" },
        silver: { DEFAULT: "var(--silver)", 2: "var(--silver-2)" },
        steel: "var(--steel)",
        acc: "rgb(var(--acc-rgb) / <alpha-value>)",
      },
      fontFamily: {
        sans: ['"Inter Tight Variable"', "Inter Tight", "system-ui", "sans-serif"],
        mono: ['"Geist Mono Variable"', "Geist Mono", "ui-monospace", "monospace"],
      },
      letterSpacing: { tightest: "-0.055em", tighter2: "-0.04em" },
      transitionTimingFunction: {
        expo: "cubic-bezier(0.16, 1, 0.3, 1)",
        quart: "cubic-bezier(0.76, 0, 0.24, 1)",
      },
      spacing: { gutter: "var(--gutter)" },
    },
  },
  plugins: [],
} satisfies Config;
