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
          dark: "#9c5e46",
          50: "#f6ece6",
        },
        earth: "#1c1917",
        creamy: "#f5f5f4",
        surface: "#161412",
        card: "#1f1c19",
      },
    },
  },
  plugins: [],
}
