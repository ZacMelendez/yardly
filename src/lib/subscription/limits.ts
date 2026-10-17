import { prisma } from "@/lib/prisma";
import type { SubscriptionLimits, UsageLimitsResult, ResolvedSubscription } from "./types";

export const PLAN_LIMITS: Record<string, SubscriptionLimits> = {
    free: {
        maxCustomers: 5,
        maxJobs: 10,
        maxInvoicesPerMonth: 5,
        features: ["basic_invoicing", "customer_management"],
    },
    basic: {
        maxCustomers: 50,
        maxJobs: 100,
        maxInvoicesPerMonth: 50,
        features: [
            "basic_invoicing",
            "customer_management",
            "estimates",
            "job_scheduling",
        ],
    },
    pro: {
        maxCustomers: 200,
        maxJobs: 500,
        maxInvoicesPerMonth: 200,
        features: [
            "basic_invoicing",
            "customer_management",
            "estimates",
            "job_scheduling",
            "recurring_jobs",
            "advanced_reporting",
        ],
    },
    enterprise: {
        maxCustomers: null,
        maxJobs: null,
        maxInvoicesPerMonth: null,
        features: ["all"],
    },
};

export async function getUserSubscription(userId: string): Promise<ResolvedSubscription> {
    const subscription = await prisma.subscription.findFirst({
        where: {
            userId,
            status: { in: ["active", "trialing"] },
        },
        orderBy: { createdAt: "desc" },
    });

    if (!subscription) {
        return {
            planId: "free",
            planName: "Free Plan",
            status: "active",
            ...PLAN_LIMITS.free,
        };
    }

    const limits = PLAN_LIMITS[subscription.planId] ?? PLAN_LIMITS.free;
    return {
        ...subscription,
        ...limits,
    };
}

export async function checkFeatureAccess(
    userId: string,
    feature: string
): Promise<boolean> {
    const subscription = await getUserSubscription(userId);
    return (
        subscription.features.includes("all") ||
        subscription.features.includes(feature)
    );
}

export async function checkUsageLimits(
    userId: string,
    organizationId: string
): Promise<UsageLimitsResult> {
    const subscription = await getUserSubscription(userId);

    const [customerCount, jobCount, monthlyInvoiceCount] = await Promise.all([
        prisma.customer.count({ where: { organizationId } }),
        prisma.job.count({ where: { organizationId } }),
        prisma.invoice.count({
            where: {
                organizationId,
                createdAt: {
                    gte: new Date(
                        new Date().getFullYear(),
                        new Date().getMonth(),
                        1
                    ),
                },
            },
        }),
    ]);

    return {
        customers: {
            current: customerCount,
            limit: subscription.maxCustomers,
            isAtLimit:
                subscription.maxCustomers !== null &&
                customerCount >= subscription.maxCustomers,
        },
        jobs: {
            current: jobCount,
            limit: subscription.maxJobs,
            isAtLimit:
                subscription.maxJobs !== null &&
                jobCount >= subscription.maxJobs,
        },
        monthlyInvoices: {
            current: monthlyInvoiceCount,
            limit: subscription.maxInvoicesPerMonth,
            isAtLimit:
                subscription.maxInvoicesPerMonth !== null &&
                monthlyInvoiceCount >= subscription.maxInvoicesPerMonth,
        },
    };
}
