"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/Button";
import { StatCard } from "@/components/StatCard";
import { ComposeModal } from "@/components/ComposeModal";
import { ScheduledEmailsTable } from "@/components/ScheduledEmailsTable";
import { SentEmailsTable } from "@/components/SentEmailsTable";
import { getEmails } from "@/lib/api";

export default function DashboardPage() {
    const [activeTab, setActiveTab] = useState<"scheduled" | "sent">(
        "scheduled"
    );
    const [isComposeOpen, setIsComposeOpen] = useState(false);

    const { data: emails } = useQuery({
        queryKey: ["emails"],
        queryFn: getEmails,
        refetchInterval: 5000,
    });

    const scheduled = emails?.filter((e) => e.status === "SCHEDULED").length ?? 0;
    const sent = emails?.filter((e) => e.status === "SENT").length ?? 0;
    const failed = emails?.filter((e) => e.status === "FAILED").length ?? 0;

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-lg font-medium text-text-primary">
                    Dashboard
                </h1>
                <Button onClick={() => setIsComposeOpen(true)}>
                    Compose Email
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                <StatCard label="Scheduled" value={scheduled} />
                <StatCard label="Sent" value={sent} />
                <StatCard label="Failed" value={failed} />
            </div>

            {/* Tabs */}
            <div>
                <div className="flex items-center gap-6 border-b border-border mb-6">
                    <button
                        onClick={() => setActiveTab("scheduled")}
                        className={`pb-3 text-sm transition-colors relative ${activeTab === "scheduled"
                                ? "text-text-primary"
                                : "text-text-muted hover:text-text-secondary"
                            }`}
                    >
                        Scheduled
                        {activeTab === "scheduled" && (
                            <span className="absolute bottom-0 left-0 w-full h-px bg-text-primary" />
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab("sent")}
                        className={`pb-3 text-sm transition-colors relative ${activeTab === "sent"
                                ? "text-text-primary"
                                : "text-text-muted hover:text-text-secondary"
                            }`}
                    >
                        Sent &amp; Failed
                        {activeTab === "sent" && (
                            <span className="absolute bottom-0 left-0 w-full h-px bg-text-primary" />
                        )}
                    </button>
                </div>

                {activeTab === "scheduled" ? (
                    <ScheduledEmailsTable />
                ) : (
                    <SentEmailsTable />
                )}
            </div>

            <ComposeModal
                isOpen={isComposeOpen}
                onClose={() => setIsComposeOpen(false)}
            />
        </div>
    );
}
