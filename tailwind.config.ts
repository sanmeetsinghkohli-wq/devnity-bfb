import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./hooks/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#06060F",
        surface: "#0E0E1C",
        border: "#1A1A30",
        primary: { DEFAULT: "#F7941D", foreground: "#0A0A0B" },
        secondary: { DEFAULT: "#FF5733" },
        success: "#22C55E",
        warning: "#EF4444",
        muted: { DEFAULT: "#0E0E1C", foreground: "#555577" },
        input: "#1A1A30",
        ring: "#F7941D",
        foreground: "#F0F0F0",
      },
      fontFamily: {
        sans: ["var(--font-dm)", "system-ui", "sans-serif"],
        display: ["var(--font-tiro)", "serif"],
      },
      keyframes: {
        ripple: {
          "0%": { transform: "scale(0.5)", opacity: "0.6" },
          "100%": { transform: "scale(2)", opacity: "0" },
        },
        bounceDot: {
          "0%, 80%, 100%": { transform: "scale(0)" },
          "40%": { transform: "scale(1)" },
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(247,148,29,0.6)" },
          "50%": { boxShadow: "0 0 0 16px rgba(247,148,29,0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        ripple: "ripple 1s ease-out forwards",
        bounceDot: "bounceDot 1.4s infinite ease-in-out",
        pulseGlow: "pulseGlow 1.6s infinite",
        shimmer: "shimmer 2s linear infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
