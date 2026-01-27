import React from "react";

interface TableProps {
    headers: string[];
    children: React.ReactNode;
}

export const Table: React.FC<TableProps> = ({ headers, children }) => {
    return (
        <div className="w-full overflow-hidden border border-white/5 rounded-lg bg-[#141416]/50">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="border-b border-white/5 bg-white/[0.02]">
                            {headers.map((header, index) => (
                                <th
                                    key={index}
                                    className="py-3 px-4 font-medium text-zinc-500 uppercase tracking-wider text-[11px]"
                                >
                                    {header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {children}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export const TableRow: React.FC<{ children: React.ReactNode; className?: string }> = ({
    children,
    className = "",
}) => {
    return (
        <tr className={`group hover:bg-white/[0.02] transition-colors ${className}`}>
            {children}
        </tr>
    );
};

export const TableCell: React.FC<{ children: React.ReactNode; className?: string }> = ({
    children,
    className = "",
}) => {
    return (
        <td className={`py-3.5 px-4 text-zinc-300 group-hover:text-zinc-100 transition-colors ${className}`}>
            {children}
        </td>
    );
};
