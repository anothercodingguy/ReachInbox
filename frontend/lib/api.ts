const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

interface FetchOptions extends RequestInit {
    userId?: string;
}

async function fetchAPI<T>(
    endpoint: string,
    options: FetchOptions = {}
): Promise<T> {
    const { userId, ...fetchOptions } = options;

    const headers: HeadersInit = {
        "Content-Type": "application/json",
        ...(userId && { "x-user-id": userId }),
        ...options.headers,
    };

    const url = `${API_URL}${endpoint}`;

    const response = await fetch(url, {
        ...fetchOptions,
        headers,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(error.error || error.message || "API request failed");
    }

    return response.json();
}

// Types
export interface Email {
    id: string;
    userId: string;
    fromEmail: string;
    toEmail: string;
    subject: string;
    body: string;
    status: "SCHEDULED" | "PROCESSING" | "SENT" | "FAILED" | "CANCELLED";
    scheduledAt: string;
    sentAt: string | null;
    etherealUrl: string | null;
    errorMessage: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface EmailStats {
    scheduled: number;
    processing: number;
    sent: number;
    failed: number;
    cancelled: number;
    total: number;
}

export interface PaginatedEmails {
    emails: Email[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface CreateEmailData {
    toEmail: string;
    subject: string;
    body: string;
    scheduledAt: string;
}

// API Functions
export async function getEmails(
    userId: string,
    status?: string,
    page = 1,
    limit = 20
): Promise<PaginatedEmails> {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (status) params.set("status", status);

    return fetchAPI(`/api/emails?${params}`, { userId });
}

export async function getEmailStats(userId: string): Promise<EmailStats> {
    return fetchAPI("/api/emails/stats", { userId });
}

export async function getEmail(userId: string, emailId: string): Promise<Email> {
    return fetchAPI(`/api/emails/${emailId}`, { userId });
}

export async function scheduleEmails(
    userId: string,
    fromEmail: string,
    emails: CreateEmailData[]
): Promise<{ message: string; emails: Email[] }> {
    return fetchAPI("/api/emails", {
        method: "POST",
        userId,
        body: JSON.stringify({ fromEmail, emails }),
    });
}

export async function cancelEmail(
    userId: string,
    emailId: string
): Promise<{ message: string }> {
    return fetchAPI(`/api/emails/${emailId}`, {
        method: "DELETE",
        userId,
    });
}
