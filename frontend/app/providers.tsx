"use client";

import { SessionProvider } from "next-auth/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "@/components/ThemeProvider";
import { useState } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        staleTime: 30 * 1000,
                        refetchOnWindowFocus: false,
                    },
                },
            })
    );

    return (
        <ThemeProvider>
            <SessionProvider>
                <QueryClientProvider client={queryClient}>
                    {children}
                    <Toaster
                        position="top-right"
                        toastOptions={{
                            duration: 3000,
                            style: {
                                background: "var(--color-surface)",
                                color: "var(--color-text-primary)",
                                border: "1px solid var(--color-border)",
                                fontSize: "13px",
                            },
                        }}
                    />
                </QueryClientProvider>
            </SessionProvider>
        </ThemeProvider>
    );
}
