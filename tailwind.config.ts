import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Inter",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
      colors: {
        brand: {
          primary: "#2D5A3D",
          secondary: "#4A7C59",
          light: "#E8F5E9",
          text: "#1A1A1A",
          "gray-dark": "#4A4A4A",
          "gray-med": "#9E9E9E",
          "gray-bg": "#F5F5F5",
          white: "#FFFFFF",
          success: "#28A745",
          warning: "#FFC107",
          error: "#DC3545",
        },
      },
    },
  },
  plugins: [],
};
export default config;
