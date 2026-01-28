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
        <main className="min-h-screen relative bg-[#0B0B0C] flex flex-col items-center justify-center p-6">
            <div className="w-full max-w-sm flex flex-col items-center justify-center space-y-8 animate-fade-in text-center">

                <div className="space-y-4">
                    <h1 className="text-3xl md:text-4xl font-medium tracking-tight text-white">
                        ReachInbox
                    </h1>
                    <p className="text-base text-zinc-500 font-normal">
                        The minimal email scheduling platform for developers.
                    </p>
                </div>

                <div className="w-full pt-4">
                    <button
                        onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
                        className="group w-full flex items-center justify-center gap-3 px-5 py-3 bg-white text-black hover:bg-zinc-200 rounded-full text-sm font-medium transition-all duration-200"
                    >
                        <span>Continue with Google</span>
                        <span className="opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all text-lg leading-none">→</span>
                    </button>
                </div>
            </div>

            <div className="absolute bottom-6 text-xs text-zinc-800 font-mono">
                PRESS ENTER TO START
            </div>
        </main>
    );
}
