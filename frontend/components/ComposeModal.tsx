"use client";

import React, { useState, useEffect, useCallback } from "react";
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
    const [recipients, setRecipients] = useState<string[]>([]);
    const [singleRecipient, setSingleRecipient] = useState("");
    const [subject, setSubject] = useState("");
    const [body, setBody] = useState("");
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");

    const resetForm = useCallback(() => {
        setRecipients([]);
        setSingleRecipient("");
        setSubject("");
        setBody("");
        setDate("");
        setTime("");
    }, []);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        if (isOpen) {
            document.body.style.overflow = "hidden";
            window.addEventListener("keydown", handleEscape);
        }
        return () => {
            document.body.style.overflow = "unset";
            window.removeEventListener("keydown", handleEscape);
        };
    }, [isOpen, onClose]);

    const scheduleMutation = useMutation({
        mutationFn: async () => {
            const emailList =
                recipients.length > 0
                    ? recipients
                    : singleRecipient.trim()
                        ? [singleRecipient.trim()]
                        : [];

            if (emailList.length === 0) throw new Error("Add a recipient");
            if (!subject.trim()) throw new Error("Add a subject");
            if (!body.trim()) throw new Error("Write something");
            if (!date || !time) throw new Error("Pick a send time");

            const scheduledAt = new Date(`${date}T${time}`).toISOString();
            await Promise.all(
                emailList.map((recipient) =>
                    scheduleEmail({ recipient, subject, body, scheduledAt })
                )
            );
        },
        onSuccess: () => {
            toast.success("Scheduled");
            queryClient.invalidateQueries({ queryKey: ["emails"] });
            resetForm();
            onClose();
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });

    const handleCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        Papa.parse(file, {
            complete: (results) => {
                const data = results.data as Record<string, unknown>[];
                const emails: string[] = [];
                const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                data.forEach((row) => {
                    Object.values(row).forEach((cell) => {
                        if (typeof cell === "string" && re.test(cell.trim())) {
                            emails.push(cell.trim());
                        }
                    });
                });
                if (emails.length === 0) {
                    toast.error("No emails found in file");
                } else {
                    setRecipients(emails);
                    setSingleRecipient("");
                    toast.success(`${emails.length} recipients loaded`);
                }
            },
        });
        e.target.value = "";
    };

    const handleClose = () => {
        if (!scheduleMutation.isPending) {
            resetForm();
            onClose();
        }
    };

    if (!isOpen) return null;

    const hasRecipients =
        recipients.length > 0 || singleRecipient.trim().length > 0;
    const canSubmit =
        hasRecipients &&
        subject.trim() &&
        body.trim() &&
        date &&
        time &&
        !scheduleMutation.isPending;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-[#2d2a26]/20 backdrop-blur-[1px]"
                onClick={handleClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-lg bg-bg-raised border border-border rounded-lg overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                    <h2 className="text-base font-medium text-text">
                        New email
                    </h2>
                    <button
                        onClick={handleClose}
                        className="text-text-muted hover:text-text transition-colors text-sm"
                    >
                        ✕
                    </button>
                </div>

                {/* Body */}
                <div className="px-6 py-5 space-y-5">
                    {/* Recipient */}
                    <div>
                        <label className="block text-sm text-text-secondary mb-2">
                            To
                        </label>
                        {recipients.length > 0 ? (
                            <div className="flex items-center justify-between px-3 py-2.5 bg-bg border border-border rounded-lg">
                                <span className="text-sm text-text">
                                    {recipients.length} recipient
                                    {recipients.length !== 1 && "s"} from CSV
                                </span>
                                <button
                                    onClick={() => setRecipients([])}
                                    className="text-xs text-text-muted hover:text-text"
                                >
                                    Clear
                                </button>
                            </div>
                        ) : (
                            <div className="flex gap-2">
                                <input
                                    type="email"
                                    placeholder="recipient@email.com"
                                    value={singleRecipient}
                                    onChange={(e) =>
                                        setSingleRecipient(e.target.value)
                                    }
                                    className="flex-1 px-3 py-2.5 bg-bg border border-border rounded-lg text-sm text-text placeholder:text-text-muted focus:outline-none focus:border-border-focus transition-colors"
                                />
                                <label className="px-3 py-2.5 border border-border rounded-lg text-xs text-text-muted hover:text-text hover:border-border-focus cursor-pointer transition-colors flex items-center">
                                    CSV
                                    <input
                                        type="file"
                                        accept=".csv"
                                        className="hidden"
                                        onChange={handleCSV}
                                    />
                                </label>
                            </div>
                        )}
                    </div>

                    {/* Subject */}
                    <div>
                        <label className="block text-sm text-text-secondary mb-2">
                            Subject
                        </label>
                        <input
                            type="text"
                            placeholder="What's this about?"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            className="w-full px-3 py-2.5 bg-bg border border-border rounded-lg text-sm text-text placeholder:text-text-muted focus:outline-none focus:border-border-focus transition-colors"
                        />
                    </div>

                    {/* Body */}
                    <div>
                        <label className="block text-sm text-text-secondary mb-2">
                            Message
                        </label>
                        <textarea
                            placeholder="Write your email..."
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                            rows={5}
                            className="w-full px-3 py-2.5 bg-bg border border-border rounded-lg text-sm text-text placeholder:text-text-muted focus:outline-none focus:border-border-focus transition-colors resize-none leading-relaxed"
                        />
                    </div>

                    {/* Schedule */}
                    <div>
                        <label className="block text-sm text-text-secondary mb-2">
                            Send at
                        </label>
                        <div className="flex gap-3">
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="flex-1 px-3 py-2.5 bg-bg border border-border rounded-lg text-sm text-text focus:outline-none focus:border-border-focus transition-colors"
                            />
                            <input
                                type="time"
                                value={time}
                                onChange={(e) => setTime(e.target.value)}
                                className="flex-1 px-3 py-2.5 bg-bg border border-border rounded-lg text-sm text-text focus:outline-none focus:border-border-focus transition-colors"
                            />
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-border flex justify-end gap-3">
                    <button
                        onClick={handleClose}
                        disabled={scheduleMutation.isPending}
                        className="px-4 py-2 text-sm text-text-muted hover:text-text transition-colors disabled:opacity-40"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => scheduleMutation.mutate()}
                        disabled={!canSubmit}
                        className="px-5 py-2 bg-text text-bg text-sm font-medium rounded-lg hover:bg-text-secondary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        {scheduleMutation.isPending
                            ? "Scheduling..."
                            : "Schedule email"}
                    </button>
                </div>
            </div>
        </div>
    );
}
