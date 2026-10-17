# Stripe Subscription Integration

The subscription model is designed to tie in with Stripe. When `STRIPE_SECRET_KEY` is set, the app uses Stripe for checkout; otherwise it uses database-only subscriptions (admin panel, manual upgrades).

## Environment Variables

```env
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...

# Map each plan + billing cycle to your Stripe Price IDs
STRIPE_PRICE_BASIC_MONTHLY=price_xxx
STRIPE_PRICE_BASIC_YEARLY=price_xxx
STRIPE_PRICE_PRO_MONTHLY=price_xxx
STRIPE_PRICE_PRO_YEARLY=price_xxx
STRIPE_PRICE_ENTERPRISE_MONTHLY=price_xxx
STRIPE_PRICE_ENTERPRISE_YEARLY=price_xxx
```

## Webhook Setup

1. In Stripe Dashboard → Developers → Webhooks, add endpoint: `https://your-domain.com/api/webhooks/stripe`
2. Subscribe to: `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `checkout.session.completed`
3. Copy the signing secret to `STRIPE_WEBHOOK_SECRET`

## Checkout Flow

- **POST /api/subscription/checkout** – Creates a Stripe Checkout session and returns `{ url }` to redirect the user
- Pass `{ planId, billingCycle }` in the body
- After payment, Stripe redirects to `/purchase?success=true&session_id=...` and the webhook syncs the subscription to the database

## Customer Invoicing (Payments)

When you send an invoice to a customer (from Invoices or Customer detail), the app can create a Stripe Invoice so the customer can pay online:

- **Requires** `STRIPE_SECRET_KEY` (same as subscription). No extra env vars.
- When you click **Send** on an invoice, the app:
  1. Creates a Stripe Customer for your customer (if needed) and stores `stripeCustomerId` on the Customer record.
  2. Creates a Stripe Invoice with the same line items, finalizes it, and stores `stripeInvoiceId` on the Invoice.
  3. Emails the customer with the PDF and a **Pay online** button that links to Stripe’s hosted invoice page.
- When the customer pays, Stripe sends `invoice.paid`. The webhook updates the Yardly invoice status to **paid**.

**Webhook:** Add `invoice.paid` to your Stripe webhook events (in addition to the subscription events) so invoice payments are recorded.
