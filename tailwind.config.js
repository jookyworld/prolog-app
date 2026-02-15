/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: "#101012",
        card: "#17171C",
        primary: "#3182F6",
        "primary-hover": "#2272EB",
        border: "rgba(255,255,255,0.1)",
        "muted-foreground": "rgba(255,255,255,0.6)",
        destructive: "#EF4444",
      },
    },
  },
  plugins: [],
};
