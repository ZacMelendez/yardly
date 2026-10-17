import { NextResponse } from "next/server";
import {
    checkUsageLimits,
    checkFeatureAccess,
} from "./limits";
import {
    SubscriptionEvent,
    EVENT_LIMIT_MAP,
    EVENT_FEATURE_MAP,
} from "./events";

export interface ValidationResult {
    success: boolean;
    error?: NextResponse;
}

/**
 * Validates subscription for a specific event. Call this only when the event occurs
 * (e.g. on create_customer, create_job, etc.), not on every request.
 */
export async function validateSubscriptionForEvent(
    event: SubscriptionEvent,
    userId: string,
    organizationId: string,
    options?: {
        /** For bulk operations: number of items being added */
        requestedCount?: number;
    }
): Promise<ValidationResult> {
    try {
        const limitType = EVENT_LIMIT_MAP[event];

        if (limitType === "feature") {
            const feature = EVENT_FEATURE_MAP[event];
            if (!feature) return { success: true };

            const hasAccess = await checkFeatureAccess(userId, feature);
            if (!hasAccess) {
                return {
                    success: false,
                    error: NextResponse.json(
                        {
                            error: "Feature not available",
                            message: `This feature is not available in your current plan. Please upgrade to access this feature.`,
                            feature,
                            limitType: "feature",
                        },
                        { status: 403 }
                    ),
                };
            }
            return { success: true };
        }

        const limits = await checkUsageLimits(userId, organizationId);
        const limitInfo = limits[limitType];
        const limit = limitInfo.limit;

        if (limit === null) return { success: true };

        const requestedCount = options?.requestedCount ?? 1;
        const wouldExceed = limitInfo.current + requestedCount > limit;

        if (wouldExceed) {
            const remaining = limit - limitInfo.current;
            const limitTypeLabel =
                limitType === "monthlyInvoices"
                    ? "monthly invoices"
                    : limitType;

            return {
                success: false,
                error: NextResponse.json(
                    requestedCount > 1
                        ? {
                              error: `${limitType} limit would be exceeded`,
                              message: `You can only add ${remaining} more ${limitTypeLabel}. You requested ${requestedCount}. Please reduce the number of items or upgrade your plan.`,
                              currentUsage: limitInfo.current,
                              limit,
                              requestedCount,
                              remaining,
                              limitType,
                          }
                        : {
                              error:
                                  limitType === "customers"
                                      ? "Customer limit exceeded"
                                      : limitType === "jobs"
                                        ? "Job limit exceeded"
                                        : "Monthly invoice limit exceeded",
                              message: `You have reached your limit of ${limit} ${limitTypeLabel}. Please upgrade your plan to add more.`,
                              currentUsage: limitInfo.current,
                              limit,
                              limitType,
                          },
                    { status: 403 }
                ),
            };
        }

        return { success: true };
    } catch (error) {
        console.error(`Error validating subscription for event "${event}":`, error);
        return {
            success: false,
            error: NextResponse.json(
                { error: "Failed to validate subscription limits" },
                { status: 500 }
            ),
        };
    }
}
