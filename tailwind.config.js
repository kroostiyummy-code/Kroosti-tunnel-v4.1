/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./*.html"],
  theme: {
    extend: {
      colors: {
        primary: "#1A365D",
        "primary-dark": "#0F2440",
        "primary-light": "#2D4A75",
        accent: "#FEA045",
        "accent-dark": "#E68A2E",
        "accent-light": "#FFB87A",
        "accent-deep": "#A14A0E",
        ink: "#0F1B2D",
        slate: "#5A6A7E",
        mist: "#E8EEF5",
        cream: "#F8F5EE",
        line: "#D6DEE9",
      },
      fontFamily: {
        display: ["Manrope", "system-ui", "sans-serif"],
        body: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 4px 16px rgba(15, 27, 45, 0.06)",
        card: "0 10px 30px rgba(15, 27, 45, 0.08)",
        elev: "0 20px 50px rgba(15, 27, 45, 0.12)",
      },
      maxWidth: {
        container: "1280px",
      },
    },
  },
  plugins: [],
};
