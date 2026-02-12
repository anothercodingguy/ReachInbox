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
            <div className="flex items-end justify-between border-b-2 border-border pb-4">
                <div className="flex gap-8">
                    <button
                        onClick={() => setView("scheduled")}
                        className={`text-lg font-serif transition-colors relative ${view === "scheduled" ? "text-text font-medium" : "text-text-muted hover:text-text cursor-pointer"
                            }`}
                    >
                        Scheduled
                        {view === "scheduled" && (
                            <span className="absolute -bottom-[18px] left-0 right-0 h-0.5 bg-text opacity-80" />
                        )}
                    </button>
                    <button
                        onClick={() => setView("sent")}
                        className={`text-lg font-serif transition-colors relative ${view === "sent" ? "text-text font-medium" : "text-text-muted hover:text-text cursor-pointer"
                            }`}
                    >
                        Sent History
                        {view === "sent" && (
                            <span className="absolute -bottom-[18px] left-0 right-0 h-0.5 bg-text opacity-80" />
                        )}
                    </button>
                </div>

                <button
                    onClick={() => setIsComposeOpen(true)}
                    className="font-hand text-lg text-bg bg-text px-5 py-2 rounded-md hover:bg-black/90 hover:rotate-1 transition-all shadow-sm"
                >
                    + Write new
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
