/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        /* Core surfaces */
        "app-bg":         "var(--bg)",
        "app-surface":    "var(--bg-surface)",
        "app-card":       "var(--bg-card)",
        "app-sidebar":    "var(--bg-sidebar)",
        "app-hover":      "var(--bg-hover)",
        "app-input":      "var(--bg-input)",
        "app-border":     "var(--border)",
        "app-border-sub": "var(--border-subtle)",
        /* Text */
        "txt":            "var(--text-primary)",
        "txt-sec":        "var(--text-secondary)",
        "txt-muted":      "var(--text-muted)",
        /* Accent */
        "blue":           "var(--blue)",
        "blue-dim":       "var(--blue-dim)",
        "indigo":         "var(--indigo)",
        "indigo-dim":     "var(--indigo-dim)",
        /* Semantic */
        "ok":             "var(--success)",
        "ok-dim":         "var(--success-dim)",
        "warn":           "var(--warning)",
        "warn-dim":       "var(--warning-dim)",
        "err":            "var(--error)",
        "err-dim":        "var(--error-dim)",

        /* ── Legacy aliases kept for compatibility with existing screen components ── */
        "background":                  "var(--bg)",
        "on-background":               "var(--text-primary)",
        "surface":                     "var(--bg-surface)",
        "surface-container-low":       "var(--bg-input)",
        "surface-container":           "var(--bg-card)",
        "surface-container-high":      "var(--bg-hover)",
        "surface-container-highest":   "var(--border)",
        "on-surface":                  "var(--text-primary)",
        "on-surface-variant":          "var(--text-secondary)",
        "outline":                     "var(--border)",
        "outline-variant":             "var(--border-subtle)",
        "primary":                     "var(--blue)",
        "on-primary":                  "#ffffff",
        "status-success":              "var(--success)",
        "status-warning":              "var(--warning)",
        "status-error":                "var(--error)",
        "status-info":                 "var(--blue)",
        "relationship-identical":      "var(--blue)",
        "relationship-duplicate":      "var(--indigo)",
        "relationship-near":           "var(--warning)",
      },
      fontFamily: {
        sans:             ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        mono:             ["JetBrains Mono", "Fira Code", "Courier New", "monospace"],
        /* legacy */
        "data-mono":      ["JetBrains Mono", "monospace"],
        "body-standard":  ["Inter", "sans-serif"],
        "headline-section":["Inter", "sans-serif"],
        "display-cnmc":   ["JetBrains Mono", "monospace"],
      },
      borderRadius: {
        sm:   "4px",
        DEFAULT: "6px",
        md:   "8px",
        lg:   "10px",
        xl:   "14px",
        "2xl":"18px",
        full: "9999px",
      },
      boxShadow: {
        card:     "var(--shadow-card)",
        elevated: "var(--shadow-elevated)",
      },
      transitionTimingFunction: {
        smooth: "cubic-bezier(0.4, 0, 0.2, 1)",
      },
      spacing: {
        "4.5": "18px",
        "13":  "52px",
        "margin-page": "24px",
      },
      keyframes: {
        fadeIn:       { from: { opacity: 0, transform: "translateY(4px)" }, to: { opacity: 1, transform: "translateY(0)" } },
        slideInRight: { from: { opacity: 0, transform: "translateX(16px)" }, to: { opacity: 1, transform: "translateX(0)" } },
        shimmer:      { from: { backgroundPosition: "-200% 0" }, to: { backgroundPosition: "200% 0" } },
      },
      animation: {
        "fade-in":       "fadeIn 200ms ease forwards",
        "slide-in":      "slideInRight 220ms ease forwards",
        "shimmer":       "shimmer 1.4s ease infinite",
      },
    },
  },
  plugins: [],
};
