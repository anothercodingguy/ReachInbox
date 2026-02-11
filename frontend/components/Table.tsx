import React from "react";

interface TableProps {
    headers: string[];
    children: React.ReactNode;
}

export function Table({ headers, children }: TableProps) {
    return (
        <div className="w-full overflow-hidden border border-border rounded-lg">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="border-b border-border bg-surface">
                            {headers.map((header, i) => (
                                <th
                                    key={i}
                                    className="py-3 px-4 text-xs font-medium text-text-muted uppercase tracking-wide"
                                >
                                    {header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
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
            className={`hover:bg-surface-hover transition-colors ${className}`}
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
        <td className={`py-3 px-4 text-sm text-text-secondary ${className}`}>
            {children}
        </td>
    );
}
