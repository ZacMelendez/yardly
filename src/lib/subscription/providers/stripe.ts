/**
 * Stripe subscription provider.
 *
 * Setup:
 * 1. pnpm add stripe
 * 2. Add STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY to .env
 * 3. Map your Stripe price IDs to plan IDs in STRIPE_PRICE_IDS (see below)
 * 4. Add webhook route: src/app/api/webhooks/stripe/route.ts (use stripeWebhookHandler)
 *
 * Stripe price ID mapping (env or config):
 * STRIPE_PRICE_BASIC_MONTHLY=price_xxx
 * STRIPE_PRICE_BASIC_YEARLY=price_xxx
 * STRIPE_PRICE_PRO_MONTHLY=price_xxx
 * STRIPE_PRICE_PRO_YEARLY=price_xxx
 * STRIPE_PRICE_ENTERPRISE_MONTHLY=price_xxx
 * STRIPE_PRICE_ENTERPRISE_YEARLY=price_xxx
 */

import { Stripe } from "stripe";
import type { SubscriptionProvider, SubscriptionSyncInput } from "./types";
import { databaseProvider } from "./database";
import type { SubscriptionPlanId } from "@/lib/subscription-types";
import { SUBSCRIPTION_PLANS } from "@/lib/subscription-types";

const STRIPE_PRICE_IDS: Record<string, string> = {
    "basic:monthly": process.env.STRIPE_PRICE_BASIC_MONTHLY ?? "",
    "basic:yearly": process.env.STRIPE_PRICE_BASIC_YEARLY ?? "",
    "pro:monthly": process.env.STRIPE_PRICE_PRO_MONTHLY ?? "",
    "pro:yearly": process.env.STRIPE_PRICE_PRO_YEARLY ?? "",
    "enterprise:monthly": process.env.STRIPE_PRICE_ENTERPRISE_MONTHLY ?? "",
    "enterprise:yearly": process.env.STRIPE_PRICE_ENTERPRISE_YEARLY ?? "",
};

/** Map Stripe price ID back to our plan ID and billing cycle */
function mapStripePriceToPlan(priceId: string): {
    planId: SubscriptionPlanId;
    billingCycle: "monthly" | "yearly";
} | null {
    for (const [key, id] of Object.entries(STRIPE_PRICE_IDS)) {
        if (id && id === priceId) {
            const [planId, cycle] = key.split(":");
            if (planId && (cycle === "monthly" || cycle === "yearly")) {
                return {
                    planId: planId as SubscriptionPlanId,
                    billingCycle: cycle,
                };
            }
        }
    }
    return null;
}

/** Map Stripe subscription status to our status */
function mapStripeStatus(
    stripeStatus: Stripe.Subscription.Status
): "active" | "trialing" | "past_due" | "canceled" | "unpaid" | "expired" {
    const map: Record<string, "active" | "trialing" | "past_due" | "canceled" | "unpaid" | "expired"> =
        {
            active: "active",
            trialing: "trialing",
            past_due: "past_due",
            canceled: "canceled",
            unpaid: "unpaid",
            incomplete: "past_due",
            incomplete_expired: "expired",
            paused: "active", // treat paused as still active for access
        };
    return map[stripeStatus] ?? "expired";
}

function getStripeClient(): Stripe | null {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) return null;
    return new Stripe(key);
}

/**
 * Parse a Stripe subscription object into our SubscriptionSyncInput.
 * Used by webhook handlers.
 */
export function stripeSubscriptionToSyncInput(
    sub: Stripe.Subscription,
    userId: string
): SubscriptionSyncInput | null {
    const priceId = sub.items?.data?.[0]?.price?.id;
    if (!priceId) return null;

    const mapped = mapStripePriceToPlan(priceId);
    if (!mapped) return null;

    const plan = SUBSCRIPTION_PLANS[mapped.planId];
    const status = mapStripeStatus(sub.status);

    return {
        userId,
        planId: mapped.planId,
        planName: plan?.planName ?? mapped.planId,
        status,
        stripeSubscriptionId: sub.id,
        stripeCustomerId: typeof sub.customer === "string" ? sub.customer : sub.customer?.id ?? null,
        stripePriceId: priceId,
        billingCycle: mapped.billingCycle,
        amount: (sub.items?.data?.[0]?.price?.unit_amount ?? 0) / 100,
        currency: (sub.items?.data?.[0]?.price?.currency ?? "usd") as string,
        currentPeriodStart: new Date((sub.current_period_start ?? 0) * 1000),
        currentPeriodEnd: new Date((sub.current_period_end ?? 0) * 1000),
        cancelAtPeriodEnd: sub.cancel_at_period_end ?? false,
        canceledAt: sub.canceled_at ? new Date(sub.canceled_at * 1000) : null,
        trialStart: sub.trial_start ? new Date(sub.trial_start * 1000) : null,
        trialEnd: sub.trial_end ? new Date(sub.trial_end * 1000) : null,
        maxCustomers: plan?.maxCustomers ?? null,
        maxJobs: plan?.maxJobs ?? null,
        maxInvoicesPerMonth: plan?.maxInvoicesPerMonth ?? null,
    };
}

/**
 * Stripe subscription provider. Syncs from Stripe webhooks and can create checkout sessions.
 * Falls back to database provider for sync when Stripe is not configured.
 */
export const stripeProvider: SubscriptionProvider = {
    name: "stripe",

    async syncSubscription(input: SubscriptionSyncInput) {
        await databaseProvider.syncSubscription(input);
    },

    async createCheckoutSession(
        userId: string,
        planId: SubscriptionPlanId,
        billingCycle: "monthly" | "yearly",
        metadata?: Record<string, string>
    ) {
        const stripe = getStripeClient();
        if (!stripe) {
            throw new Error(
                "Stripe is not configured. Set STRIPE_SECRET_KEY to enable checkout."
            );
        }

        const priceKey = `${planId}:${billingCycle}`;
        const priceId = STRIPE_PRICE_IDS[priceKey];
        if (!priceId) {
            throw new Error(
                `No Stripe price configured for ${priceKey}. Set STRIPE_PRICE_${planId.toUpperCase()}_${billingCycle.toUpperCase()}.`
            );
        }

        const baseUrl =
            process.env.BETTER_AUTH_URL ??
            (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

        const session = await stripe.checkout.sessions.create({
            mode: "subscription",
            payment_method_types: ["card"],
            line_items: [{ price: priceId, quantity: 1 }],
            success_url: `${baseUrl}/purchase?success=true&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${baseUrl}/purchase?canceled=true`,
            metadata: {
                userId,
                planId,
                billingCycle,
                ...metadata,
            },
            subscription_data: {
                metadata: { userId },
                trial_period_days: undefined,
            },
        });

        if (!session.url || !session.id) {
            throw new Error("Failed to create Stripe checkout session");
        }

        return { sessionId: session.id, url: session.url };
    },

    async createPortalSession(userId: string) {
        const stripe = getStripeClient();
        if (!stripe) {
            throw new Error(
                "Stripe is not configured. Set STRIPE_SECRET_KEY to enable portal."
            );
        }

        // Look up Stripe customer ID from our subscription
        const { prisma } = await import("@/lib/prisma");
        const sub = await prisma.subscription.findFirst({
            where: { userId, stripeCustomerId: { not: null } },
            orderBy: { createdAt: "desc" },
        });

        const customerId = sub?.stripeCustomerId;
        if (!customerId) {
            throw new Error(
                "No Stripe customer found. Subscribe first to access the portal."
            );
        }

        const baseUrl =
            process.env.BETTER_AUTH_URL ??
            (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

        const session = await stripe.billingPortal.sessions.create({
            customer: customerId,
            return_url: `${baseUrl}/settings`,
        });

        return { url: session.url };
    },
};

/** Get the active subscription provider (Stripe if configured, else database) */
export function getSubscriptionProvider(): SubscriptionProvider {
    return process.env.STRIPE_SECRET_KEY ? stripeProvider : databaseProvider;
}
