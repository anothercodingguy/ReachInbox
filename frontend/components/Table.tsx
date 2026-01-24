import React from "react";

interface TableProps {
    headers: string[];
    children: React.ReactNode;
}

export const Table: React.FC<TableProps> = ({ headers, children }) => {
    return (
        <div className="w-full overflow-x-auto">
            <table className="w-full text-left text-sm">
                <thead>
                    <tr className="border-b border-border">
                        {headers.map((header, index) => (
                            <th
                                key={index}
                                className="py-3 px-4 font-medium text-muted uppercase tracking-wider text-xs"
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
    );
};

export const TableRow: React.FC<{ children: React.ReactNode; className?: string }> = ({
    children,
    className = "",
}) => {
    return (
        <tr className={`group hover:bg-card/50 transition-colors ${className}`}>
            {children}
        </tr>
    );
};

export const TableCell: React.FC<{ children: React.ReactNode; className?: string }> = ({
    children,
    className = "",
}) => {
    return (
        <td className={`py-3 px-4 text-secondary group-hover:text-primary transition-colors ${className}`}>
            {children}
        </td>
    );
};
