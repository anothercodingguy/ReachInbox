"use client";

import React from "react";
import { Table, TableRow, TableCell } from "./Table";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { getEmails, Email } from "../lib/api";

export const SentEmailsTable = () => {
    const { data: emails, isLoading, error } = useQuery({
        queryKey: ["emails"],
        queryFn: getEmails,
        refetchInterval: 5000,
    });

    if (error) {
        return <div className="text-red-400 p-8 text-center text-sm bg-[#141416]/50 rounded-lg border border-red-900/20">Failed to load emails</div>;
    }

    if (isLoading) {
        return (
            <div className="p-8 text-center text-zinc-500">Loading...</div>
        );
    }

    const sentEmails = emails?.filter(e => e.status === "SENT" || e.status === "FAILED") || [];

    if (!sentEmails.length) {
        return (
            <div className="flex flex-col items-center justify-center p-12 bg-[#141416]/30 border border-white/5 rounded-lg border-dashed">
                <p className="text-sm font-medium text-zinc-300">No sent emails</p>
            </div>
        );
    }

    return (
        <Table headers={["Recipient", "Subject", "Sent Time", "Status"]}>
            {sentEmails.map((email: Email) => {
                const sentDate = email.sentAt ? new Date(email.sentAt) : null;
                const validDate = sentDate && !isNaN(sentDate.getTime());

                return (
                    <TableRow key={email.id}>
                        <TableCell><span className="font-medium text-zinc-200">{email.recipient}</span></TableCell>
                        <TableCell>{email.subject}</TableCell>
                        <TableCell>
                            <span className="text-xs text-zinc-400 font-mono">
                                {validDate ? format(sentDate!, "MMM d, h:mm a") : "-"}
                            </span>
                        </TableCell>
                        <TableCell>
                            {email.status === "SENT" ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/80 shadow-[0_0_8px_rgba(16,185,129,0.4)]"></div>
                                    <span className="text-xs font-medium text-emerald-500/90">Sent</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-red-500/80 shadow-[0_0_8px_rgba(239,68,68,0.4)]"></div>
                                    <span className="text-xs font-medium text-red-500/90">Failed</span>
                                    {email.error && <span className="text-[10px] text-red-400/70 ml-2">({email.error})</span>}
                                </div>
                            )}
                        </TableCell>
                    </TableRow>
                );
            })}
        </Table>
    );
};
