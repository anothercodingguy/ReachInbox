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
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-text-primary">
                        Dashboard
                    </h1>
                    <p className="text-sm text-text-muted mt-0.5">
                        Monitor and manage your email campaigns
                    </p>
                </div>
                <Button onClick={() => setIsComposeOpen(true)}>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    Compose
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard
                    label="Scheduled"
                    value={scheduled}
                    variant="warning"
                    icon={
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    }
                />
                <StatCard
                    label="Delivered"
                    value={sent}
                    variant="success"
                    icon={
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    }
                />
                <StatCard
                    label="Failed"
                    value={failed}
                    variant="danger"
                    icon={
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                        </svg>
                    }
                />
            </div>

            {/* Tabs + Table */}
            <div>
                <div className="flex items-center gap-1 p-1 glass rounded-xl w-fit mb-6">
                    <button
                        onClick={() => setActiveTab("scheduled")}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${activeTab === "scheduled"
                                ? "bg-gradient-to-r from-[var(--color-gradient-start)] to-[var(--color-gradient-end)] text-white shadow-sm"
                                : "text-text-muted hover:text-text-primary"
                            }`}
                    >
                        Scheduled
                    </button>
                    <button
                        onClick={() => setActiveTab("sent")}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${activeTab === "sent"
                                ? "bg-gradient-to-r from-[var(--color-gradient-start)] to-[var(--color-gradient-end)] text-white shadow-sm"
                                : "text-text-muted hover:text-text-primary"
                            }`}
                    >
                        Sent &amp; Failed
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
