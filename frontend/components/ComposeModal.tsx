import React, { useState } from "react";
import { Modal } from "./Modal";
import { Button } from "./Button";
import { Input } from "./Input";

interface ComposeModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const ComposeModal: React.FC<ComposeModalProps> = ({ isOpen, onClose }) => {
    const [recipientCount, setRecipientCount] = useState(0);

    const handleFileUpload = (e: React.DragEvent<HTMLDivElement> | React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        // Mocking file detection
        setRecipientCount(Math.floor(Math.random() * 50) + 1);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="New Email Schedule">
            <div className="space-y-6">
                <Input label="Subject" placeholder="Enter email subject" />

                <div className="space-y-1">
                    <label className="text-sm font-medium text-secondary">Recipients (CSV)</label>
                    <div
                        className="border border-dashed border-border rounded-lg p-8 flex flex-col items-center justify-center text-center hover:bg-card/50 transition-colors cursor-pointer group"
                        onDragOver={(e) => e.preventDefault()}
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
                            Drag & drop your CSV file here
                        </p>
                        <p className="text-xs text-muted mt-1">
                            or click to browse
                        </p>
                    </div>
                    {recipientCount > 0 && (
                        <p className="text-xs text-accent animate-fade-in">
                            ✓ {recipientCount} recipients detected
                        </p>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <Input label="Date" type="date" className="w-full" />
                    <Input label="Time" type="time" className="w-full" />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                    <Button variant="secondary" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button onClick={onClose}>
                        Schedule Emails
                    </Button>
                </div>
            </div>
        </Modal>
    );
};
