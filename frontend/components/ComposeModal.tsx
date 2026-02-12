"use client";

import React, { useState } from "react";
import { Modal } from "./Modal";
import { Button } from "./Button";
import { Input } from "./Input";
import Papa from "papaparse";
import { scheduleEmail } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

interface ComposeModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function ComposeModal({ isOpen, onClose }: ComposeModalProps) {
    const queryClient = useQueryClient();
    const [parsedEmails, setParsedEmails] = useState<string[]>([]);
    const [subject, setSubject] = useState("");
    const [body, setBody] = useState("");
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");

    const scheduleMutation = useMutation({
        mutationFn: async () => {
            if (parsedEmails.length === 0)
                throw new Error("No recipients uploaded");
            if (!subject.trim()) throw new Error("Subject is required");
            if (!body.trim()) throw new Error("Body is required");
            if (!date || !time)
                throw new Error("Schedule date and time are required");

            const scheduledAt = new Date(`${date}T${time}`).toISOString();

            const promises = parsedEmails.map((recipient) =>
                scheduleEmail({ recipient, subject, body, scheduledAt })
            );

            await Promise.all(promises);
        },
        onSuccess: () => {
            toast.success(`${parsedEmails.length} email(s) scheduled`);
            queryClient.invalidateQueries({ queryKey: ["emails"] });
            resetForm();
            onClose();
        },
        onError: (error: Error) => {
            toast.error(error.message || "Failed to schedule emails");
        },
    });

    const resetForm = () => {
        setParsedEmails([]);
        setSubject("");
        setBody("");
        setDate("");
        setTime("");
    };

    const handleClose = () => {
        if (!scheduleMutation.isPending) {
            resetForm();
            onClose();
        }
    };

    const handleFileUpload = (
        e:
            | React.DragEvent<HTMLDivElement>
            | React.ChangeEvent<HTMLInputElement>
    ) => {
        e.preventDefault();

        let file: File | undefined;
        if ("dataTransfer" in e) {
            file = e.dataTransfer.files[0];
        } else {
            file = e.target.files?.[0];
        }

        if (!file) return;

        if (file.type !== "text/csv" && !file.name.endsWith(".csv")) {
            toast.error("Please upload a CSV file");
            return;
        }

        Papa.parse(file, {
            complete: (results) => {
                const data = results.data as Record<string, unknown>[];
                const emails: string[] = [];
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

                data.forEach((row) => {
                    if (Array.isArray(row)) {
                        row.forEach((cell) => {
                            if (
                                typeof cell === "string" &&
                                emailRegex.test(cell.trim())
                            ) {
                                emails.push(cell.trim());
                            }
                        });
                    } else if (typeof row === "object" && row !== null) {
                        Object.values(row).forEach((cell) => {
                            if (
                                typeof cell === "string" &&
                                emailRegex.test(cell.trim())
                            ) {
                                emails.push(cell.trim());
                            }
                        });
                    }
                });

                if (emails.length === 0) {
                    toast.error("No valid email addresses found in CSV");
                } else {
                    setParsedEmails(emails);
                    toast.success(`${emails.length} recipient(s) detected`);
                }
            },
            error: () => {
                toast.error("Failed to parse CSV file");
            },
        });
    };

    const canSubmit =
        parsedEmails.length > 0 &&
        subject.trim() &&
        body.trim() &&
        date &&
        time &&
        !scheduleMutation.isPending;

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Compose Email">
            <div className="space-y-5">
                <Input
                    label="Subject"
                    placeholder="Enter email subject..."
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    icon={
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                        </svg>
                    }
                />

                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-text-secondary">Body</label>
                    <textarea
                        className="w-full px-4 py-3 glass rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/40 transition-all duration-200 h-28 resize-none"
                        placeholder="Write your email content (HTML supported)..."
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-text-secondary">
                        Recipients
                    </label>
                    <div
                        className={`rounded-xl px-5 py-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 group ${parsedEmails.length > 0
                                ? "glass gradient-border"
                                : "border-2 border-dashed border-border-light hover:border-accent/50 hover:bg-accent-subtle"
                            }`}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={handleFileUpload}
                        onClick={() =>
                            document.getElementById("csv-upload")?.click()
                        }
                    >
                        <input
                            type="file"
                            id="csv-upload"
                            className="hidden"
                            accept=".csv"
                            onChange={handleFileUpload}
                        />
                        {parsedEmails.length > 0 ? (
                            <div>
                                <div className="w-10 h-10 rounded-xl bg-success-glow flex items-center justify-center mx-auto mb-2">
                                    <svg className="w-5 h-5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                    </svg>
                                </div>
                                <p className="text-sm font-medium text-text-primary">
                                    {parsedEmails.length} recipient(s) loaded
                                </p>
                                <p className="text-xs text-text-muted mt-1">
                                    Click to replace
                                </p>
                            </div>
                        ) : (
                            <div>
                                <div className="w-10 h-10 rounded-xl bg-accent-subtle flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                                    <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                                    </svg>
                                </div>
                                <p className="text-sm font-medium text-text-secondary">
                                    Upload CSV file
                                </p>
                                <p className="text-xs text-text-muted mt-1">
                                    Drag and drop or click to browse
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <Input
                        label="Date"
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                    />
                    <Input
                        label="Time"
                        type="time"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                    />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-border">
                    <Button
                        variant="ghost"
                        onClick={handleClose}
                        disabled={scheduleMutation.isPending}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={() => scheduleMutation.mutate()}
                        disabled={!canSubmit}
                    >
                        {scheduleMutation.isPending ? (
                            <>
                                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                Scheduling...
                            </>
                        ) : (
                            <>
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                                </svg>
                                Schedule
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
