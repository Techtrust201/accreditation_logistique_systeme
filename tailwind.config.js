module.exports = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/pages/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
      },
      colors: {
        primary: "#3F4660", // header
        "primary-dark": "#2C2F3F", // dropdown header
        accent: "#FFAA00",
        // Badges
        "badge-new-bg": "#FFF1CC",
        "badge-wait-bg": "#CCE4FF",
        "badge-in-bg": "#CCF4EF",
        "badge-out-bg": "#4F587E",
        "badge-ref-bg": "#4F587E",
        "badge-abs-bg": "#EE0000",
      },
      boxShadow: {
        card: "0 2px 6px -1px rgba(0,0,0,0.08)",
      },
      borderRadius: {
        card: "6px",
        badge: "12px",
      },
      spacing: {
        line: "44px",
        header: "48px",
      },
    },
  },
  plugins: [],
};
