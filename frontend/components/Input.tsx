import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
}

export const Input: React.FC<InputProps> = ({ label, className = "", ...props }) => {
    return (
        <div className="flex flex-col gap-1 w-full">
            {label && <label className="text-sm font-medium text-secondary">{label}</label>}
            <input
                className={`w-full px-3 py-2 bg-card border border-border rounded-md text-primary placeholder-muted focus:outline-none focus:border-accent transition-colors ${className}`}
                {...props}
            />
        </div>
    );
};
