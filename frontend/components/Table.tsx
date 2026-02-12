import React from "react";

interface TableProps {
    headers: string[];
    children: React.ReactNode;
}

export function Table({ headers, children }: TableProps) {
    return (
        <div className="w-full overflow-hidden glass rounded-2xl shadow-sm animate-fade-in">
            {/* Gradient top accent */}
            <div className="h-px bg-gradient-to-r from-transparent via-accent to-transparent opacity-40" />
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="border-b border-border">
                            {headers.map((header, i) => (
                                <th
                                    key={i}
                                    className="py-3.5 px-5 text-xs font-semibold text-text-muted uppercase tracking-wider"
                                >
                                    {header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                        {children}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export function TableRow({
    children,
    className = "",
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <tr
            className={`hover:bg-surface-hover/50 transition-all duration-200 ${className}`}
        >
            {children}
        </tr>
    );
}

export function TableCell({
    children,
    className = "",
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <td className={`py-3.5 px-5 text-sm text-text-secondary ${className}`}>
            {children}
        </td>
    );
}
