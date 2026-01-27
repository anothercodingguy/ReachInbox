"use client";

import React from "react";
import { Table, TableRow, TableCell } from "./Table";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { getEmails, Email } from "../lib/api";

export const SentEmailsTable = () => {
    const { data: session } = useSession();
    const userId = (session?.user as any)?.id;

    const { data, isLoading, error } = useQuery({
        queryKey: ["emails", userId, "SENT"],
        queryFn: () => getEmails(userId, "SENT", 1, 50),
        enabled: !!userId,
    });

    if (error) {
        return <div className="text-red-400 p-8 text-center text-sm bg-[#141416]/50 rounded-lg border border-red-900/20">Failed to load emails</div>;
    }

    if (isLoading) {
        return (
            <Table headers={["Recipient", "Subject", "Sent Time", "Status", "View"]}>
                {[1, 2, 3].map((i) => (
                    <TableRow key={i}>
                        <TableCell><div className="h-3 bg-white/5 rounded w-32 animate-pulse"></div></TableCell>
                        <TableCell><div className="h-3 bg-white/5 rounded w-48 animate-pulse"></div></TableCell>
                        <TableCell><div className="h-3 bg-white/5 rounded w-24 animate-pulse"></div></TableCell>
                        <TableCell><div className="h-3 bg-white/5 rounded w-20 animate-pulse"></div></TableCell>
                        <TableCell><div className="h-3 bg-white/5 rounded w-12 animate-pulse"></div></TableCell>
                    </TableRow>
                ))}
            </Table>
        );
    }

    if (!data?.emails.length) {
        return (
            <div className="flex flex-col items-center justify-center p-12 bg-[#141416]/30 border border-white/5 rounded-lg border-dashed">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mb-3">
                    <svg className="w-5 h-5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <p className="text-sm font-medium text-zinc-300">No sent emails</p>
                <p className="text-xs text-zinc-500 mt-1">Delivered campaigns will appear here</p>
            </div>
        );
    }

    return (
        <Table headers={["Recipient", "Subject", "Sent Time", "Status", "View"]}>
            {data.emails.map((email: Email) => {
                const sentDate = email.sentAt ? new Date(email.sentAt) : null;
                const validDate = sentDate && !isNaN(sentDate.getTime());

                return (
                    <TableRow key={email.id}>
                        <TableCell><span className="font-medium text-zinc-200">{email.toEmail}</span></TableCell>
                        <TableCell>{email.subject}</TableCell>
                        <TableCell>
                            <span className="text-xs text-zinc-400 font-mono">
                                {validDate ? format(sentDate!, "MMM d, h:mm a") : "-"}
                            </span>
                        </TableCell>
                        <TableCell>
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/80 shadow-[0_0_8px_rgba(16,185,129,0.4)]"></div>
                                <span className="text-xs font-medium text-emerald-500/90">Sent</span>
                            </div>
                        </TableCell>
                        <TableCell>
                            {email.etherealUrl ? (
                                <a
                                    href={email.etherealUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[11px] font-medium text-zinc-400 hover:text-white transition-colors uppercase tracking-wide flex items-center gap-1 group/link"
                                >
                                    View
                                    <svg className="w-3 h-3 transition-transform group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                </a>
                            ) : (
                                <span className="text-xs text-muted">-</span>
                            )}
                        </TableCell>
                    </TableRow>
                );
            })}
        </Table>
    );
};
