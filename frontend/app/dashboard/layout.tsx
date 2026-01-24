import Link from "next/link";

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

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-sm text-secondary">
                            <span className="w-6 h-6 rounded-full bg-card border border-border flex items-center justify-center text-xs">
                                U
                            </span>
                            <span className="hidden sm:inline-block">user@example.com</span>
                        </div>
                        {/* Logout functionality would go here - visually represented */}
                        <button className="text-sm text-muted hover:text-primary transition-colors">
                            Logout
                        </button>
                    </div>
                </div>
            </header>
            <main className="flex-1 w-full max-w-6xl mx-auto p-6">
                {children}
            </main>
        </div>
    );
}
