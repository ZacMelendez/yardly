/** Re-export shared subscription types */
export type {
    SubscriptionPlanId,
    SubscriptionStatus,
    BillingCycle,
    Currency,
    CreateSubscriptionInput,
    UpdateSubscriptionInput,
} from "@/lib/subscription-types";

export interface SubscriptionLimits {
    maxCustomers: number | null;
    maxJobs: number | null;
    maxInvoicesPerMonth: number | null;
    features: string[];
}

export interface UsageLimitsResult {
    customers: { current: number; limit: number | null; isAtLimit: boolean };
    jobs: { current: number; limit: number | null; isAtLimit: boolean };
    monthlyInvoices: {
        current: number;
        limit: number | null;
        isAtLimit: boolean;
    };
}

export interface ResolvedSubscription {
    planId: string;
    planName: string;
    status: string;
    maxCustomers: number | null;
    maxJobs: number | null;
    maxInvoicesPerMonth: number | null;
    features: string[];
}
