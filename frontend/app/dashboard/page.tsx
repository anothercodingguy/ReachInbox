"use client";

import { useState } from "react";
import { Button } from "@/components/Button";
import { ComposeModal } from "@/components/ComposeModal";
import { ScheduledEmailsTable } from "@/components/ScheduledEmailsTable";
import { SentEmailsTable } from "@/components/SentEmailsTable";
import { useSession } from "next-auth/react";

export default function DashboardPage() {
    const { data: session } = useSession();
    const [activeTab, setActiveTab] = useState<"scheduled" | "sent">("scheduled");
    const [isComposeOpen, setIsComposeOpen] = useState(false);

    return (
        <div className="space-y-12 animate-fade-in pb-20 max-w-5xl mx-auto pt-10">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-white">Dashboard</h1>
                    <p className="text-zinc-500">Welcome back, {session?.user?.name || "User"}</p>
                </div>
                <Button
                    onClick={() => setIsComposeOpen(true)}
                    className="h-10 px-6 bg-white text-black hover:bg-zinc-200"
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
                            Scheduled Emails
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
                            Sent Emails
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
