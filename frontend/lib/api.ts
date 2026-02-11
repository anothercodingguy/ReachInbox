const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export interface Email {
    id: string;
    recipient: string;
    subject: string;
    body: string;
    status: "SCHEDULED" | "SENT" | "FAILED";
    scheduledAt: string;
    sentAt?: string;
    error?: string;
    createdAt: string;
}

export interface CreateEmailData {
    recipient: string;
    subject: string;
    body: string;
    scheduledAt: string;
}

async function fetchAPI<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const response = await fetch(`${API_URL}${endpoint}`, {
        headers: { "Content-Type": "application/json", ...options.headers },
        ...options,
    });

    if (!response.ok) {
        const error = await response
            .json()
            .catch(() => ({ error: "Request failed" }));
        throw new Error(error.error || "Request failed");
    }

    return response.json();
}

export async function getEmails(): Promise<Email[]> {
    return fetchAPI<Email[]>("/api/emails");
}

export async function scheduleEmail(data: CreateEmailData): Promise<Email> {
    return fetchAPI<Email>("/api/emails", {
        method: "POST",
        body: JSON.stringify(data),
    });
}
