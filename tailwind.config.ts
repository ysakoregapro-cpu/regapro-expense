import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        app: "var(--app-bg)",
        surface: {
          DEFAULT: "var(--surface)",
          subtle: "var(--surface-subtle)",
        },
        ink: {
          DEFAULT: "var(--text-primary)",
          secondary: "var(--text-secondary)",
          muted: "var(--text-muted)",
        },
        line: {
          DEFAULT: "var(--border)",
          strong: "var(--border-strong)",
        },
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          hover: "var(--primary-hover)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive-text)",
          foreground: "#ffffff",
          soft: "var(--destructive-bg)",
        },
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        status: {
          approved: {
            DEFAULT: "var(--status-approved-bg)",
            fg: "var(--status-approved-text)",
          },
          pending: {
            DEFAULT: "var(--status-pending-bg)",
            fg: "var(--status-pending-text)",
          },
          returned: {
            DEFAULT: "var(--status-returned-bg)",
            fg: "var(--status-returned-text)",
          },
        },
      },
      borderRadius: {
        lg: "var(--radius-panel)",
        md: "var(--radius-control)",
        sm: "4px",
        dialog: "var(--radius-dialog)",
      },
      fontFamily: {
        sans: [
          "var(--font-geist-sans)",
          "Inter",
          '"Noto Sans JP"',
          '"Yu Gothic UI"',
          '"Hiragino Kaku Gothic ProN"',
          "sans-serif",
        ],
      },
      boxShadow: {
        float: "0 4px 16px rgba(23, 32, 42, 0.08)",
      },
    },
  },
  plugins: [animate],
} satisfies Config;
