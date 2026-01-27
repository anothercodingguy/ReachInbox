"use client";

import React from "react";
import { Table, TableRow, TableCell } from "./Table";
import { useSession } from "next-auth/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { getEmails, cancelEmail, Email } from "../lib/api";

export const ScheduledEmailsTable = () => {
    const { data: session } = useSession();
    const queryClient = useQueryClient();
    const userId = (session?.user as any)?.id;

    const { data, isLoading, error } = useQuery({
        queryKey: ["emails", userId, "SCHEDULED"],
        queryFn: () => getEmails(userId, "SCHEDULED", 1, 50),
        enabled: !!userId,
        refetchInterval: 5000,
    });

    const cancelMutation = useMutation({
        mutationFn: (emailId: string) => cancelEmail(userId, emailId),
        onSuccess: () => {
            toast.success("Email cancelled");
            queryClient.invalidateQueries({ queryKey: ["emails"] });
            queryClient.invalidateQueries({ queryKey: ["email-stats"] });
        },
        onError: (error: Error) => {
            toast.error(error.message || "Failed to cancel email");
        },
    });

    if (error) {
        return <div className="text-red-500 p-4">Failed to load emails</div>;
    }

    if (isLoading) {
        return (
            <Table headers={["Recipient", "Subject", "Scheduled Time", "Status"]}>
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
        return <div className="text-muted p-4 text-center">No scheduled emails.</div>;
    }

    return (
        <Table headers={["Recipient", "Subject", "Scheduled Time", "Status", "Actions"]}>
            {data.emails.map((email: Email) => {
                const scheduledDate = new Date(email.scheduledAt);
                // Check if date is valid
                const validDate = !isNaN(scheduledDate.getTime());

                return (
                    <TableRow key={email.id}>
                        <TableCell>{email.toEmail}</TableCell>
                        <TableCell>{email.subject}</TableCell>
                        <TableCell>
                            {validDate ? format(scheduledDate, "MMM d, h:mm a") : "Invalid Date"}
                        </TableCell>
                        <TableCell>
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-yellow-500/50"></span>
                                <span className="text-xs">Scheduled</span>
                            </div>
                        </TableCell>
                        <TableCell>
                            <button
                                onClick={() => cancelMutation.mutate(email.id)}
                                disabled={cancelMutation.isPending}
                                className="text-xs text-red-400 hover:text-red-300 disabled:opacity-50"
                            >
                                {cancelMutation.isPending ? "Cancelling..." : "Cancel"}
                            </button>
                        </TableCell>
                    </TableRow>
                );
            })}
        </Table>
    );
};
