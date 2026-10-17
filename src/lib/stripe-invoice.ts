/**
 * Stripe customer invoicing: create/finalize Stripe Invoice for a Yardly invoice,
 * and ensure Customer has a Stripe customer ID. Used when sending invoices so
 * customers can pay via Stripe. Requires STRIPE_SECRET_KEY.
 */

import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

function getStripe(): Stripe | null {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) return null;
    return new Stripe(key);
}

export interface CreateStripeInvoiceInput {
    yardlyInvoiceId: string;
    customerId: string;
    customerEmail: string | null;
    customerName: string;
    items: { description: string; quantity: number; unitPrice: number }[];
    dueDate: Date | null;
}

/**
 * Ensure the Yardly customer has a Stripe customer ID; create one if not.
 * Updates the Customer record with stripeCustomerId.
 */
export async function ensureStripeCustomer(
    yardlyCustomerId: string,
    email: string | null,
    name: string
): Promise<string | null> {
    const stripe = getStripe();
    if (!stripe) return null;

    const customer = await prisma.customer.findUnique({
        where: { id: yardlyCustomerId },
        select: { stripeCustomerId: true },
    });
    if (!customer) return null;
    if (customer.stripeCustomerId) return customer.stripeCustomerId;

    const stripeCustomer = await stripe.customers.create({
        email: email ?? undefined,
        name: name || undefined,
        metadata: { yardlyCustomerId },
    });

    await prisma.customer.update({
        where: { id: yardlyCustomerId },
        data: { stripeCustomerId: stripeCustomer.id },
    });
    return stripeCustomer.id;
}

/**
 * Create a Stripe invoice for the given Yardly invoice, finalize it, and return
 * the hosted invoice URL for the customer to pay. Stores stripeInvoiceId on the
 * Yardly invoice. Returns null if Stripe is not configured or creation fails.
 */
export async function createAndFinalizeStripeInvoice(
    input: CreateStripeInvoiceInput
): Promise<{ hostedInvoiceUrl: string | null; stripeInvoiceId: string } | null> {
    const stripe = getStripe();
    if (!stripe) return null;

    const stripeCustomerId = await ensureStripeCustomer(
        input.customerId,
        input.customerEmail,
        input.customerName
    );
    if (!stripeCustomerId) return null;

    const stripeInvoice = await stripe.invoices.create({
        customer: stripeCustomerId,
        collection_method: "send_invoice",
        days_until_due: input.dueDate
            ? Math.max(
                  1,
                  Math.ceil(
                      (input.dueDate.getTime() - Date.now()) / (24 * 60 * 60 * 1000)
                  )
              )
            : 30,
        metadata: { yardlyInvoiceId: input.yardlyInvoiceId },
    });

    for (const item of input.items) {
        await stripe.invoiceItems.create({
            customer: stripeCustomerId,
            invoice: stripeInvoice.id,
            description: item.description,
            quantity: item.quantity,
            unit_amount_decimal: String(Math.round(item.unitPrice * 100)), // cents
            currency: "usd",
        });
    }

    const finalized = await stripe.invoices.finalizeInvoice(stripeInvoice.id);
    const hostedInvoiceUrl =
        typeof finalized.hosted_invoice_url === "string"
            ? finalized.hosted_invoice_url
            : null;

    await prisma.invoice.update({
        where: { id: input.yardlyInvoiceId },
        data: { stripeInvoiceId: finalized.id },
    });

    return {
        hostedInvoiceUrl,
        stripeInvoiceId: finalized.id,
    };
}

/**
 * Get the hosted invoice URL for an existing Stripe invoice (e.g. for resend).
 */
export async function getStripeInvoiceHostedUrl(
    stripeInvoiceId: string
): Promise<string | null> {
    const stripe = getStripe();
    if (!stripe) return null;
    try {
        const inv = await stripe.invoices.retrieve(stripeInvoiceId);
        return typeof inv.hosted_invoice_url === "string"
            ? inv.hosted_invoice_url
            : null;
    } catch {
        return null;
    }
}
