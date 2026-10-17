import { ApiError } from "./api-error";

export async function fetchJSON<T>(
    url: string,
    init?: RequestInit
): Promise<T> {
    const res = await fetch(url, {
        ...init,
        headers: {
            "Content-Type": "application/json",
            ...(init?.headers || {}),
        },
    });
    if (!res.ok) {
        const text = await res.text();
        let body: Record<string, unknown> = {};
        try {
            body = JSON.parse(text) as Record<string, unknown>;
        } catch {
            // Non-JSON response (e.g. HTML error page)
        }
        // Include Retry-After header for 429 responses when not in body
        if (res.status === 429 && body.retryAfter == null) {
            const retryAfter = res.headers.get("Retry-After");
            if (retryAfter) {
                body = { ...body, retryAfter: parseInt(retryAfter, 10) };
            }
        }
        const message =
            (body.message as string) ||
            (body.error as string) ||
            res.statusText ||
            text ||
            `Request failed with status ${res.status}`;
        throw new ApiError(message, res.status, body);
    }
    return res.json();
}
