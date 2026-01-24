import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary";
    children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
    variant = "primary",
    children,
    className = "",
    ...props
}) => {
    const baseStyles = "px-4 py-2 rounded-md transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed";

    // Primary: solid accent color
    const primaryStyles = "bg-accent hover:bg-accent-hover text-white border border-transparent";

    // Secondary: transparent with subtle border
    const secondaryStyles = "bg-transparent border border-border text-secondary hover:text-primary hover:bg-card";

    const variantStyles = variant === "primary" ? primaryStyles : secondaryStyles;

    return (
        <button className={`${baseStyles} ${variantStyles} ${className}`} {...props}>
            {children}
        </button>
    );
};
