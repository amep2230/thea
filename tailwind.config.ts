import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./client/index.html", "./client/src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["Libre Baskerville", "serif"],
        sans: ["Source Sans 3", "sans-serif"],
      },
      borderRadius: {
        // Adaptation aux standards THEA (rounded-xl = 12px)
        xl: "0.75rem", 
        lg: "0.5625rem",
        md: "0.375rem",
        sm: "0.1875rem",
      },
      colors: {
        // --- THEA TOKENS ---
        thea: {
          cream: "#FAF6F1",
          card: "#FEFCFA",
          border: "#E2E0DC",
          "border-light": "#EEEDEA",
        },
        sage: {
          50: "#F2F7F2",
          100: "#E0ECE0",
          200: "#C2D9C1",
          300: "#9EC09D",
          400: "#7A9E78", // PRIMARY THEA
          500: "#5F8360",
          600: "#4A6A4C",
        },
        blue: {
          50: "#F0F5F8",
          400: "#6B8FA3", // SECONDARY THEA
          500: "#537485",
        },
        // Couleurs sémantiques des cartes
        activity: "#C4956A",
        medication: "#6B8FA3",
        meal: "#7A9E78",
        rest: "#9B8AA6",
        alert: "#C49A9A",

        // --- SHADCN MAPPING (pour que les composants UI existants s'adaptent) ---
        background: "#FAF6F1", // Utilise la Cream THEA
        foreground: "#2C3E50", // Utilise le Heading THEA
        primary: {
          DEFAULT: "#7A9E78", // Sage 400
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#6B8FA3", // Blue 400
          foreground: "#FFFFFF",
        },
        card: {
          DEFAULT: "#FEFCFA",
          foreground: "#4A5568", // Body text
        },
        destructive: {
          DEFAULT: "#C49A9A", // Dusty Rose (pas de rouge vif !)
          foreground: "#FFFFFF",
        },
        // ... gardez le reste de vos variables hsl existantes si nécessaire
      },
      boxShadow: {
        'thea-card': '0 1px 4px rgba(44,62,80,0.06), 0 1px 2px rgba(44,62,80,0.04)',
        'thea-elevated': '0 2px 12px rgba(44,62,80,0.1)',
      }
    },
  },
} satisfies Config;