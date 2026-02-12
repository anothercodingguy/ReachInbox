import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "ghost" | "danger";
    size?: "sm" | "md" | "lg";
    children: React.ReactNode;
}

export function Button({
    variant = "primary",
    size = "md",
    children,
    className = "",
    disabled,
    ...props
}: ButtonProps) {
    const base =
        "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none focus:outline-none focus:ring-2 focus:ring-offset-1 active:scale-[0.98]";

    const sizes = {
        sm: "px-3 py-1.5 text-xs gap-1.5",
        md: "px-5 py-2.5 text-sm gap-2",
        lg: "px-6 py-3 text-base gap-2",
    };

    const variants = {
        primary:
            "bg-gradient-to-r from-[var(--color-gradient-start)] to-[var(--color-gradient-end)] text-white shadow-md hover:shadow-lg hover:shadow-accent-glow focus:ring-accent disabled:hover:shadow-md",
        secondary:
            "glass text-text-primary hover:bg-surface-hover focus:ring-accent",
        ghost:
            "bg-transparent text-text-secondary hover:text-text-primary hover:bg-surface-hover focus:ring-accent",
        danger:
            "bg-danger/10 text-danger hover:bg-danger/20 focus:ring-danger",
    };

    return (
        <button
            className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
            disabled={disabled}
            {...props}
        >
            {children}
        </button>
    );
}
