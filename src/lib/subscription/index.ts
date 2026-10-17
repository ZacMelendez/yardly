/**
 * Subscription module - event-based validation and provider abstraction.
 *
 * Usage:
 * - Call validateSubscriptionForEvent() only on applicable API routes (create customer, job, etc.)
 * - Use getSubscriptionProvider() for Stripe checkout/portal when STRIPE_SECRET_KEY is set
 * - Session still loads minimal subscription info for UI (plan name, features) via getUserSubscription
 */

export {
    getUserSubscription,
    checkFeatureAccess,
    checkUsageLimits,
    PLAN_LIMITS,
} from "./limits";
export type { SubscriptionLimits, UsageLimitsResult, ResolvedSubscription } from "./types";
export { validateSubscriptionForEvent } from "./validate";
export type { ValidationResult } from "./validate";
export type { SubscriptionEvent } from "./events";
export { EVENT_LIMIT_MAP, EVENT_FEATURE_MAP } from "./events";
export {
    getSubscriptionProvider,
    stripeProvider,
    databaseProvider,
    stripeSubscriptionToSyncInput,
} from "./providers";
export type { SubscriptionProvider, SubscriptionSyncInput } from "./providers";
