import { NextResponse } from "next/server";
import {
    validateSubscriptionForEvent,
    checkFeatureAccess,
} from "@/lib/subscription";

export type { ValidationResult } from "@/lib/subscription/validate";

/**
 * Validates if a user can create a new customer.
 * Called only on POST /api/customers.
 */
export async function validateCustomerCreation(
    userId: string,
    organizationId: string
) {
    return validateSubscriptionForEvent("create_customer", userId, organizationId);
}

/**
 * Validates if a user can create a new job.
 * Called only on POST /api/jobs.
 */
export async function validateJobCreation(
    userId: string,
    organizationId: string
) {
    return validateSubscriptionForEvent("create_job", userId, organizationId);
}

/**
 * Validates if a user can create a new invoice.
 * Called only when creating invoices.
 */
export async function validateInvoiceCreation(
    userId: string,
    organizationId: string
) {
    return validateSubscriptionForEvent("create_invoice", userId, organizationId);
}

/**
 * Validates if a user has access to a specific feature.
 * Called only when the feature is used (e.g. create estimate requires "estimates").
 */
export async function validateFeatureAccess(
    userId: string,
    feature: string
) {
    try {
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
    } catch (error) {
        console.error("Error validating feature access:", error);
        return {
            success: false,
            error: NextResponse.json(
                { error: "Failed to validate feature access" },
                { status: 500 }
            ),
        };
    }
}

/**
 * Validates bulk operations against subscription limits.
 * Called only on bulk upload / batch create endpoints.
 */
export async function validateBulkOperation(
    userId: string,
    organizationId: string,
    operationType: "customers" | "jobs" | "monthlyInvoices",
    requestedCount: number
) {
    const eventMap = {
        customers: "bulk_upload_customers" as const,
        jobs: "create_job" as const,
        monthlyInvoices: "create_invoice" as const,
    };

    const event = eventMap[operationType];
    return validateSubscriptionForEvent(event, userId, organizationId, {
        requestedCount,
    });
}
