"use client";

import { useSession } from "next-auth/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { getEmails, cancelEmail, Email } from "../../../lib/api";
import Link from "next/link";

export default function ScheduledPage() {
    const { data: session } = useSession();
    const queryClient = useQueryClient();
    const userId = (session?.user as any)?.id;

    const { data, isLoading, error } = useQuery({
        queryKey: ["emails", userId, "SCHEDULED"],
        queryFn: () => getEmails(userId, "SCHEDULED", 1, 50),
        enabled: !!userId,
        refetchInterval: 5000, // Refresh every 5 seconds to catch status changes
    });

    const cancelMutation = useMutation({
        mutationFn: (emailId: string) => cancelEmail(userId, emailId),
        onSuccess: () => {
            toast.success("Email cancelled");
            queryClient.invalidateQueries({ queryKey: ["emails"] });
            queryClient.invalidateQueries({ queryKey: ["email-stats"] });
        },
        onError: (error: Error) => {
            toast.error(error.message || "Failed to cancel email");
        },
    });

    if (error) {
        return (
            <div className="card p-8 text-center">
                <p className="text-red-500">Failed to load emails</p>
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Scheduled Emails
                    </h1>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">
                        Emails waiting to be sent
                    </p>
                </div>
                <Link href="/dashboard/compose" className="btn-primary">
                    + New Email
                </Link>
            </div>

            {isLoading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="card p-4 animate-pulse">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : data?.emails.length === 0 ? (
                <EmptyState />
            ) : (
                <div className="space-y-4">
                    {data?.emails.map((email) => (
                        <EmailCard
                            key={email.id}
                            email={email}
                            onCancel={() => cancelMutation.mutate(email.id)}
                            isCancelling={cancelMutation.isPending}
                        />
                    ))}
                </div>
            )}

            {data && data.pagination.totalPages > 1 && (
                <div className="mt-6 text-center text-sm text-gray-500">
                    Showing {data.emails.length} of {data.pagination.total} emails
                </div>
            )}
        </div>
    );
}

function EmailCard({
    email,
    onCancel,
    isCancelling,
}: {
    email: Email;
    onCancel: () => void;
    isCancelling: boolean;
}) {
    const scheduledDate = new Date(email.scheduledAt);
    const isUpcoming = scheduledDate.getTime() - Date.now() < 60000; // Less than 1 minute

    return (
        <div className="card p-4 hover:shadow-lg transition-shadow">
            <div className="flex items-start gap-4">
                <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${isUpcoming
                        ? "bg-yellow-100 text-yellow-600"
                        : "bg-blue-100 text-blue-600"
                        }`}
                >
                    <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                    </svg>
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                            <p className="font-medium text-gray-900 dark:text-white truncate">
                                {email.subject}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                To: {email.toEmail}
                            </p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="badge-scheduled">Scheduled</span>
                            <button
                                onClick={onCancel}
                                disabled={isCancelling}
                                className="btn-ghost text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 px-2 py-1 text-sm"
                            >
                                {isCancelling ? "Cancelling..." : "Cancel"}
                            </button>
                        </div>
                    </div>

                    <div className="mt-2 flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                            <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                            </svg>
                            {format(scheduledDate, "MMM d, yyyy 'at' h:mm a")}
                        </span>
                        {isUpcoming && (
                            <span className="text-yellow-600 dark:text-yellow-400 font-medium">
                                Sending soon!
                            </span>
                        )}
                    </div>

                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {email.body.replace(/<[^>]*>/g, "").substring(0, 150)}...
                    </p>
                </div>
            </div>
        </div>
    );
}

function EmptyState() {
    return (
        <div className="card p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <svg
                    className="w-8 h-8 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                    />
                </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No scheduled emails
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
                You don&apos;t have any emails scheduled. Create one to get started!
            </p>
            <Link href="/dashboard/compose" className="btn-primary">
                Compose Email
            </Link>
        </div>
    );
}
