/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          900: "#1C2333",
          800: "#262F45",
          700: "#333F5C",
        },
        slate: {
          50: "#F6F7FA",
        },
        accent: {
          DEFAULT: "#3D5A80",
          light: "#98C1D9",
        },
        ok: "#3F7D58",
        warn: "#B5651D",
        danger: "#A63A3A",
      },
      fontFamily: {
        sans: ["'IBM Plex Sans'", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
