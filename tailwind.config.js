/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./*.html"],
  theme: {
    extend: {
      colors: {
        // toitrenov brand palette
        // Logo stays anthracite + terracotta. Site uses a brighter
        // orange (#FFA500) for CTAs per client spec: fond blanc /
        // ecriture noir / fond onglet #FFA500.
        primary: "#2D3340",
        "primary-dark": "#1C212C",
        "primary-light": "#475061",
        accent: "#FFA500",
        "accent-dark": "#E68F00",
        "accent-light": "#FFB733",
        "accent-deep": "#B85F00",
        sand: "#D4B896",
        "sand-dark": "#B89968",
        ink: "#0A0A0A",
        slate: "#3F4651",
        mist: "#F4F0E8",
        cream: "#FAF6EE",
        line: "#E2DACB",
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
