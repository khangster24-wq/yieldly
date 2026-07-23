import type { Config } from "tailwindcss";

/**
 * Yieldly design tokens — the single source of truth for the palette, radii,
 * type, and motion described in docs/DESIGN_SYSTEM.md. Components should reference
 * these tokens (e.g. `bg-yieldly-blue`, `text-navy`), never raw hex values, so the
 * brand stays consistent and the palette stays tight (fintech-credible feel).
 */
const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/lib/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: { "2xl": "480px" }, // mobile-first: the app lives in a phone-width column
    },
    extend: {
      colors: {
        // --- Brand palette (docs/DESIGN_SYSTEM.md) ---
        yieldly: {
          blue: "#3B6BFF", // primary brand — buttons, active states, links, key data
          navy: "#0B1F4D", // primary text, dark backgrounds, headers
          coral: "#FF6B6B", // accent "pop" — badge/button backgrounds, dots, borders (NOT text — see coralText)
          coralText: "#C81919", // same coral hue, darkened for AA-compliant text on light backgrounds (5:1+)
          lime: "#C6FF6B", // positive/success — good ROI, strong match, growth
        },
        // Convenience aliases so common usage reads naturally.
        navy: "#0B1F4D",
        surface: {
          DEFAULT: "#F7F9FF", // soft blue-white app background (not stark white)
          card: "#FFFFFF", // card backgrounds
        },
        hairline: "#E3E8FA", // borders, dividers
        muted: {
          DEFAULT: "#F7F9FF",
          foreground: "#5B6B96", // secondary text
        },

        // --- shadcn/ui semantic tokens, driven by CSS vars in globals.css ---
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        // Generous, rounded-square feel matching the logo (16–24px cards, full pills).
        lg: "var(--radius)", // 20px
        md: "calc(var(--radius) - 4px)",
        sm: "calc(var(--radius) - 8px)",
        card: "20px",
        pill: "9999px",
      },
      fontFamily: {
        // Poppins carries headings (playful-fintech); Inter carries dense body text.
        heading: ["var(--font-poppins)", "system-ui", "sans-serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      fontFeatureSettings: {
        tabular: '"tnum"',
      },
      boxShadow: {
        // Soft, blue-tinted shadows so cards feel lifted and premium, not flat gray.
        card: "0 8px 30px -12px rgba(59, 107, 255, 0.22)",
        "card-hover": "0 16px 40px -12px rgba(59, 107, 255, 0.30)",
        pop: "0 10px 40px -8px rgba(255, 107, 107, 0.35)",
      },
      backgroundImage: {
        // Brand hero gradient (same as the logo icon background).
        "brand-gradient": "linear-gradient(135deg, #3B6BFF, #1533A6)",
      },
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.96)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.4s cubic-bezier(0.22, 1, 0.36, 1)",
        "scale-in": "scale-in 0.3s cubic-bezier(0.22, 1, 0.36, 1)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
