import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        surface: "var(--surface)",
        card: "var(--card)",
        "card-hover": "var(--card-hover)",
        line: "var(--border)",
        "line-strong": "var(--border-strong)",
        ink: "var(--text-1)",
        "ink-2": "var(--text-2)",
        "ink-3": "var(--text-3)",
        invert: "var(--invert)",
        "invert-text": "var(--invert-text)",
      },
      fontFamily: {
        ar: ["var(--font-ar)", "sans-serif"],
        en: ["var(--font-en)", "sans-serif"],
      },
      boxShadow: {
        deep: "var(--shadow)",
      },
      maxWidth: {
        wrap: "1180px",
      },
    },
  },
  plugins: [],
};

export default config;
