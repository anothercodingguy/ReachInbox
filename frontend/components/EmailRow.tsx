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
        <div className="flex items-center justify-between py-4 px-1 border-b border-border last:border-0 group">
            <div className="min-w-0 flex-1">
                <p className="text-[15px] text-text font-medium truncate">
                    {email.subject}
                </p>
                <p className="text-sm text-text-muted mt-0.5 truncate">
                    {email.recipient}
                </p>
            </div>

            <div className="flex items-center gap-5 ml-6 shrink-0">
                {/* Time */}
                <span className="text-sm text-text-muted tabular-nums hidden sm:block">
                    {email.status === "SENT" && validSent
                        ? format(sentDate!, "MMM d, h:mm a")
                        : validScheduled
                            ? format(scheduledDate, "MMM d, h:mm a")
                            : "—"}
                </span>

                {/* Status */}
                <div className="flex items-center gap-2">
                    <span
                        className={`w-1.5 h-1.5 rounded-full ${email.status === "SCHEDULED"
                                ? "bg-yellow"
                                : email.status === "SENT"
                                    ? "bg-green"
                                    : "bg-red"
                            }`}
                    />
                    <span
                        className={`text-xs font-medium ${email.status === "SCHEDULED"
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
