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
          page: "#f8f9fb",
          surface: "#ffffff",
          raised: "#f1f3f7",
          border: "#e2e6eb",
          muted: "#7b87a0",
          soft: "#515b73",
          ink: "#1f2937",
        },
        correct: "#16a34a",
        wrong: "#ef4444",
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
