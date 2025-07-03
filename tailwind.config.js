module.exports = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/pages/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  safelist: [
    "bg-badge-new-bg",
    "bg-badge-wait-bg",
    "bg-badge-in-bg",
    "bg-badge-out-bg",
    "bg-badge-ref-bg",
    "bg-badge-abs-bg",
    "text-accent",
    "text-badge-in-bg",
    "text-badge-out-bg",
    "text-badge-abs-bg",
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
