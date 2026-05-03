/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          base:      "#030303",
          primary:   "#080808",
          secondary: "#0d0d0d",
          tertiary:  "#141414",
          card:      "#0d0d0d",
          hover:     "#161616",
        },
        border: {
          DEFAULT: "rgba(255,255,255,0.07)",
          subtle:  "rgba(255,255,255,0.04)",
          strong:  "rgba(255,255,255,0.12)",
        },
        text: {
          primary:   "#ffffff",
          secondary: "#9a9a9a",
          muted:     "#444444",
          inverse:   "#000000",
        },
        danger:  "#ff4444",
        success: "#ffffff",
        warning: "#cccccc",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      animation: {
        "pulse-slow":  "pulse 3s cubic-bezier(0.4,0,0.6,1) infinite",
        "fade-in":     "fadeIn 0.3s ease-out",
        "slide-up":    "slideUp 0.3s ease-out",
        "slide-down":  "slideDown 0.3s ease-out",
        "float":       "float 4s ease-in-out infinite",
        "spin-slow":   "spin-slow 12s linear infinite",
      },
      keyframes: {
        fadeIn:    { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        slideUp:   { "0%": { opacity: "0", transform: "translateY(10px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
        slideDown: { "0%": { opacity: "0", transform: "translateY(-8px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
        float:     { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-8px)" } },
        "spin-slow": { to: { transform: "rotate(360deg)" } },
      },
    },
  },
  plugins: [],
};
