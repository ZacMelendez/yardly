/**
 * Subscription module - re-exports for backward compatibility.
 * New code should import from @/lib/subscription or @/lib/subscription/index.
 */

export {
    getUserSubscription,
    checkFeatureAccess,
    checkUsageLimits,
    PLAN_LIMITS,
} from "./subscription/limits";
export { validateSubscriptionForEvent } from "./subscription/validate";
export type { SubscriptionLimits, UsageLimitsResult } from "./subscription/types";
