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
            <div className="flex items-center justify-center py-16">
                <div className="flex items-center gap-3 text-text-muted">
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <span className="text-sm">Loading emails...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center py-16">
                <div className="flex items-center gap-2 text-danger">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                    </svg>
                    <span className="text-sm font-medium">Failed to load emails</span>
                </div>
            </div>
        );
    }

    const scheduled =
        emails?.filter((e) => e.status === "SCHEDULED") ?? [];

    if (scheduled.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-12 h-12 rounded-2xl bg-accent-subtle flex items-center justify-center mb-3">
                    <svg className="w-6 h-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <p className="text-sm font-medium text-text-secondary">No scheduled emails</p>
                <p className="text-xs text-text-muted mt-1">Schedule your first email to get started</p>
            </div>
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
                            <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-warning-glow">
                                <span className="w-1.5 h-1.5 rounded-full bg-warning animate-pulse-glow" />
                                <span className="text-xs font-medium text-warning">
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
