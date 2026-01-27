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
    const [body, setBody] = useState(""); // Added body field (even if simple) or use default? 
    // The previous mock didn't have a body input, but the API expects `body`. 
    // I'll add a simple textarea or just an input for now, or infer it.
    // The user requirement said: "Compose Email ... Form submit".
    // I will add a Body input. 

    // Actually, looking at the previous file, it had Subject, Date, Time. 
    // The API `CreateEmailData` needs: toEmail, subject, body, scheduledAt.
    // So I need to collect Body, Date, Time.

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
            // Simple basic body for now since there's no rich editor requested yet, 
            // but I should add a field for it.
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
                // Assume first column is email, or header "email" exists
                // For simplicity, let's flatten and find emails
                const data = results.data as any[];
                const emails: string[] = [];

                // transform data to find emails. 
                // If header row exists, look for 'email' column.
                // Else grab first column.
                // Let's iterate all cells and regex match email? potentially slow but robust for "random csv"
                // Or just assume column 0.

                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

                data.forEach(row => {
                    // row is array or object depending on header option. Default is array.
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
        <Modal isOpen={isOpen} onClose={onClose} title="New Email Schedule">
            <div className="space-y-6">
                <Input
                    label="Subject"
                    placeholder="Enter email subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                />

                <div>
                    <label className="block text-sm font-medium text-secondary mb-1">Body</label>
                    <textarea
                        className="w-full bg-card border border-border rounded-lg px-4 py-2 text-white placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary h-24 resize-none"
                        placeholder="Enter email content..."
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                    ></textarea>
                </div>

                <div className="space-y-1">
                    <label className="text-sm font-medium text-secondary">Recipients (CSV)</label>
                    <div
                        className={`border border-dashed rounded-lg p-8 flex flex-col items-center justify-center text-center transition-colors cursor-pointer group ${isDragging ? "border-primary bg-primary/10" : "border-border hover:bg-card/50"
                            }`}
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
                        <div className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                            <span className="text-muted group-hover:text-primary">↓</span>
                        </div>
                        <p className="text-sm text-secondary">
                            {recipientCount > 0 ? `${recipientCount} recipients loaded` : "Drag & drop CSV or click to browse"}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <Input
                        label="Date"
                        type="date"
                        className="w-full"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                    />
                    <Input
                        label="Time"
                        type="time"
                        className="w-full"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                    />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                    <Button variant="secondary" onClick={onClose} disabled={scheduleMutation.isPending}>
                        Cancel
                    </Button>
                    <Button
                        onClick={() => scheduleMutation.mutate()}
                        disabled={scheduleMutation.isPending || recipientCount === 0 || !subject || !date || !time}
                    >
                        {scheduleMutation.isPending ? "Scheduling..." : "Schedule Emails"}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};
