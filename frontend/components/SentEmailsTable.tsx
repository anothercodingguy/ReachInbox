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
        return <div className="text-red-500 p-4">Failed to load emails</div>;
    }

    if (isLoading) {
        return (
            <Table headers={["Recipient", "Subject", "Sent Time", "Status"]}>
                {[1, 2, 3].map((i) => (
                    <TableRow key={i}>
                        <TableCell><div className="h-4 bg-white/10 rounded w-32 animate-pulse"></div></TableCell>
                        <TableCell><div className="h-4 bg-white/10 rounded w-48 animate-pulse"></div></TableCell>
                        <TableCell><div className="h-4 bg-white/10 rounded w-24 animate-pulse"></div></TableCell>
                        <TableCell><div className="h-4 bg-white/10 rounded w-20 animate-pulse"></div></TableCell>
                    </TableRow>
                ))}
            </Table>
        );
    }

    if (!data?.emails.length) {
        return <div className="text-muted p-4 text-center">No sent emails yet.</div>;
    }

    return (
        <Table headers={["Recipient", "Subject", "Sent Time", "Status", "View"]}>
            {data.emails.map((email: Email) => {
                const sentDate = email.sentAt ? new Date(email.sentAt) : null;
                const validDate = sentDate && !isNaN(sentDate.getTime());

                return (
                    <TableRow key={email.id}>
                        <TableCell>{email.toEmail}</TableCell>
                        <TableCell>{email.subject}</TableCell>
                        <TableCell>
                            {validDate ? format(sentDate!, "MMM d, h:mm a") : "-"}
                        </TableCell>
                        <TableCell>
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-green-500/50"></span>
                                <span className="text-xs text-muted">Sent</span>
                            </div>
                        </TableCell>
                        <TableCell>
                            {email.etherealUrl ? (
                                <a
                                    href={email.etherealUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-primary hover:underline"
                                >
                                    Open
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
