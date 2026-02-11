"use client";

import React from "react";
import { Table, TableRow, TableCell } from "./Table";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { getEmails, Email } from "../lib/api";

export const ScheduledEmailsTable = () => {
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

    const scheduledEmails = emails?.filter(e => e.status === "SCHEDULED") || [];

    if (!scheduledEmails.length) {
        return (
            <div className="flex flex-col items-center justify-center p-12 bg-[#141416]/30 border border-white/5 rounded-lg border-dashed">
                <p className="text-sm font-medium text-zinc-300">No scheduled emails</p>
            </div>
        );
    }

    return (
        <Table headers={["Recipient", "Subject", "Scheduled Time", "Status"]}>
            {scheduledEmails.map((email: Email) => {
                const scheduledDate = new Date(email.scheduledAt);
                const validDate = !isNaN(scheduledDate.getTime());

                return (
                    <TableRow key={email.id}>
                        <TableCell><span className="font-medium text-zinc-200">{email.recipient}</span></TableCell>
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
                    </TableRow>
                );
            })}
        </Table>
    );
};
