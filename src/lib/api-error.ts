/**
 * Structured API error thrown when fetchJSON receives a non-2xx response.
 * Allows components to detect rate limits, subscription limits, etc.
 */
export class ApiError extends Error {
    constructor(
        message: string,
        public readonly status: number,
        public readonly body: Record<string, unknown> = {}
    ) {
        super(message);
        this.name = "ApiError";
        Object.setPrototypeOf(this, ApiError.prototype);
    }

    get error(): string | undefined {
        return this.body.error as string | undefined;
    }

    get limitType():
        | "customers"
        | "jobs"
        | "monthlyInvoices"
        | "feature"
        | undefined {
        return this.body.limitType as
            | "customers"
            | "jobs"
            | "monthlyInvoices"
            | "feature"
            | undefined;
    }

    get retryAfter(): number | undefined {
        return this.body.retryAfter as number | undefined;
    }

    get currentUsage(): number | undefined {
        return this.body.currentUsage as number | undefined;
    }

    get limit(): number | undefined {
        return this.body.limit as number | undefined;
    }

    get feature(): string | undefined {
        return this.body.feature as string | undefined;
    }

    get bodyMessage(): string | undefined {
        return this.body.message as string | undefined;
    }

    /** True if this is a rate limit (429) response */
    get isRateLimited(): boolean {
        return this.status === 429;
    }

    /** True if this is a subscription/feature limit (403) response */
    get isLimitExceeded(): boolean {
        return this.status === 403 && Boolean(this.body.limitType || this.body.error === "Feature not available");
    }
}
