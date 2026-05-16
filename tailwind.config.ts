import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      colors: {
        study: {
          page: "#161b26",
          surface: "#1c2333",
          raised: "#262f42",
          border: "#3a4558",
          muted: "#8b94a8",
          soft: "#b4bdd1",
          ink: "#e8eaf2",
        },
        correct: "#22c55e",
        wrong: "#f87171",
      },
      keyframes: {
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "20%, 60%": { transform: "translateX(-6px)" },
          "40%, 80%": { transform: "translateX(6px)" },
        },
        pulseCorrect: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(22, 163, 74, 0.4)" },
          "50%": { boxShadow: "0 0 0 8px rgba(22, 163, 74, 0)" },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        shake: "shake 0.4s ease-in-out",
        "pulse-correct": "pulseCorrect 0.6s ease-out",
        "slide-up": "slideUp 0.35s ease-out forwards",
      },
    },
  },
  plugins: [],
};

export default config;
