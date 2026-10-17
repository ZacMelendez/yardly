/**
 * Create a Stripe Checkout session for subscription upgrade.
 * When STRIPE_SECRET_KEY is set, redirects to Stripe; otherwise returns error.
 *
 * POST /api/subscription/checkout
 * Body: { planId, billingCycle }
 */

import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getSubscriptionProvider } from "@/lib/subscription/providers";
import type { SubscriptionPlanId } from "@/lib/subscription-types";

export async function POST(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { planId, billingCycle = "monthly" } = body as {
            planId?: SubscriptionPlanId;
            billingCycle?: "monthly" | "yearly";
        };

        if (!planId || !["basic", "pro", "enterprise"].includes(planId)) {
            return NextResponse.json(
                { error: "Invalid plan. Use basic, pro, or enterprise." },
                { status: 400 }
            );
        }

        const provider = getSubscriptionProvider();
        if (!provider.createCheckoutSession) {
            return NextResponse.json(
                {
                    error: "Stripe checkout not configured",
                    message:
                        "Set STRIPE_SECRET_KEY and Stripe price IDs to enable checkout.",
                },
                { status: 503 }
            );
        }

        const { url } = await provider.createCheckoutSession(
            session.user.id,
            planId,
            billingCycle,
            { organizationId: (session.session as { activeOrganizationId?: string })?.activeOrganizationId ?? "" }
        );

        return NextResponse.json({ url });
    } catch (error) {
        console.error("Checkout error:", error);
        const message =
            error instanceof Error ? error.message : "Checkout failed";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
