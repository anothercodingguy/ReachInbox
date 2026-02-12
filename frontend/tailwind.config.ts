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
                "bg-subtle": "var(--color-bg-subtle)",
                surface: "var(--color-surface)",
                "surface-hover": "var(--color-surface-hover)",
                "surface-glass": "var(--color-surface-glass)",
                border: "var(--color-border)",
                "border-light": "var(--color-border-light)",
                "text-primary": "var(--color-text-primary)",
                "text-secondary": "var(--color-text-secondary)",
                "text-muted": "var(--color-text-muted)",
                accent: "var(--color-accent)",
                "accent-hover": "var(--color-accent-hover)",
                "accent-glow": "var(--color-accent-glow)",
                "accent-subtle": "var(--color-accent-subtle)",
                success: "var(--color-success)",
                "success-glow": "var(--color-success-glow)",
                warning: "var(--color-warning)",
                "warning-glow": "var(--color-warning-glow)",
                danger: "var(--color-danger)",
                "danger-glow": "var(--color-danger-glow)",
            },
            fontFamily: {
                sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
            },
            boxShadow: {
                sm: "var(--shadow-sm)",
                md: "var(--shadow-md)",
                lg: "var(--shadow-lg)",
                glow: "var(--shadow-glow)",
            },
            animation: {
                "fade-in": "fadeIn 0.4s ease-out",
                "slide-up": "slideUp 0.5s ease-out",
                "slide-down": "slideDown 0.3s ease-out",
                "pulse-glow": "pulseGlow 2s ease-in-out infinite",
            },
        },
    },
    plugins: [],
};

export default config;
