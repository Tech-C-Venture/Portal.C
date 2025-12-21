import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        card: "var(--card)",
        foreground: "var(--foreground)",
        primary: "var(--primary)",
        accent1: "var(--accent1)",
        accent2: "var(--accent2)",
        border: "var(--border)",
        muted: "var(--muted)",
        muted2: "var(--muted2)",
      },
      boxShadow: {
        soft: "0 18px 45px rgba(42, 97, 179, 0.12)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
} satisfies Config;
