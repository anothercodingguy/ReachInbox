import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                bg: "var(--bg)",
                "bg-raised": "var(--bg-raised)",
                "bg-hover": "var(--bg-hover)",
                border: "var(--border)",
                "border-focus": "var(--border-focus)",
                text: "var(--text)",
                "text-secondary": "var(--text-secondary)",
                "text-muted": "var(--text-muted)",
                accent: "var(--accent)",
                green: "var(--green)",
                red: "var(--red)",
                yellow: "var(--yellow)",
            },
            fontFamily: {
                sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
            },
        },
    },
    plugins: [],
};

export default config;
