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
        return <div className="text-red-400 p-8 text-center text-sm bg-[#141416]/50 rounded-lg border border-red-900/20">Failed to load emails</div>;
    }

    if (isLoading) {
        return (
            <Table headers={["Recipient", "Subject", "Scheduled Time", "Status", "Actions"]}>
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
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <p className="text-sm font-medium text-zinc-300">No scheduled emails yet</p>
                <p className="text-xs text-zinc-500 mt-1">New campaigns will appear here</p>
            </div>
        );
    }

    return (
        <Table headers={["Recipient", "Subject", "Scheduled Time", "Status", "Actions"]}>
            {data.emails.map((email: Email) => {
                const scheduledDate = new Date(email.scheduledAt);
                const validDate = !isNaN(scheduledDate.getTime());

                return (
                    <TableRow key={email.id}>
                        <TableCell><span className="font-medium text-zinc-200">{email.toEmail}</span></TableCell>
                        <TableCell>{email.subject}</TableCell>
                        <TableCell>
                            <span className="text-xs text-zinc-400 font-mono">
                                {validDate ? format(scheduledDate, "MMM d, h:mm a") : "Invalid Date"}
                            </span>
                        </TableCell>
                        <TableCell>
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-yellow-500/80 shadow-[0_0_8px_rgba(234,179,8,0.4)]"></div>
                                <span className="text-xs font-medium text-yellow-500/90">Scheduled</span>
                            </div>
                        </TableCell>
                        <TableCell>
                            <button
                                onClick={() => cancelMutation.mutate(email.id)}
                                disabled={cancelMutation.isPending}
                                className="text-[11px] font-medium text-zinc-500 hover:text-red-400 transition-colors uppercase tracking-wide disabled:opacity-50"
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
