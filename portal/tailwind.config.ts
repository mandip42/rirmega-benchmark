import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Core surfaces & text
        ink: "#0b1220", // deep navy-slate for primary text/headings
        subink: "#334155", // secondary body text
        paper: "#f6f8fb", // soft off-white page background
        surface: "#ffffff", // card surface
        line: "#e6ebf2", // hairline borders

        // Brand ramp — a refined ocean teal
        brand: {
          50: "#eefdfb",
          100: "#d3f8f2",
          200: "#aaefe7",
          300: "#71e0d6",
          400: "#33c7bd",
          500: "#12a99f",
          600: "#0a8880",
          700: "#0c6c67",
          800: "#0f5653",
          900: "#114846",
        },
        // Secondary ramp — indigo/violet for accents & gradients
        accent2: {
          50: "#eef1ff",
          100: "#e0e5ff",
          200: "#c6cdff",
          300: "#a3abfc",
          400: "#8086f8",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
          800: "#372fa3",
          900: "#2f2b80",
        },
        // Back-compat aliases used across existing pages
        accent: "#0a8880",
      },
      fontFamily: {
        sans: [
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Inter",
          "sans-serif",
        ],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Consolas", "monospace"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(15,23,42,0.04), 0 4px 16px -4px rgba(15,23,42,0.08)",
        "card-hover":
          "0 2px 4px rgba(15,23,42,0.05), 0 12px 32px -8px rgba(12,108,103,0.18)",
        glow: "0 8px 30px -8px rgba(10,136,128,0.45)",
      },
      backgroundImage: {
        "hero-grid":
          "radial-gradient(60rem 30rem at 80% -10%, rgba(99,102,241,0.10), transparent 60%), radial-gradient(50rem 28rem at 0% 0%, rgba(18,169,159,0.12), transparent 55%)",
        "brand-gradient": "linear-gradient(135deg, #0a8880 0%, #12a99f 45%, #6366f1 120%)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s ease-out both",
      },
    },
  },
  plugins: [],
};
export default config;
