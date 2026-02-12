"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getEmails } from "@/lib/api";
import { EmailRow } from "@/components/EmailRow";
import { ComposeModal } from "@/components/ComposeModal";

export default function DashboardPage() {
    const [view, setView] = useState<"scheduled" | "sent">("scheduled");
    const [isComposeOpen, setIsComposeOpen] = useState(false);

    const { data: emails, isLoading } = useQuery({
        queryKey: ["emails"],
        queryFn: getEmails,
        refetchInterval: 5000,
    });

    const filteredEmails = emails?.filter((e) => {
        if (view === "scheduled") return e.status === "SCHEDULED";
        return e.status === "SENT" || e.status === "FAILED";
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex gap-6">
                    <button
                        onClick={() => setView("scheduled")}
                        className={`text-sm font-medium transition-colors ${view === "scheduled" ? "text-text" : "text-text-muted hover:text-text"
                            }`}
                    >
                        Scheduled
                    </button>
                    <button
                        onClick={() => setView("sent")}
                        className={`text-sm font-medium transition-colors ${view === "sent" ? "text-text" : "text-text-muted hover:text-text"
                            }`}
                    >
                        Sent
                    </button>
                </div>

                <button
                    onClick={() => setIsComposeOpen(true)}
                    className="text-sm text-bg bg-text px-4 py-1.5 rounded-lg font-medium hover:bg-white/90 transition-colors"
                >
                    New email
                </button>
            </div>

            <div className="min-h-[300px]">
                {isLoading ? (
                    <div className="text-sm text-text-muted py-8">Loading...</div>
                ) : filteredEmails && filteredEmails.length > 0 ? (
                    <div>
                        {filteredEmails.map((email) => (
                            <EmailRow key={email.id} email={email} />
                        ))}
                    </div>
                ) : (
                    <div className="text-sm text-text-muted py-12 text-center border border-dashed border-border rounded-lg">
                        {view === "scheduled"
                            ? "No scheduled emails."
                            : "No sent emails yet."}
                    </div>
                )}
            </div>

            <ComposeModal
                isOpen={isComposeOpen}
                onClose={() => setIsComposeOpen(false)}
            />
        </div>
    );
}
