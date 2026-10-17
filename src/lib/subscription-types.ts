// Subscription field value types and possible values

export type SubscriptionPlanId = "free" | "basic" | "pro" | "enterprise";

export type SubscriptionStatus =
    | "active" // Subscription is currently active and paid
    | "trialing" // In trial period
    | "cancelled" // Cancelled but still active until period end
    | "expired" // Subscription has ended
    | "past_due" // Payment failed, grace period
    | "unpaid" // Payment failed, beyond grace period
    | "paused" // Temporarily paused (if supported)
    | "incomplete" // Initial payment incomplete
    | "incomplete_expired"; // Initial payment failed and expired

export type BillingCycle =
    | "monthly"
    | "yearly"
    | "quarterly" // Optional: 3-month billing
    | "lifetime"; // Optional: one-time payment

export type Currency = "usd" | "eur" | "gbp" | "cad" | "aud" | "jpy";

// Example subscription configurations
export const SUBSCRIPTION_PLANS = {
    free: {
        planId: "free" as const,
        planName: "Free Plan",
        amount: 0,
        maxCustomers: 5,
        maxJobs: 10,
        maxInvoicesPerMonth: 5,
        features: ["basic_invoicing", "customer_management"],
        description: "Perfect for getting started",
        popular: false,
        yearlyDiscount: 0,
    },
    basic: {
        planId: "basic" as const,
        planName: "Basic Plan",
        amount: 29.99,
        maxCustomers: 50,
        maxJobs: 100,
        maxInvoicesPerMonth: 50,
        features: [
            "basic_invoicing",
            "customer_management",
            "estimates",
            "job_scheduling",
        ],
        description: "Great for small businesses",
        popular: false,
        yearlyDiscount: 20, // 20% off yearly
    },
    pro: {
        planId: "pro" as const,
        planName: "Pro Plan",
        amount: 79.99,
        maxCustomers: 200,
        maxJobs: 500,
        maxInvoicesPerMonth: 200,
        features: [
            "everything_in_basic",
            "recurring_jobs",
            "advanced_reporting",
            "api_access",
        ],
        description: "For growing businesses",
        popular: true,
        yearlyDiscount: 25, // 25% off yearly
    },
    enterprise: {
        planId: "enterprise" as const,
        planName: "Enterprise Plan",
        amount: 199.99,
        maxCustomers: null, // unlimited
        maxJobs: null, // unlimited
        maxInvoicesPerMonth: null, // unlimited
        features: [
            "everything_in_pro",
            "white_label",
            "priority_support",
            "custom_integrations",
        ],
        description: "For large organizations",
        popular: false,
        yearlyDiscount: 30, // 30% off yearly
    },
} as const;

// Feature descriptions for better UX
export const FEATURE_DESCRIPTIONS = {
    basic_invoicing: "Create and send professional invoices",
    customer_management: "Organize customer information and history",
    estimates: "Generate detailed project estimates",
    job_scheduling: "Schedule and track job progress",
    everything_in_basic: "All Basic plan features included",
    recurring_jobs: "Set up automated recurring services",
    advanced_reporting: "Detailed analytics and insights",
    api_access: "Integrate with third-party tools",
    everything_in_pro: "All Pro plan features included",
    white_label: "Custom branding and domain",
    priority_support: "24/7 priority customer support",
    custom_integrations: "Custom API integrations and workflows",
} as const;

// Example type for creating a new subscription
export interface CreateSubscriptionInput {
    userId: string;
    planId: SubscriptionPlanId;
    planName: string;
    status?: SubscriptionStatus;
    billingCycle: BillingCycle;
    amount: number;
    currency?: Currency;
    trialEnd?: Date;
    stripeCustomerId?: string;
    stripePriceId?: string;
    maxCustomers?: number | null;
    maxJobs?: number | null;
    maxInvoicesPerMonth?: number | null;
}

// Example type for subscription updates
export interface UpdateSubscriptionInput {
    planId?: SubscriptionPlanId;
    planName?: string;
    status?: SubscriptionStatus;
    cancelAtPeriodEnd?: boolean;
    canceledAt?: Date | null;
    currentPeriodEnd?: Date;
    maxCustomers?: number | null;
    maxJobs?: number | null;
    maxInvoicesPerMonth?: number | null;
}

// Helper function to get plan pricing
export function getPlanPricing(
    planId: SubscriptionPlanId,
    billingCycle: BillingCycle
) {
    const plan = SUBSCRIPTION_PLANS[planId];
    if (!plan) return null;

    const monthlyAmount = plan.amount;

    if (billingCycle === "yearly" && plan.yearlyDiscount > 0) {
        const yearlyAmount =
            monthlyAmount * 12 * (1 - plan.yearlyDiscount / 100);
        return {
            monthly: monthlyAmount,
            yearly: yearlyAmount,
            yearlyMonthly: yearlyAmount / 12,
            savings: monthlyAmount * 12 - yearlyAmount,
            discount: plan.yearlyDiscount,
        };
    }

    return {
        monthly: monthlyAmount,
        yearly: monthlyAmount * 12,
        yearlyMonthly: monthlyAmount,
        savings: 0,
        discount: 0,
    };
}
