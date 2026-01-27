import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "danger";
    children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
    variant = "primary",
    children,
    className = "",
    ...props
}) => {
    const baseStyles = "px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-accent/50";

    const variants = {
        primary: "bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm border border-transparent",
        secondary: "bg-transparent border border-white/10 text-zinc-300 hover:text-white hover:bg-white/5",
        danger: "bg-transparent border border-red-900/30 text-red-500 hover:bg-red-950/30 hover:text-red-400"
    };

    return (
        <button className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
            {children}
        </button>
    );
};
