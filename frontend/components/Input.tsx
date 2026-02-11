import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
}

export function Input({ label, className = "", ...props }: InputProps) {
    return (
        <div className="flex flex-col gap-1.5 w-full">
            {label && (
                <label className="text-sm text-text-secondary">{label}</label>
            )}
            <input
                className={`w-full px-3 py-2 bg-surface border border-border rounded-md text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-neutral-500 transition-colors ${className}`}
                {...props}
            />
        </div>
    );
}
