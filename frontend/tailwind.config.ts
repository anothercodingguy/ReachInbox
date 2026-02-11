import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                bg: "var(--color-bg)",
                surface: "var(--color-surface)",
                "surface-hover": "var(--color-surface-hover)",
                border: "var(--color-border)",
                "border-light": "var(--color-border-light)",
                "text-primary": "var(--color-text-primary)",
                "text-secondary": "var(--color-text-secondary)",
                "text-muted": "var(--color-text-muted)",
                accent: "var(--color-accent)",
                "accent-hover": "var(--color-accent-hover)",
                success: "var(--color-success)",
                warning: "var(--color-warning)",
                danger: "var(--color-danger)",
            },
            fontFamily: {
                sans: ["Inter", "system-ui", "sans-serif"],
            },
        },
    },
    plugins: [],
};

export default config;
