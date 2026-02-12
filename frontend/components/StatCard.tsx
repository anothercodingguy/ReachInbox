import React from "react";

interface StatCardProps {
    label: string;
    value: number;
    variant?: "default" | "success" | "warning" | "danger";
    icon?: React.ReactNode;
}

const variantStyles = {
    default: {
        iconBg: "bg-accent-subtle",
        iconColor: "text-accent",
        glowColor: "shadow-accent-glow",
    },
    success: {
        iconBg: "bg-success-glow",
        iconColor: "text-success",
        glowColor: "",
    },
    warning: {
        iconBg: "bg-warning-glow",
        iconColor: "text-warning",
        glowColor: "",
    },
    danger: {
        iconBg: "bg-danger-glow",
        iconColor: "text-danger",
        glowColor: "",
    },
};

export function StatCard({
    label,
    value,
    variant = "default",
    icon,
}: StatCardProps) {
    const style = variantStyles[variant];

    return (
        <div className={`glass rounded-2xl p-5 hover:shadow-md transition-all duration-300 group relative overflow-hidden animate-slide-up`}>
            {/* Subtle gradient accent at top */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent to-transparent opacity-30 group-hover:opacity-60 transition-opacity" />

            <div className="flex items-start justify-between">
                <div>
                    <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-2">
                        {label}
                    </p>
                    <p className="text-3xl font-bold text-text-primary tabular-nums tracking-tight">
                        {value.toLocaleString()}
                    </p>
                </div>
                {icon && (
                    <div
                        className={`p-2.5 rounded-xl ${style.iconBg} ${style.iconColor}`}
                    >
                        {icon}
                    </div>
                )}
            </div>
        </div>
    );
}
