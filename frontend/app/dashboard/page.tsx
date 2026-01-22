"use client";

import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { getEmailStats } from "@/lib/api";

export default function DashboardPage() {
    const { data: session } = useSession();
    const userId = (session?.user as any)?.id;

    const { data: stats, isLoading } = useQuery({
        queryKey: ["email-stats", userId],
        queryFn: () => getEmailStats(userId),
        enabled: !!userId,
        refetchInterval: 10000, // Refresh every 10 seconds
    });

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Welcome back, {session?.user?.name?.split(" ")[0]}! 👋
                </h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                    Here&apos;s an overview of your email campaigns
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <StatCard
                    title="Scheduled"
                    value={stats?.scheduled ?? 0}
                    icon={<ClockIcon />}
                    color="blue"
                    isLoading={isLoading}
                />
                <StatCard
                    title="Processing"
                    value={stats?.processing ?? 0}
                    icon={<SpinnerIcon />}
                    color="yellow"
                    isLoading={isLoading}
                />
                <StatCard
                    title="Sent"
                    value={stats?.sent ?? 0}
                    icon={<CheckIcon />}
                    color="green"
                    isLoading={isLoading}
                />
                <StatCard
                    title="Failed"
                    value={stats?.failed ?? 0}
                    icon={<XIcon />}
                    color="red"
                    isLoading={isLoading}
                />
                <StatCard
                    title="Cancelled"
                    value={stats?.cancelled ?? 0}
                    icon={<BanIcon />}
                    color="gray"
                    isLoading={isLoading}
                />
            </div>

            {/* Quick Actions */}
            <div className="card p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Quick Actions
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Link
                        href="/dashboard/compose"
                        className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/30 dark:to-primary-800/30 hover:shadow-lg transition-all group"
                    >
                        <div className="w-12 h-12 rounded-lg bg-primary-500 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                            <svg
                                className="w-6 h-6"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 4v16m8-8H4"
                                />
                            </svg>
                        </div>
                        <div>
                            <p className="font-semibold text-gray-900 dark:text-white">
                                Compose Email
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Schedule a new email
                            </p>
                        </div>
                    </Link>

                    <Link
                        href="/dashboard/scheduled"
                        className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 hover:shadow-lg transition-all group"
                    >
                        <div className="w-12 h-12 rounded-lg bg-blue-500 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                            <ClockIcon />
                        </div>
                        <div>
                            <p className="font-semibold text-gray-900 dark:text-white">
                                View Scheduled
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {stats?.scheduled ?? 0} pending emails
                            </p>
                        </div>
                    </Link>

                    <Link
                        href="/dashboard/sent"
                        className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 hover:shadow-lg transition-all group"
                    >
                        <div className="w-12 h-12 rounded-lg bg-green-500 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                            <CheckIcon />
                        </div>
                        <div>
                            <p className="font-semibold text-gray-900 dark:text-white">
                                View Sent
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {stats?.sent ?? 0} delivered emails
                            </p>
                        </div>
                    </Link>
                </div>
            </div>

            {/* Info Card */}
            <div className="card p-6 bg-gradient-to-r from-primary-600 to-accent-600 text-white">
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                        <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg">Email Testing Mode</h3>
                        <p className="mt-1 text-white/80">
                            This application uses Ethereal Email for testing. All emails are
                            captured and viewable via the preview links. No real emails are
                            sent.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

interface StatCardProps {
    title: string;
    value: number;
    icon: React.ReactNode;
    color: "blue" | "yellow" | "green" | "red" | "gray";
    isLoading: boolean;
}

function StatCard({ title, value, icon, color, isLoading }: StatCardProps) {
    const colorClasses = {
        blue: "from-blue-500 to-blue-600 text-blue-600 dark:text-blue-400",
        yellow: "from-yellow-500 to-yellow-600 text-yellow-600 dark:text-yellow-400",
        green: "from-green-500 to-green-600 text-green-600 dark:text-green-400",
        red: "from-red-500 to-red-600 text-red-600 dark:text-red-400",
        gray: "from-gray-500 to-gray-600 text-gray-600 dark:text-gray-400",
    };

    return (
        <div className="card p-5 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        {title}
                    </p>
                    {isLoading ? (
                        <div className="mt-1 h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    ) : (
                        <p className={`mt-1 text-3xl font-bold ${colorClasses[color]}`}>
                            {value}
                        </p>
                    )}
                </div>
                <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center text-white`}
                >
                    {icon}
                </div>
            </div>
        </div>
    );
}

function ClockIcon() {
    return (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
        </svg>
    );
}

function SpinnerIcon() {
    return (
        <svg className="w-6 h-6 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
        </svg>
    );
}

function CheckIcon() {
    return (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
            />
        </svg>
    );
}

function XIcon() {
    return (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
            />
        </svg>
    );
}

function BanIcon() {
    return (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
            />
        </svg>
    );
}
