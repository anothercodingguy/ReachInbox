"use client";

import { useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Papa from "papaparse";
import { scheduleEmails, CreateEmailData } from "../../../lib/api";

export default function ComposePage() {
    const { data: session } = useSession();
    const router = useRouter();
    const queryClient = useQueryClient();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const userId = (session?.user as any)?.id;
    const userEmail = session?.user?.email || "";

    const [mode, setMode] = useState<"single" | "csv">("single");
    const [emails, setEmails] = useState<CreateEmailData[]>([
        { toEmail: "", subject: "", body: "", scheduledAt: getDefaultDateTime() },
    ]);
    const [csvPreview, setCsvPreview] = useState<CreateEmailData[]>([]);

    const mutation = useMutation({
        mutationFn: (data: CreateEmailData[]) =>
            scheduleEmails(userId, userEmail, data),
        onSuccess: (result) => {
            toast.success(`Scheduled ${result.emails.length} email(s)`);
            queryClient.invalidateQueries({ queryKey: ["email-stats"] });
            queryClient.invalidateQueries({ queryKey: ["emails"] });
            router.push("/dashboard/scheduled");
        },
        onError: (error: Error) => {
            toast.error(error.message || "Failed to schedule emails");
        },
    });

    function getDefaultDateTime() {
        const date = new Date();
        date.setMinutes(date.getMinutes() + 5);
        return date.toISOString().slice(0, 16);
    }

    function handleSingleEmailChange(field: keyof CreateEmailData, value: string) {
        setEmails([{ ...emails[0], [field]: value }]);
    }

    function handleCsvUpload(event: React.ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];
        if (!file) return;

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                const parsed = results.data as any[];
                const validEmails: CreateEmailData[] = parsed
                    .filter(
                        (row) =>
                            row.toEmail && row.subject && row.body && row.scheduledAt
                    )
                    .map((row) => ({
                        toEmail: row.toEmail.trim(),
                        subject: row.subject.trim(),
                        body: row.body.trim(),
                        scheduledAt: new Date(row.scheduledAt).toISOString(),
                    }));

                if (validEmails.length === 0) {
                    toast.error(
                        "No valid emails found. Ensure CSV has columns: toEmail, subject, body, scheduledAt"
                    );
                    return;
                }

                setCsvPreview(validEmails);
                toast.success(`Found ${validEmails.length} valid email(s)`);
            },
            error: () => {
                toast.error("Failed to parse CSV file");
            },
        });
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        const dataToSubmit = mode === "single" ? emails : csvPreview;

        if (dataToSubmit.length === 0) {
            toast.error("No emails to schedule");
            return;
        }

        // Validate single email
        if (mode === "single") {
            const email = dataToSubmit[0];
            if (!email.toEmail || !email.subject || !email.body) {
                toast.error("Please fill in all required fields");
                return;
            }
        }

        mutation.mutate(dataToSubmit);
    }

    return (
        <div className="max-w-4xl mx-auto animate-fade-in">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Compose Email
                </h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                    Schedule a single email or upload a CSV for bulk scheduling
                </p>
            </div>

            {/* Mode Toggle */}
            <div className="card p-2 inline-flex mb-6">
                <button
                    onClick={() => {
                        setMode("single");
                        setCsvPreview([]);
                    }}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${mode === "single"
                        ? "bg-primary-500 text-white"
                        : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                        }`}
                >
                    Single Email
                </button>
                <button
                    onClick={() => setMode("csv")}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${mode === "csv"
                        ? "bg-primary-500 text-white"
                        : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                        }`}
                >
                    CSV Upload
                </button>
            </div>

            <form onSubmit={handleSubmit}>
                {mode === "single" ? (
                    <div className="card p-6 space-y-6">
                        {/* From Email (read-only) */}
                        <div>
                            <label className="label">From Email</label>
                            <input
                                type="email"
                                value={userEmail}
                                disabled
                                className="input bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
                            />
                            <p className="mt-1 text-xs text-gray-500">
                                Emails will be sent from your account email
                            </p>
                        </div>

                        {/* To Email */}
                        <div>
                            <label className="label">To Email *</label>
                            <input
                                type="email"
                                value={emails[0].toEmail}
                                onChange={(e) =>
                                    handleSingleEmailChange("toEmail", e.target.value)
                                }
                                placeholder="recipient@example.com"
                                className="input"
                                required
                            />
                        </div>

                        {/* Subject */}
                        <div>
                            <label className="label">Subject *</label>
                            <input
                                type="text"
                                value={emails[0].subject}
                                onChange={(e) =>
                                    handleSingleEmailChange("subject", e.target.value)
                                }
                                placeholder="Enter email subject"
                                className="input"
                                required
                            />
                        </div>

                        {/* Body */}
                        <div>
                            <label className="label">Body *</label>
                            <textarea
                                value={emails[0].body}
                                onChange={(e) =>
                                    handleSingleEmailChange("body", e.target.value)
                                }
                                placeholder="Enter email body (HTML supported)"
                                rows={6}
                                className="input resize-none"
                                required
                            />
                        </div>

                        {/* Schedule Time */}
                        <div>
                            <label className="label">Schedule Time *</label>
                            <input
                                type="datetime-local"
                                value={emails[0].scheduledAt}
                                onChange={(e) =>
                                    handleSingleEmailChange("scheduledAt", e.target.value)
                                }
                                min={new Date().toISOString().slice(0, 16)}
                                className="input"
                                required
                            />
                        </div>
                    </div>
                ) : (
                    <div className="card p-6 space-y-6">
                        {/* CSV Upload */}
                        <div>
                            <label className="label">Upload CSV File</label>
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center cursor-pointer hover:border-primary-500 transition-colors"
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".csv"
                                    onChange={handleCsvUpload}
                                    className="hidden"
                                />
                                <svg
                                    className="w-12 h-12 mx-auto text-gray-400 mb-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                    />
                                </svg>
                                <p className="text-gray-600 dark:text-gray-400">
                                    Click to upload or drag and drop
                                </p>
                                <p className="text-sm text-gray-500 mt-1">CSV file only</p>
                            </div>
                        </div>

                        {/* CSV Format Help */}
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                            <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                                CSV Format
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                Your CSV file should have the following columns:
                            </p>
                            <code className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">
                                toEmail, subject, body, scheduledAt
                            </code>
                            <p className="text-xs text-gray-500 mt-2">
                                scheduledAt should be in ISO format (e.g., 2024-01-15T10:30:00)
                            </p>
                        </div>

                        {/* Preview */}
                        {csvPreview.length > 0 && (
                            <div>
                                <h3 className="font-medium text-gray-900 dark:text-white mb-3">
                                    Preview ({csvPreview.length} emails)
                                </h3>
                                <div className="max-h-64 overflow-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0">
                                            <tr>
                                                <th className="px-4 py-2 text-left font-medium text-gray-500">
                                                    To
                                                </th>
                                                <th className="px-4 py-2 text-left font-medium text-gray-500">
                                                    Subject
                                                </th>
                                                <th className="px-4 py-2 text-left font-medium text-gray-500">
                                                    Scheduled
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                            {csvPreview.slice(0, 10).map((email, i) => (
                                                <tr key={i}>
                                                    <td className="px-4 py-2 text-gray-900 dark:text-white">
                                                        {email.toEmail}
                                                    </td>
                                                    <td className="px-4 py-2 text-gray-600 dark:text-gray-400 truncate max-w-xs">
                                                        {email.subject}
                                                    </td>
                                                    <td className="px-4 py-2 text-gray-500">
                                                        {new Date(email.scheduledAt).toLocaleString()}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    {csvPreview.length > 10 && (
                                        <p className="px-4 py-2 text-sm text-gray-500 bg-gray-50 dark:bg-gray-800">
                                            ... and {csvPreview.length - 10} more
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Submit Button */}
                <div className="mt-6 flex justify-end gap-4">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="btn-secondary"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={mutation.isPending}
                        className="btn-primary flex items-center gap-2"
                    >
                        {mutation.isPending ? (
                            <>
                                <svg
                                    className="w-4 h-4 animate-spin"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    ></circle>
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    ></path>
                                </svg>
                                Scheduling...
                            </>
                        ) : (
                            <>
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
                                Schedule {mode === "csv" && csvPreview.length > 0 ? `${csvPreview.length} Emails` : "Email"}
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
