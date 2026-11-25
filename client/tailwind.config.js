/** @type {import('tailwindcss').Config} */
const v = (name) => `rgb(var(--${name}) / <alpha-value>)`;

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Superfícies e texto (valores definidos em src/index.css, claro e escuro)
        page: v("page"),
        surface: v("surface"),
        elevated: v("elevated"),
        subtle: v("subtle"),
        sidebar: v("sidebar"),
        line: { DEFAULT: v("line"), strong: v("line-strong") },
        fg: v("fg"),
        muted: v("muted"),
        // Tokens já usados no projeto
        ink: { 900: v("fg"), 800: v("fg"), 700: v("muted") },
        accent: { DEFAULT: v("accent"), fill: v("accent-fill"), on: v("on-accent") },
        btn: { DEFAULT: v("accent-fill"), hover: v("btn-hover"), fg: v("on-accent") },
        ok: v("ok"),
        warn: v("warn"),
        danger: v("danger"),
        "on-solid": v("on-solid"),
        // Cores de apoio para selos e avatares
        info: v("info"),
        violet: v("violet"),
        teal: v("teal"),
        pink: v("pink"),
      },
      boxShadow: {
        card: "var(--shadow-card)",
      },
      fontFamily: {
        sans: ["'IBM Plex Sans'", "system-ui", "sans-serif"],
        mono: ["'IBM Plex Mono'", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};
