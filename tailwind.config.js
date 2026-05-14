/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./*.html"],
  theme: {
    extend: {
      colors: {
        // toitrenov brand palette — extracted from the logo
        primary: "#2D3340",
        "primary-dark": "#1C212C",
        "primary-light": "#475061",
        accent: "#C25A2C",
        "accent-dark": "#A24722",
        "accent-light": "#D9774A",
        "accent-deep": "#6B2F12",
        sand: "#D4B896",
        "sand-dark": "#B89968",
        ink: "#1C212C",
        slate: "#5A6470",
        mist: "#EFEAE2",
        cream: "#F8F2E9",
        line: "#DCD3C5",
      },
      fontFamily: {
        display: ["Manrope", "system-ui", "sans-serif"],
        body: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 4px 16px rgba(28, 33, 44, 0.06)",
        card: "0 10px 30px rgba(28, 33, 44, 0.08)",
        elev: "0 20px 50px rgba(28, 33, 44, 0.12)",
      },
      maxWidth: {
        container: "1280px",
      },
    },
  },
  plugins: [],
};
