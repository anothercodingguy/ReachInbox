"use client";

import { signOut, useSession } from "next-auth/react";
import React from "react";

export const UserHeader = () => {
    const { data: session } = useSession();
    const user = session?.user;

    return (
        <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
                {user?.image ? (
                    <img
                        src={user.image}
                        alt={user.name || "User"}
                        className="w-8 h-8 rounded-full border border-white/10"
                    />
                ) : (
                    <span className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-xs font-medium text-indigo-400">
                        {user?.name?.[0]?.toUpperCase() || "U"}
                    </span>
                )}
                <div className="hidden sm:flex flex-col">
                    <span className="text-sm font-medium text-zinc-200 leading-none">
                        {user?.name || "User"}
                    </span>
                </div>
            </div>
            <div className="h-4 w-[1px] bg-white/10 mx-2"></div>
            <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="text-xs font-medium text-zinc-500 hover:text-white transition-colors uppercase tracking-wide"
            >
                Logout
            </button>
        </div>
    );
};
