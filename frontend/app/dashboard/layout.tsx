"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Image from "next/image";
import { useTheme } from "@/components/ThemeProvider";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const { theme, toggle } = useTheme();

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/");
        }
    }, [status, router]);

    if (status === "loading") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-bg">
                <p className="text-sm text-text-muted">Loading...</p>
            </div>
        );
    }

    if (!session) {
        return null;
    }

    const user = session.user;

    return (
        <div className="min-h-screen flex flex-col bg-bg">
            <header className="sticky top-0 z-40 w-full border-b border-border bg-bg">
                <div className="flex h-14 items-center justify-between px-6 max-w-5xl mx-auto w-full">
                    <span className="text-sm font-medium text-text-primary">
                        ReachInbox
                    </span>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={toggle}
                            className="p-1.5 rounded-md text-text-muted hover:text-text-primary hover:bg-surface-hover transition-colors"
                            title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
                        >
                            {theme === "dark" ? (
                                <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={1.5}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
                                    />
                                </svg>
                            ) : (
                                <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={1.5}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"
                                    />
                                </svg>
                            )}
                        </button>

                        <div className="flex items-center gap-3">
                            {user?.image && (
                                <Image
                                    src={user.image}
                                    alt=""
                                    width={28}
                                    height={28}
                                    className="rounded-full"
                                />
                            )}
                            <div className="hidden sm:block">
                                <p className="text-sm text-text-primary leading-none">
                                    {user?.name}
                                </p>
                                <p className="text-xs text-text-muted mt-0.5">
                                    {user?.email}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => signOut({ callbackUrl: "/" })}
                            className="text-xs text-text-muted hover:text-text-primary transition-colors"
                        >
                            Sign out
                        </button>
                    </div>
                </div>
            </header>
            <main className="flex-1 w-full max-w-5xl mx-auto px-6 py-8">
                {children}
            </main>
        </div>
    );
}
