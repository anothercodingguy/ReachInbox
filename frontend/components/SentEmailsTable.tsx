import React from "react";
import { Table, TableRow, TableCell } from "./Table";

export const SentEmailsTable = () => {
    return (
        <Table headers={["Recipient", "Subject", "Sent Time", "Status"]}>
            <TableRow>
                <TableCell>newsletter@subscribers.com</TableCell>
                <TableCell>Weekly Digest #42</TableCell>
                <TableCell>Yesterday, 4:30 PM</TableCell>
                <TableCell>
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500/50"></span>
                        <span className="text-xs text-muted">Sent</span>
                    </div>
                </TableCell>
            </TableRow>
            <TableRow>
                <TableCell>onboarding@newuser.io</TableCell>
                <TableCell>Welcome to the Platform</TableCell>
                <TableCell>2 days ago</TableCell>
                <TableCell>
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500/50"></span>
                        <span className="text-xs text-muted">Sent</span>
                    </div>
                </TableCell>
            </TableRow>
        </Table>
    );
};
