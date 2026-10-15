import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        charcoal: {
          DEFAULT: "#101318",
          deep: "#0B0D11",
          card: "#171B22",
          border: "#252B36",
          hover: "#1D232C",
        },
        gold: {
          light: "#E2C889",
          DEFAULT: "#C8A96A",
          dark: "#A78345",
          muted: "#93763D",
        },
        ivory: {
          DEFAULT: "#F6F3ED",
          dark: "#E8E4DA",
          muted: "#D1CBBF",
        },
        emerald: {
          light: "#258368",
          DEFAULT: "#174C3C",
          dark: "#0F3227",
        },
        slate: {
          subtle: "#8A94A0",
          DEFAULT: "#68717D",
          dark: "#4B535E",
        },
      },
      fontFamily: {
        sans: [
          "var(--font-sans)",
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Arial",
          "sans-serif",
        ],
        display: [
          "var(--font-display)",
          "var(--font-sans)",
          "Montserrat",
          "-apple-system",
          "sans-serif",
        ],
      },
      boxShadow: {
        glow: "0 0 25px -5px rgba(200, 169, 106, 0.25)",
        card: "0 10px 30px -10px rgba(0, 0, 0, 0.5)",
      },
    },
  },
  plugins: [],
};
export default config;

