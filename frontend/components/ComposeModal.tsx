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
                    placeholder="Email subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                />

                <div className="flex flex-col gap-1.5">
                    <label className="text-sm text-text-secondary">Body</label>
                    <textarea
                        className="w-full px-3 py-2 bg-surface border border-border rounded-md text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-neutral-500 transition-colors h-24 resize-none"
                        placeholder="Email content (HTML supported)"
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                    />
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="text-sm text-text-secondary">
                        Recipients
                    </label>
                    <div
                        className={`border border-dashed rounded-md px-4 py-5 flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${parsedEmails.length > 0
                                ? "border-neutral-500 bg-surface"
                                : "border-border-light hover:border-neutral-600"
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
                                <p className="text-sm text-text-primary">
                                    {parsedEmails.length} recipient(s) loaded
                                </p>
                                <p className="text-xs text-text-muted mt-1">
                                    Click to replace
                                </p>
                            </div>
                        ) : (
                            <div>
                                <p className="text-sm text-text-secondary">
                                    Upload CSV
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

                <div className="flex justify-end gap-3 pt-3 border-t border-border">
                    <Button
                        variant="secondary"
                        onClick={handleClose}
                        disabled={scheduleMutation.isPending}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={() => scheduleMutation.mutate()}
                        disabled={!canSubmit}
                    >
                        {scheduleMutation.isPending
                            ? "Scheduling..."
                            : "Schedule"}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
