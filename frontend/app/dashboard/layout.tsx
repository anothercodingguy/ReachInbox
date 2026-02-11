"use client";

import { signOut } from "next-auth/react";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen flex flex-col bg-[#0B0B0C]">
            <header className="sticky top-0 z-40 w-full border-b border-white/5 bg-[#0B0B0C]/80 backdrop-blur-md">
                <div className="flex h-14 items-center justify-between px-6 max-w-6xl mx-auto w-full">
                    <div className="flex items-center gap-2 font-medium text-sm text-zinc-400 hover:text-white transition-colors cursor-default">
                        <span className="text-indigo-500">◆</span> ReachInbox
                    </div>

                    <button
                        onClick={() => signOut()}
                        className="text-xs text-zinc-500 hover:text-white transition-colors"
                    >
                        Sign Out
                    </button>
                </div>
            </header>
            <main className="flex-1 w-full max-w-6xl mx-auto p-6 md:p-8">
                {children}
            </main>
        </div>
    );
}
