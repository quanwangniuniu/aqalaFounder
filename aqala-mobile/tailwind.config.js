/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: "#021a12",
          green: "#0a5c3e",
          "green-hover": "#0d6b47",
          gold: "#c9a84c",
          "gold-hover": "#d4b85c",
        },
      },
      fontFamily: {
        amiri: ["Amiri"],
        cormorant: ["CormorantGaramond"],
      },
    },
  },
  plugins: [],
};
