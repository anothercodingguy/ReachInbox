"use client";

import React, { useState } from "react";
import { Modal } from "./Modal";
import { Button } from "./Button";
import { Input } from "./Input";
import Papa from "papaparse";
import { useSession } from "next-auth/react";
import { scheduleEmails, CreateEmailData } from "../lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

interface ComposeModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const ComposeModal: React.FC<ComposeModalProps> = ({ isOpen, onClose }) => {
    const { data: session } = useSession();
    const queryClient = useQueryClient();
    const [recipientCount, setRecipientCount] = useState(0);
    const [parsedEmails, setParsedEmails] = useState<string[]>([]);
    const [subject, setSubject] = useState("");
    const [body, setBody] = useState("");
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");
    const [isDragging, setIsDragging] = useState(false);

    const userId = (session?.user as any)?.id;
    const userEmail = session?.user?.email || "";

    const scheduleMutation = useMutation({
        mutationFn: async () => {
            if (!userId) throw new Error("User not authenticated");
            if (parsedEmails.length === 0) throw new Error("No recipients found");
            if (!subject) throw new Error("Subject is required");
            if (!date || !time) throw new Error("Date and time are required");

            const scheduledAt = new Date(`${date}T${time}`).toISOString();
            const emailBody = body || "Default body content";

            const emailData: CreateEmailData[] = parsedEmails.map(email => ({
                toEmail: email,
                subject,
                body: emailBody,
                scheduledAt
            }));

            return scheduleEmails(userId, userEmail, emailData);
        },
        onSuccess: () => {
            toast.success(`Scheduled ${parsedEmails.length} emails`);
            queryClient.invalidateQueries({ queryKey: ["emails"] });
            queryClient.invalidateQueries({ queryKey: ["email-stats"] });
            resetForm();
            onClose();
        },
        onError: (error: Error) => {
            toast.error(error.message || "Failed to schedule emails");
        }
    });

    const resetForm = () => {
        setRecipientCount(0);
        setParsedEmails([]);
        setSubject("");
        setBody("");
        setDate("");
        setTime("");
    };

    const handleFileUpload = (e: React.DragEvent<HTMLDivElement> | React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        setIsDragging(false);

        let file: File | undefined;
        if ('dataTransfer' in e) {
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
                const data = results.data as any[];
                const emails: string[] = [];
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

                data.forEach(row => {
                    if (Array.isArray(row)) {
                        row.forEach(cell => {
                            if (typeof cell === 'string' && emailRegex.test(cell.trim())) {
                                emails.push(cell.trim());
                            }
                        });
                    } else if (typeof row === 'object') {
                        Object.values(row).forEach((cell: any) => {
                            if (typeof cell === 'string' && emailRegex.test(cell.trim())) {
                                emails.push(cell.trim());
                            }
                        });
                    }
                });

                if (emails.length === 0) {
                    toast.error("No valid email addresses found in CSV");
                } else {
                    setParsedEmails(emails);
                    setRecipientCount(emails.length);
                    toast.success(`Found ${emails.length} recipients`);
                }
            },
            error: (error) => {
                toast.error("Failed to parse CSV: " + error.message);
            }
        });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="New Campaign">
            <div className="space-y-6">
                <div className="space-y-4">
                    <Input
                        label="Subject"
                        placeholder="e.g. Q4 Update"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                    />

                    <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-zinc-400">Content</label>
                        <textarea
                            className="w-full bg-[#141416] border border-white/10 rounded-md px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 h-24 resize-none transition-all"
                            placeholder="Write your email content here..."
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                        ></textarea>
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-sm font-medium text-zinc-400">Recipients</label>
                    <div
                        className={`border border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center transition-all cursor-pointer group ${isDragging ? "border-indigo-500 bg-indigo-500/5" : "border-white/10 hover:border-white/20 hover:bg-white/5"
                            } ${recipientCount > 0 ? "bg-indigo-500/5 border-indigo-500/30" : ""}`}
                        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={handleFileUpload}
                        onClick={() => document.getElementById('csv-upload')?.click()}
                    >
                        <input
                            type="file"
                            id="csv-upload"
                            className="hidden"
                            accept=".csv"
                            onChange={handleFileUpload}
                        />
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 transition-transform group-hover:scale-110 ${recipientCount > 0 ? "bg-indigo-500/20 text-indigo-400" : "bg-white/5 text-zinc-400"
                            }`}>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                            </svg>
                        </div>
                        {recipientCount > 0 ? (
                            <div className="text-center">
                                <p className="text-sm font-medium text-indigo-400">{recipientCount} recipients ready</p>
                                <p className="text-xs text-zinc-500 mt-1">Click to replace CSV</p>
                            </div>
                        ) : (
                            <div className="text-center">
                                <p className="text-sm text-zinc-300">Upload CSV file</p>
                                <p className="text-xs text-zinc-500 mt-1">Drag and drop or click to browse</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <Input
                        label="Date"
                        type="date"
                        value={date}
                        className="calendar-dark"
                        onChange={(e) => setDate(e.target.value)}
                    />
                    <Input
                        label="Time"
                        type="time"
                        value={time}
                        className="calendar-dark"
                        onChange={(e) => setTime(e.target.value)}
                    />
                </div>

                <div className="flex justify-end gap-3 pt-2 border-t border-white/5 mt-6">
                    <Button variant="secondary" onClick={onClose} disabled={scheduleMutation.isPending}>
                        Cancel
                    </Button>
                    <Button
                        onClick={() => scheduleMutation.mutate()}
                        disabled={scheduleMutation.isPending || recipientCount === 0 || !subject || !date || !time}
                    >
                        {scheduleMutation.isPending ? "Scheduling..." : "Schedule Campaign"}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};
