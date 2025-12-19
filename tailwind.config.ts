import type { Config } from "tailwindcss";

export default {
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

        primary: "var(--primary)",
        accent1: "var(--accent-1)",
        accent2: "var(--accent-2)",

        muted: "var(--muted)",
        muted2: "var(--muted-2)",
        border: "var(--border)",
        card: "var(--card)",
        ring: "var(--ring)",
      },
      boxShadow: {
        soft: "0 12px 30px rgba(42, 97, 179, 0.10)",
      },
      borderRadius: {
        xl2: "1rem",
      },
    },
  },
  plugins: [],
} satisfies Config;
