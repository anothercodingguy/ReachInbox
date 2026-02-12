"use client";

import { format } from "date-fns";
import { Email } from "@/lib/api";

interface EmailRowProps {
    email: Email;
}

export function EmailRow({ email }: EmailRowProps) {
    const scheduledDate = new Date(email.scheduledAt);
    const validScheduled = !isNaN(scheduledDate.getTime());
    const sentDate = email.sentAt ? new Date(email.sentAt) : null;
    const validSent = sentDate && !isNaN(sentDate.getTime());

    return (
        <div className="paper-card rounded-lg p-4 mb-3 flex items-start justify-between group cursor-default">
            <div className="min-w-0 flex-1">
                <p className="text-lg text-text font-serif font-medium truncate group-hover:text-black transition-colors">
                    {email.subject}
                </p>
                <p className="text-sm text-text-muted mt-1 truncate font-hand text-[15px]">
                    to {email.recipient}
                </p>
            </div>

            <div className="flex flex-col items-end gap-2 ml-6 shrink-0">
                {/* Time */}
                <span className="text-xs text-text-muted tabular-nums uppercase tracking-wider font-medium">
                    {email.status === "SENT" && validSent
                        ? format(sentDate!, "MMM d, h:mm a")
                        : validScheduled
                            ? format(scheduledDate, "MMM d, h:mm a")
                            : "—"}
                </span>

                {/* Status */}
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full border border-border bg-bg/50">
                    <span
                        className={`w-1.5 h-1.5 rounded-full ${email.status === "SCHEDULED"
                                ? "bg-yellow"
                                : email.status === "SENT"
                                    ? "bg-green"
                                    : "bg-red"
                            }`}
                    />
                    <span
                        className={`text-[10px] font-bold uppercase tracking-widest ${email.status === "SCHEDULED"
                                ? "text-yellow"
                                : email.status === "SENT"
                                    ? "text-green"
                                    : "text-red"
                            }`}
                    >
                        {email.status === "SCHEDULED"
                            ? "Scheduled"
                            : email.status === "SENT"
                                ? "Sent"
                                : "Failed"}
                    </span>
                </div>
            </div>
        </div>
    );
}
