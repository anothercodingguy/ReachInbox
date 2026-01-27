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
                background: '#0B0B0C', // Deepest black
                card: '#141416', // Layered surface
                border: 'rgba(255,255,255,0.08)', // Subtle border
                primary: '#FFFFFF',
                secondary: '#A1A1AA', // Zinc-400
                muted: '#52525B', // Zinc-600
                accent: {
                    DEFAULT: '#6366F1', // Indigo-500
                    hover: '#4F46E5', // Indigo-600
                },
            },
            boxShadow: {
                'subtle': '0 0 0 1px rgba(255,255,255,0.02)',
                'card': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            },
            animation: {
                'fade-in': 'fadeIn 0.2s ease-out',
                'slide-up': 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(8px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
            },
        },
    },
    plugins: [],
};

export default config;
