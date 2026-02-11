import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary";
    children: React.ReactNode;
}

export function Button({
    variant = "primary",
    children,
    className = "",
    disabled,
    ...props
}: ButtonProps) {
    const base =
        "inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none";

    const variants = {
        primary:
            "bg-text-primary text-bg hover:opacity-80 disabled:hover:opacity-40",
        secondary:
            "bg-transparent border border-border-light text-text-secondary hover:text-text-primary hover:border-text-muted disabled:hover:text-text-secondary disabled:hover:border-border-light",
    };

    return (
        <button
            className={`${base} ${variants[variant]} ${className}`}
            disabled={disabled}
            {...props}
        >
            {children}
        </button>
    );
}
