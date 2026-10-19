import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Geist", "Inter", "system-ui", "sans-serif"],
        mono: ["'Geist Mono'", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      colors: {
        background: "hsl(var(--background))",
        surface: "hsl(var(--surface))",
        foreground: "hsl(var(--foreground))",
        muted: "hsl(var(--muted))",
        subtle: "hsl(var(--subtle))",
        border: "hsl(var(--border))",
        accent: {
          DEFAULT: "hsl(var(--accent))",
          soft: "hsl(var(--accent-soft))",
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
