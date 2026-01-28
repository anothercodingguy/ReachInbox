"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LoginPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (session) {
            router.push("/dashboard");
        }
    }, [session, router]);

    if (status === "loading") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0B0B0C]">
                <div className="animate-pulse flex flex-col items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#141416] border border-white/10"></div>
                </div>
            </div>
        );
    }

    return (
        <main className="min-h-screen relative overflow-hidden bg-[#0B0B0C] flex flex-col items-center justify-center p-4">
            {/* Background Mesh (Optional/Subtle) */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-indigo-500/5 blur-[100px] rounded-full mix-blend-screen"></div>
            </div>

            <div className="relative z-10 w-full max-w-sm flex flex-col items-center">
                {/* Logo */}
                <div className="mb-8 text-center animate-fade-in">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#141416] border border-white/10 mb-6 shadow-card">
                        <span className="text-2xl text-indigo-500">◆</span>
                    </div>
                    <h1 className="text-2xl font-medium text-white mb-2 tracking-tight">
                        ReachInbox
                    </h1>
                    <p className="text-sm text-zinc-500">
                        Automation for modern outreach
                    </p>
                </div>

                {/* Login Card */}
                <div className="w-full bg-[#141416] border border-white/10 rounded-xl shadow-2xl p-6 animate-slide-up">
                    <div className="space-y-4">
                        <button
                            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
                            className="w-full flex items-center justify-center gap-3 px-4 py-2.5 bg-white text-black hover:bg-zinc-200 rounded-lg text-sm font-medium transition-all duration-200 shadow hover:shadow-lg"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path
                                    fill="currentColor"
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                />
                                <path
                                    fill="currentColor"
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                />
                                <path
                                    fill="currentColor"
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                />
                                <path
                                    fill="currentColor"
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                />
                            </svg>
                            Continue with Google
                        </button>
                    </div>

                    <p className="mt-6 text-center text-xs text-zinc-600">
                        By continuing, you agree to our Terms of Service
                    </p>
                </div>

                {/* Footer/Features */}
                <div className="mt-12 grid grid-cols-3 gap-8 w-full px-4">
                    <div className="text-center group cursor-default">
                        <div className="w-8 h-8 mx-auto mb-2 text-zinc-600 group-hover:text-zinc-400 transition-colors">
                            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <p className="text-[10px] uppercase tracking-wider font-medium text-zinc-600 group-hover:text-zinc-400 transition-colors">Schedule</p>
                    </div>
                    <div className="text-center group cursor-default">
                        <div className="w-8 h-8 mx-auto mb-2 text-zinc-600 group-hover:text-zinc-400 transition-colors">
                            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                            </svg>
                        </div>
                        <p className="text-[10px] uppercase tracking-wider font-medium text-zinc-600 group-hover:text-zinc-400 transition-colors">Upload</p>
                    </div>
                    <div className="text-center group cursor-default">
                        <div className="w-8 h-8 mx-auto mb-2 text-zinc-600 group-hover:text-zinc-400 transition-colors">
                            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        </div>
                        <p className="text-[10px] uppercase tracking-wider font-medium text-zinc-600 group-hover:text-zinc-400 transition-colors">Track</p>
                    </div>
                </div>
            </div>
        </main>
    );
}
