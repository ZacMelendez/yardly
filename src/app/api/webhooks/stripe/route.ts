/**
 * Stripe webhook handler for subscription lifecycle events.
 *
 * Configure your Stripe webhook to POST to: /api/webhooks/stripe
 * Signing secret: STRIPE_WEBHOOK_SECRET
 *
 * Recommended events to subscribe to:
 * - customer.subscription.created
 * - customer.subscription.updated
 * - customer.subscription.deleted
 * - invoice.payment_succeeded
 * - invoice.payment_failed
 */

import { NextRequest, NextResponse } from "next/server";
import { Stripe } from "stripe";
import {
    stripeSubscriptionToSyncInput,
    getSubscriptionProvider,
} from "@/lib/subscription/providers";
import { prisma } from "@/lib/prisma";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
if (!webhookSecret && process.env.NODE_ENV === "production") {
    console.warn(
        "STRIPE_WEBHOOK_SECRET is not set. Stripe webhooks will not be verified."
    );
}

export async function POST(req: NextRequest) {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature || !webhookSecret) {
        return NextResponse.json(
            { error: "Missing webhook signature or secret" },
            { status: 400 }
        );
    }

    let event: Stripe.Event;
    try {
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        console.error("Stripe webhook signature verification failed:", message);
        return NextResponse.json(
            { error: `Webhook Error: ${message}` },
            { status: 400 }
        );
    }

    const provider = getSubscriptionProvider();

    switch (event.type) {
        case "customer.subscription.created":
        case "customer.subscription.updated": {
            const sub = event.data.object as Stripe.Subscription;
            const userId = (sub.metadata?.userId ?? sub.metadata?.user_id) as
                | string
                | undefined;

            if (!userId) {
                console.warn(
                    `Stripe subscription ${sub.id} has no userId in metadata`
                );
                break;
            }

            const input = stripeSubscriptionToSyncInput(sub, userId);
            if (input) {
                await provider.syncSubscription(input);
            }
            break;
        }

        case "customer.subscription.deleted": {
            const sub = event.data.object as Stripe.Subscription;
            const userId = (sub.metadata?.userId ?? sub.metadata?.user_id) as
                | string
                | undefined;

            if (userId && sub.id) {
                await prisma.subscription.updateMany({
                    where: { stripeSubscriptionId: sub.id },
                    data: { status: "expired" },
                });
            }
            break;
        }

        case "checkout.session.completed": {
            const session = event.data.object as Stripe.Checkout.Session;
            if (session.mode !== "subscription" || !session.subscription) break;

            const userId = (session.metadata?.userId ?? session.metadata?.user_id) as
                | string
                | undefined;
            if (!userId) break;

            const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
            const subscription = await stripe.subscriptions.retrieve(
                session.subscription as string,
                { expand: ["items.data.price"] }
            );

            const input = stripeSubscriptionToSyncInput(subscription, userId);
            if (input) {
                await provider.syncSubscription(input);
            }
            break;
        }

        case "invoice.paid": {
            const stripeInvoice = event.data.object as Stripe.Invoice;
            if (!stripeInvoice.id) break;
            await prisma.invoice.updateMany({
                where: { stripeInvoiceId: stripeInvoice.id },
                data: { status: "paid" },
            });
            break;
        }

        default:
            // Unhandled event type - ignore
            break;
    }

    return NextResponse.json({ received: true });
}
