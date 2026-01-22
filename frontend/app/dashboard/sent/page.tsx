"use client";

import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { getEmails, Email } from "@/lib/api";
import Link from "next/link";

export default function SentPage() {
    const { data: session } = useSession();
    const userId = (session?.user as any)?.id;

    const { data, isLoading, error } = useQuery({
        queryKey: ["emails", userId, "SENT"],
        queryFn: () => getEmails(userId, "SENT", 1, 50),
        enabled: !!userId,
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
                        Sent Emails
                    </h1>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">
                        Successfully delivered emails
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
                        <EmailCard key={email.id} email={email} />
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

function EmailCard({ email }: { email: Email }) {
    const sentDate = email.sentAt ? new Date(email.sentAt) : null;

    return (
        <div className="card p-4 hover:shadow-lg transition-shadow">
            <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0">
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
                            d="M5 13l4 4L19 7"
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
                            <span className="badge-sent">Sent</span>
                            {email.etherealUrl && (
                                <a
                                    href={email.etherealUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn-ghost text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 px-2 py-1 text-sm flex items-center gap-1"
                                >
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
                                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                        />
                                    </svg>
                                    View
                                </a>
                            )}
                        </div>
                    </div>

                    <div className="mt-2 flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                        {sentDate && (
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
                                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                                Sent {format(sentDate, "MMM d, yyyy 'at' h:mm a")}
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
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No sent emails yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
                When your scheduled emails are delivered, they&apos;ll appear here.
            </p>
            <Link href="/dashboard/scheduled" className="btn-secondary">
                View Scheduled
            </Link>
        </div>
    );
}
