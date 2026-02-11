"use client";

import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { getEmails, Email } from "@/lib/api";
import { Table, TableRow, TableCell } from "./Table";

export function ScheduledEmailsTable() {
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

    const scheduled =
        emails?.filter((e) => e.status === "SCHEDULED") ?? [];

    if (scheduled.length === 0) {
        return (
            <p className="text-sm text-text-muted py-8 text-center">
                No scheduled emails
            </p>
        );
    }

    return (
        <Table headers={["Recipient", "Subject", "Scheduled", "Status"]}>
            {scheduled.map((email: Email) => {
                const d = new Date(email.scheduledAt);
                const valid = !isNaN(d.getTime());

                return (
                    <TableRow key={email.id}>
                        <TableCell className="text-text-primary font-medium">
                            {email.recipient}
                        </TableCell>
                        <TableCell>{email.subject}</TableCell>
                        <TableCell className="tabular-nums">
                            {valid
                                ? format(d, "MMM d, h:mm a")
                                : "—"}
                        </TableCell>
                        <TableCell>
                            <span className="inline-flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-warning" />
                                <span className="text-xs text-warning">
                                    Scheduled
                                </span>
                            </span>
                        </TableCell>
                    </TableRow>
                );
            })}
        </Table>
    );
}
