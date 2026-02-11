"use client";

import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { getEmails, Email } from "@/lib/api";
import { Table, TableRow, TableCell } from "./Table";

export function SentEmailsTable() {
    const { data: emails, isLoading, error } = useQuery({
        queryKey: ["emails"],
        queryFn: getEmails,
        refetchInterval: 5000,
    });

    if (isLoading) {
        return (
            <p className="text-sm text-text-muted py-8 text-center">
                Loading...
            </p>
        );
    }

    if (error) {
        return (
            <p className="text-sm text-danger py-8 text-center">
                Failed to load emails
            </p>
        );
    }

    const sentOrFailed =
        emails?.filter(
            (e) => e.status === "SENT" || e.status === "FAILED"
        ) ?? [];

    if (sentOrFailed.length === 0) {
        return (
            <p className="text-sm text-text-muted py-8 text-center">
                No sent emails yet
            </p>
        );
    }

    return (
        <Table headers={["Recipient", "Subject", "Sent", "Status"]}>
            {sentOrFailed.map((email: Email) => {
                const d = email.sentAt ? new Date(email.sentAt) : null;
                const valid = d && !isNaN(d.getTime());

                return (
                    <TableRow key={email.id}>
                        <TableCell className="text-text-primary font-medium">
                            {email.recipient}
                        </TableCell>
                        <TableCell>{email.subject}</TableCell>
                        <TableCell className="tabular-nums">
                            {valid ? format(d!, "MMM d, h:mm a") : "—"}
                        </TableCell>
                        <TableCell>
                            {email.status === "SENT" ? (
                                <span className="inline-flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-success" />
                                    <span className="text-xs text-success">
                                        Sent
                                    </span>
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-danger" />
                                    <span className="text-xs text-danger">
                                        Failed
                                    </span>
                                    {email.error && (
                                        <span className="text-[11px] text-text-muted ml-1">
                                            ({email.error})
                                        </span>
                                    )}
                                </span>
                            )}
                        </TableCell>
                    </TableRow>
                );
            })}
        </Table>
    );
}
