"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Image from "next/image";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/");
        }
    }, [status, router]);

    if (status === "loading" || !session) {
        return null;
    }

    const user = session.user;

    return (
        <div className="min-h-screen bg-bg">
            <header className="border-b border-border bg-bg/80 backdrop-blur-sm sticky top-0 z-10">
                <div className="max-w-2xl mx-auto px-6 h-16 flex items-center justify-between">
                    <span className="text-xl font-serif font-bold text-text tracking-tight">ReachInbox</span>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3">
                            <span className="text-sm text-text-muted hidden sm:inline-block">
                                {user?.email}
                            </span>
                            {user?.image && (
                                <Image
                                    src={user.image}
                                    alt=""
                                    width={24}
                                    height={24}
                                    className="rounded-full bg-bg-raised"
                                />
                            )}
                        </div>
                        <button
                            onClick={() => signOut({ callbackUrl: "/" })}
                            className="text-sm text-text-muted hover:text-text transition-colors"
                        >
                            Log out
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-2xl mx-auto px-6 py-8">
                {children}
            </main>
        </div>
    );
}
