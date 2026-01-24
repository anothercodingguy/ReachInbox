import React from "react";
import { Table, TableRow, TableCell } from "./Table";

export const ScheduledEmailsTable = () => {
    return (
        <Table headers={["Recipient", "Subject", "Scheduled Time", "Status"]}>
            <TableRow>
                <TableCell>candidate@example.com</TableCell>
                <TableCell>Interview Invitation</TableCell>
                <TableCell>Today, 10:00 AM</TableCell>
                <TableCell>
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-yellow-500/50"></span>
                        <span className="text-xs">Scheduled</span>
                    </div>
                </TableCell>
            </TableRow>
            <TableRow>
                <TableCell>client@company.com</TableCell>
                <TableCell>Project Update Q1</TableCell>
                <TableCell>Tomorrow, 09:00 AM</TableCell>
                <TableCell>
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-yellow-500/50"></span>
                        <span className="text-xs">Scheduled</span>
                    </div>
                </TableCell>
            </TableRow>
            {/* Empty state or more rows can be added here */}
        </Table>
    );
};
