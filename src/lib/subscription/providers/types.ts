import type { SubscriptionPlanId } from "@/lib/subscription-types";

/**
 * Data that can be upserted when syncing from a billing provider (e.g. Stripe webhooks).
 */
export interface SubscriptionSyncInput {
    userId: string;
    planId: SubscriptionPlanId;
    planName: string;
    status: string;
    stripeSubscriptionId?: string | null;
    stripeCustomerId?: string | null;
    stripePriceId?: string | null;
    billingCycle: string;
    amount: number;
    currency?: string;
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
    cancelAtPeriodEnd?: boolean;
    canceledAt?: Date | null;
    trialStart?: Date | null;
    trialEnd?: Date | null;
    maxCustomers?: number | null;
    maxJobs?: number | null;
    maxInvoicesPerMonth?: number | null;
}

/**
 * Result of creating a checkout session (e.g. Stripe Checkout).
 */
export interface CheckoutSessionResult {
    sessionId: string;
    url: string;
}

/**
 * Subscription provider interface - implement this to integrate with Stripe or other billing providers.
 * The database is always the source of truth for limits; providers sync subscription state into it.
 */
export interface SubscriptionProvider {
    readonly name: string;

    /**
     * Sync subscription state from the provider into our database.
     * Call this when handling webhooks (e.g. customer.subscription.updated).
     */
    syncSubscription(input: SubscriptionSyncInput): Promise<void>;

    /**
     * Create a checkout session for a new or changed subscription.
     * Returns the session ID and redirect URL for the customer.
     */
    createCheckoutSession?(
        userId: string,
        planId: SubscriptionPlanId,
        billingCycle: "monthly" | "yearly",
        metadata?: Record<string, string>
    ): Promise<CheckoutSessionResult>;

    /**
     * Create a customer portal session for managing subscription/cancel.
     */
    createPortalSession?(userId: string): Promise<{ url: string }>;
}
