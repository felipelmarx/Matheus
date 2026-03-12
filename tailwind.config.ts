import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        fg: "var(--fg)",
        card: "var(--card)",
        "card-border": "var(--card-border)",
        surface: "var(--surface)",
        "surface-hover": "var(--surface-hover)",
        muted: "var(--muted)",
        "muted-strong": "var(--muted-strong)",
        subtle: "var(--subtle)",
        border: "var(--border)",
        "border-strong": "var(--border-strong)",
        stripe: "var(--stripe)",
        "row-hover": "var(--row-hover)",
      },
    },
  },
  plugins: [],
};
export default config;
