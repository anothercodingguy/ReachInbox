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
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
                <div className="space-y-1">
                    <h1 className="text-xl font-medium text-white tracking-tight">Dashboard</h1>
                    <p className="text-sm text-zinc-500">Manage your email campaigns and view results.</p>
                </div>

                <div className="flex items-center gap-4 w-full sm:w-auto">
                    <Button onClick={() => setIsComposeOpen(true)} className="w-full sm:w-auto shadow-lg shadow-indigo-500/20">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        New Campaign
                    </Button>
                </div>
            </div>

            <div className="space-y-6">
                <div className="border-b border-white/5">
                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => setActiveTab("scheduled")}
                            className={`pb-3 text-sm font-medium transition-colors relative ${activeTab === "scheduled"
                                ? "text-white"
                                : "text-zinc-500 hover:text-zinc-300"
                                }`}
                        >
                            Scheduled
                            {activeTab === "scheduled" && (
                                <span className="absolute bottom-0 left-0 w-full h-[1px] bg-indigo-500" />
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab("sent")}
                            className={`pb-3 text-sm font-medium transition-colors relative ${activeTab === "sent"
                                ? "text-white"
                                : "text-zinc-500 hover:text-zinc-300"
                                }`}
                        >
                            Sent
                            {activeTab === "sent" && (
                                <span className="absolute bottom-0 left-0 w-full h-[1px] bg-emerald-500" />
                            )}
                        </button>
                    </div>
                </div>

                <div className="min-h-[400px]">
                    {activeTab === "scheduled" ? (
                        <div className="animate-fade-in">
                            <ScheduledEmailsTable />
                        </div>
                    ) : (
                        <div className="animate-fade-in">
                            <SentEmailsTable />
                        </div>
                    )}
                </div>
            </div>

            <ComposeModal isOpen={isComposeOpen} onClose={() => setIsComposeOpen(false)} />
        </div>
    );
}
