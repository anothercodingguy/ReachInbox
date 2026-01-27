import Link from "next/link";
import { UserHeader } from "@/components/UserHeader";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen flex flex-col">
            <header className="sticky top-0 z-40 w-full border-b border-white/5 bg-background/80 backdrop-blur-md">
                <div className="flex h-14 items-center justify-between px-6 max-w-6xl mx-auto w-full">
                    <div className="flex items-center gap-2 font-semibold text-lg text-white">
                        ReachInbox
                    </div>

                    <UserHeader />
                </div>
            </header>
            <main className="flex-1 w-full max-w-6xl mx-auto p-6">
                {children}
            </main>
        </div>
    );
}
