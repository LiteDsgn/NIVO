/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class", ".figma-dark"],
  content: ["./src/ui/index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        figma: {
          bg: "var(--figma-color-bg)",
          "bg-brand": "var(--figma-color-bg-brand)",
          "bg-brand-hover": "var(--figma-color-bg-brand-hover)",
          "bg-brand-pressed": "var(--figma-color-bg-brand-pressed)",
          "bg-selected": "var(--figma-color-bg-selected)",
          "bg-selected-hover": "var(--figma-color-bg-selected-hover)",
          "bg-hover": "var(--figma-color-bg-hover)",
          "bg-pressed": "var(--figma-color-bg-pressed)",
          text: "var(--figma-color-text)",
          "text-brand": "var(--figma-color-text-brand)",
          "text-onbrand": "var(--figma-color-text-onbrand)",
          "text-secondary": "var(--figma-color-text-secondary)",
          "text-tertiary": "var(--figma-color-text-tertiary)",
          border: "var(--figma-color-border)",
          "border-brand": "var(--figma-color-border-brand)",
          "border-strong": "var(--figma-color-border-strong)",
          icon: "var(--figma-color-icon)",
          "icon-brand": "var(--figma-color-icon-brand)",
          "icon-onbrand": "var(--figma-color-icon-onbrand)",
          "icon-secondary": "var(--figma-color-icon-secondary)",
        },
      },
      fontSize: {
        "figma-11": ["11px", "16px"],
        "figma-12": ["12px", "16px"],
        "figma-13": ["13px", "24px"],
      },
      borderRadius: {
        "figma-2": "2px",
        "figma-6": "6px",
      },
      boxShadow: {
        'figma-menu': '0px 2px 14px rgba(0, 0, 0, 0.15)',
        'figma-tooltip': '0px 2px 4px rgba(0, 0, 0, 0.15)',
      },
    },
  },
  plugins: [],
};
