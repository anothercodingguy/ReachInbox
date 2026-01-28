"use client";

import { useState } from "react";
import { Button } from "@/components/Button";
import { ComposeModal } from "@/components/ComposeModal";
import { ScheduledEmailsTable } from "@/components/ScheduledEmailsTable";
import { SentEmailsTable } from "@/components/SentEmailsTable";
import { useQuery } from "@tanstack/react-query";
import { getEmailStats } from "@/lib/api";
import { useSession } from "next-auth/react";

export default function DashboardPage() {
    const { data: session } = useSession();
    const [activeTab, setActiveTab] = useState<"scheduled" | "sent">("scheduled");
    const [isComposeOpen, setIsComposeOpen] = useState(false);

    const userId = (session?.user as any)?.id;

    const { data: stats } = useQuery({
        queryKey: ["email-stats", userId],
        queryFn: () => getEmailStats(userId),
        enabled: !!userId,
        refetchInterval: 10000,
    });

    return (
        <div className="space-y-12 animate-fade-in pb-20 max-w-5xl mx-auto">
            {/* Overview Section */}
            <div className="grid grid-cols-3 gap-4">
                <div className="p-6 rounded-xl bg-[#141416] border border-white/5 flex flex-col gap-1">
                    <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Scheduled</span>
                    <span className="text-3xl font-medium text-white">{stats?.scheduled || 0}</span>
                </div>
                <div className="p-6 rounded-xl bg-[#141416] border border-white/5 flex flex-col gap-1">
                    <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Sent</span>
                    <span className="text-3xl font-medium text-white">{stats?.sent || 0}</span>
                </div>
                <div className="p-6 rounded-xl bg-[#141416] border border-white/5 flex flex-col gap-1">
                    <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Failed</span>
                    <span className="text-3xl font-medium text-white">{stats?.failed || 0}</span>
                </div>
            </div>

            {/* Primary Action */}
            <div>
                <Button
                    onClick={() => setIsComposeOpen(true)}
                    className="h-12 px-8 text-base bg-white text-black hover:bg-zinc-200 border-none shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                >
                    Compose Email
                </Button>
            </div>

            {/* Content Area */}
            <div className="space-y-6">
                <div className="border-b border-white/5">
                    <div className="flex items-center gap-8">
                        <button
                            onClick={() => setActiveTab("scheduled")}
                            className={`pb-4 text-sm font-medium transition-colors relative ${activeTab === "scheduled"
                                ? "text-white"
                                : "text-zinc-500 hover:text-zinc-300"
                                }`}
                        >
                            Scheduled
                            {activeTab === "scheduled" && (
                                <span className="absolute bottom-0 left-0 w-full h-[1px] bg-white" />
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab("sent")}
                            className={`pb-4 text-sm font-medium transition-colors relative ${activeTab === "sent"
                                ? "text-white"
                                : "text-zinc-500 hover:text-zinc-300"
                                }`}
                        >
                            Sent
                            {activeTab === "sent" && (
                                <span className="absolute bottom-0 left-0 w-full h-[1px] bg-white" />
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
