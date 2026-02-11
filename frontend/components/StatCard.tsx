import React from "react";

interface StatCardProps {
    label: string;
    value: number;
}

export function StatCard({ label, value }: StatCardProps) {
    return (
        <div className="bg-surface border border-border rounded-lg px-5 py-4">
            <p className="text-xs text-text-muted uppercase tracking-wide mb-1">
                {label}
            </p>
            <p className="text-2xl font-semibold text-text-primary tabular-nums">
                {value}
            </p>
        </div>
    );
}
