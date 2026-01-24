"use client";

import { useState } from "react";
import { Button } from "@/components/Button";
import { ComposeModal } from "@/components/ComposeModal";
import { ScheduledEmailsTable } from "@/components/ScheduledEmailsTable";
import { SentEmailsTable } from "@/components/SentEmailsTable";

export default function DashboardPage() {
    const [activeTab, setActiveTab] = useState<"scheduled" | "sent">("scheduled");
    const [isComposeOpen, setIsComposeOpen] = useState(false);

    return (
        <div className="space-y-8 animate-fade-in pb-20">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-8 border-b border-border w-full sm:w-auto">
                    <button
                        onClick={() => setActiveTab("scheduled")}
                        className={`pb-3 text-sm font-medium transition-colors relative ${activeTab === "scheduled"
                                ? "text-primary"
                                : "text-muted hover:text-secondary"
                            }`}
                    >
                        Scheduled
                        {activeTab === "scheduled" && (
                            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-accent rounded-t-full" />
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab("sent")}
                        className={`pb-3 text-sm font-medium transition-colors relative ${activeTab === "sent"
                                ? "text-primary"
                                : "text-muted hover:text-secondary"
                            }`}
                    >
                        Sent
                        {activeTab === "sent" && (
                            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-accent rounded-t-full" />
                        )}
                    </button>
                </div>

                <Button onClick={() => setIsComposeOpen(true)}>
                    + Schedule Email
                </Button>
            </div>

            <div className="min-h-[400px]">
                {activeTab === "scheduled" ? (
                    <div className="space-y-4 animate-fade-in">
                        <ScheduledEmailsTable />
                    </div>
                ) : (
                    <div className="space-y-4 animate-fade-in">
                        <SentEmailsTable />
                    </div>
                )}
            </div>

            <ComposeModal isOpen={isComposeOpen} onClose={() => setIsComposeOpen(false)} />
        </div>
    );
}
