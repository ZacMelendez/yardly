import { prisma } from "@/lib/prisma";
import type { SubscriptionProvider, SubscriptionSyncInput } from "./types";
import { PLAN_LIMITS } from "../limits";

/**
 * Database-backed subscription provider. Subscriptions are managed directly in our DB
 * (admin panel, manual upgrades, etc.). Use this when Stripe is not configured.
 */
export const databaseProvider: SubscriptionProvider = {
    name: "database",

    async syncSubscription(input: SubscriptionSyncInput) {
        const limits = PLAN_LIMITS[input.planId];

        if (input.stripeSubscriptionId) {
            const existing = await prisma.subscription.findUnique({
                where: { stripeSubscriptionId: input.stripeSubscriptionId },
            });

            const data = {
                userId: input.userId,
                planId: input.planId,
                planName: input.planName,
                status: input.status,
                stripeCustomerId: input.stripeCustomerId ?? undefined,
                stripePriceId: input.stripePriceId ?? undefined,
                billingCycle: input.billingCycle,
                amount: input.amount,
                currency: input.currency ?? "usd",
                currentPeriodStart: input.currentPeriodStart,
                currentPeriodEnd: input.currentPeriodEnd,
                cancelAtPeriodEnd: input.cancelAtPeriodEnd ?? false,
                canceledAt: input.canceledAt ?? undefined,
                trialStart: input.trialStart ?? undefined,
                trialEnd: input.trialEnd ?? undefined,
                maxCustomers: input.maxCustomers ?? limits?.maxCustomers ?? null,
                maxJobs: input.maxJobs ?? limits?.maxJobs ?? null,
                maxInvoicesPerMonth:
                    input.maxInvoicesPerMonth ?? limits?.maxInvoicesPerMonth ?? null,
            };

            if (existing) {
                await prisma.subscription.update({
                    where: { id: existing.id },
                    data,
                });
            } else {
                await prisma.subscription.create({
                    data: {
                        ...data,
                        stripeSubscriptionId: input.stripeSubscriptionId,
                    },
                });
            }
        } else {
            // No Stripe ID - create/update by userId for non-Stripe flows
            await prisma.subscription.updateMany({
                where: { userId: input.userId },
                data: { status: "cancelled" },
            });

            await prisma.subscription.create({
                data: {
                    userId: input.userId,
                    planId: input.planId,
                    planName: input.planName,
                    status: input.status,
                    billingCycle: input.billingCycle,
                    amount: input.amount,
                    currency: input.currency ?? "usd",
                    currentPeriodStart: input.currentPeriodStart,
                    currentPeriodEnd: input.currentPeriodEnd,
                    cancelAtPeriodEnd: input.cancelAtPeriodEnd ?? false,
                    maxCustomers: input.maxCustomers ?? limits?.maxCustomers ?? null,
                    maxJobs: input.maxJobs ?? limits?.maxJobs ?? null,
                    maxInvoicesPerMonth:
                        input.maxInvoicesPerMonth ?? limits?.maxInvoicesPerMonth ?? null,
                },
            });
        }
    },
};
