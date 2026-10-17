/**
 * Subscription events - checks run only when these specific events occur.
 * This ensures we validate limits/features only at the point of use, not on every request.
 */

export type SubscriptionEvent =
    | "create_customer"
    | "create_job"
    | "create_invoice"
    | "create_estimate"
    | "bulk_upload_customers";

/** Which limit each event validates against */
export const EVENT_LIMIT_MAP: Record<SubscriptionEvent, "customers" | "jobs" | "monthlyInvoices" | "feature"> =
    {
        create_customer: "customers",
        create_job: "jobs",
        create_invoice: "monthlyInvoices",
        create_estimate: "feature",
        bulk_upload_customers: "customers",
    } as const;

/** Feature required for feature-gated events */
export const EVENT_FEATURE_MAP: Partial<Record<SubscriptionEvent, string>> = {
    create_estimate: "estimates",
};
