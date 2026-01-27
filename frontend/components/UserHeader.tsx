"use client";

import { signOut, useSession } from "next-auth/react";
import React from "react";

export const UserHeader = () => {
    const { data: session } = useSession();
    const user = session?.user;

    return (
        <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 text-sm text-secondary">
                {user?.image ? (
                    <img
                        src={user.image}
                        alt={user.name || "User"}
                        className="w-8 h-8 rounded-full border border-border"
                    />
                ) : (
                    <span className="w-8 h-8 rounded-full bg-card border border-border flex items-center justify-center text-xs font-medium text-primary">
                        {user?.name?.[0]?.toUpperCase() || "U"}
                    </span>
                )}
                <div className="hidden sm:flex flex-col">
                    <span className="text-white font-medium leading-none">
                        {user?.name || "User"}
                    </span>
                    <span className="text-xs text-muted mt-1">
                        {user?.email || ""}
                    </span>
                </div>
            </div>
            <div className="h-4 w-[1px] bg-white/10 mx-1"></div>
            <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="text-sm font-medium text-muted hover:text-red-400 transition-colors"
            >
                Logout
            </button>
        </div>
    );
};
