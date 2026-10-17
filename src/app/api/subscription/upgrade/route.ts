import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import {
    SUBSCRIPTION_PLANS,
    SubscriptionPlanId,
    BillingCycle,
    getPlanPricing,
} from "@/lib/subscription-types";

export async function POST(request: NextRequest) {
    try {
        const session = await getSession();

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await request.json();
        const {
            planId,
            billingCycle = "monthly",
        }: {
            planId: SubscriptionPlanId;
            billingCycle?: BillingCycle;
        } = body;

        // Validate plan exists
        if (!SUBSCRIPTION_PLANS[planId]) {
            return NextResponse.json(
                { error: "Invalid plan selected" },
                { status: 400 }
            );
        }

        const selectedPlan = SUBSCRIPTION_PLANS[planId];
        const pricing = getPlanPricing(planId, billingCycle);

        if (!pricing) {
            return NextResponse.json(
                { error: "Unable to calculate pricing" },
                { status: 400 }
            );
        }

        const userId = session.user.id;

        // Check if user already has an active subscription
        const existingSubscription = await prisma.subscription.findFirst({
            where: {
                userId,
                status: { in: ["active", "trialing"] },
            },
            orderBy: { createdAt: "desc" },
        });

        // If downgrading to free plan, cancel existing subscription
        if (planId === "free") {
            if (existingSubscription) {
                await prisma.subscription.update({
                    where: { id: existingSubscription.id },
                    data: {
                        status: "cancelled",
                        canceledAt: new Date(),
                        cancelAtPeriodEnd: true,
                    },
                });
            }

            return NextResponse.json({
                success: true,
                message: "Successfully downgraded to free plan",
                subscription: {
                    planId: "free",
                    planName: "Free Plan",
                    status: "active",
                },
            });
        }

        // For paid plans, we'll simulate the payment process
        // In a real implementation, this is where you'd integrate with Stripe
        const amount =
            billingCycle === "yearly" ? pricing.yearly : pricing.monthly;

        // Create or update subscription
        const subscriptionData = {
            userId,
            planId,
            planName: selectedPlan.planName,
            status: "active" as const,
            billingCycle,
            amount,
            currency: "usd" as const,
            maxCustomers: selectedPlan.maxCustomers,
            maxJobs: selectedPlan.maxJobs,
            maxInvoicesPerMonth: selectedPlan.maxInvoicesPerMonth,
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(
                Date.now() +
                    (billingCycle === "yearly" ? 365 : 30) * 24 * 60 * 60 * 1000
            ),
        };

        let subscription;

        if (existingSubscription) {
            // Update existing subscription
            subscription = await prisma.subscription.update({
                where: { id: existingSubscription.id },
                data: subscriptionData,
            });
        } else {
            // Create new subscription
            subscription = await prisma.subscription.create({
                data: subscriptionData,
            });
        }

        return NextResponse.json({
            success: true,
            message: `Successfully upgraded to ${selectedPlan.planName}`,
            subscription: {
                id: subscription.id,
                planId: subscription.planId,
                planName: subscription.planName,
                status: subscription.status,
                billingCycle: subscription.billingCycle,
                amount: subscription.amount,
                currentPeriodEnd: subscription.currentPeriodEnd,
            },
            pricing: {
                monthly: pricing.monthly,
                yearly: pricing.yearly,
                savings: pricing.savings,
                discount: pricing.discount,
            },
        });
    } catch (error) {
        console.error("Subscription upgrade error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        const session = await getSession();

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const planId = searchParams.get("planId") as SubscriptionPlanId;
        const billingCycle =
            (searchParams.get("billingCycle") as BillingCycle) || "monthly";

        if (!planId || !SUBSCRIPTION_PLANS[planId]) {
            return NextResponse.json(
                { error: "Invalid plan ID" },
                { status: 400 }
            );
        }

        const pricing = getPlanPricing(planId, billingCycle);
        const plan = SUBSCRIPTION_PLANS[planId];

        return NextResponse.json({
            plan,
            pricing,
            billingCycle,
        });
    } catch (error) {
        console.error("Subscription pricing error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
