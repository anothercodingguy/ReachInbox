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
                            background: "#ffffff",
                            color: "#2d2a26",
                            border: "1px solid #e6e4dd",
                            fontSize: "14px",
                            borderRadius: "8px",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                        },
                    }}
                />
            </QueryClientProvider>
        </SessionProvider>
    );
}
