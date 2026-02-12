"use client";

import React from "react";
import { SessionProvider } from "next-auth/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 5000,
            refetchOnWindowFocus: false,
        },
    },
});

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <QueryClientProvider client={queryClient}>
                {children}
                <Toaster
                    position="bottom-center"
                    toastOptions={{
                        style: {
                            background: "#1a1a1a",
                            color: "#e5e5e5",
                            border: "1px solid #1e1e1e",
                            fontSize: "14px",
                            borderRadius: "8px",
                        },
                    }}
                />
            </QueryClientProvider>
        </SessionProvider>
    );
}
