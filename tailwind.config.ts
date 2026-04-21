import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        fit: {
          white: "#FFFFFF",
          red: "#E63026",
          "red-dark": "#C0261E",
          "red-light": "#FDEBEA",
          ink: "#1A1A1A",
          muted: "#6B7280",
          border: "#E5E7EB",
          bg: "#F5F6F8",
          topbar: "#0F1727",
          "topbar-soft": "#1A2439"
        }
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"]
      },
      boxShadow: {
        card: "0 1px 2px rgba(17,24,39,0.04), 0 8px 24px rgba(17,24,39,0.06)"
      }
    }
  },
  plugins: []
};

export default config;
