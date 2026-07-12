/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  // El tema lo controla ThemeProvider vía setColorScheme
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        copper: {
          DEFAULT: "#b5745a",
          light: "#c89178",
          lighter: "#D8C2B9",
          dark: "#9c5e46",
          50: "#f6ece6",
        },
        earth: {
          DEFAULT: "#1c1917",
          light: "#292524"
        },
        terracotta: "#A74331",
        // Superficies (modo oscuro)
        surface: "#161412",       // fondo app
        "surface-2": "#1d1b19",   // fondo elevado / barras
        card: "#1f1c19",          // tarjetas
        // Superficies cálidas (modo claro), inferidas del mismo lenguaje visual
        sand: "#faf7f2",          // fondo app claro
        "sand-2": "#f2ece3",      // fondo elevado claro
      },
      fontFamily: {
        serif: ["Georgia", "serif"],
      },
      boxShadow: {
        copper: "0 8px 24px rgba(181,116,90,0.35)",
      },
    },
  },
  plugins: [],
}
