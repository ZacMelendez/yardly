"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { notifications } from "@mantine/notifications";
import { ApiError } from "@/lib/api-error";

interface LimitError {
    limitType: "customers" | "jobs" | "monthlyInvoices" | "feature";
    currentUsage?: number;
    limit?: number;
    feature?: string;
    message: string;
}

/** Normalizes an error into a structure we can read (handles ApiError, Error, or plain objects) */
function normalizeError(error: unknown): {
    error?: string;
    message?: string;
    limitType?: LimitError["limitType"];
    currentUsage?: number;
    limit?: number;
    feature?: string;
    retryAfter?: number;
} {
    if (error instanceof ApiError) {
        return {
            error: error.error,
            message: error.bodyMessage ?? error.message,
            limitType: error.limitType,
            currentUsage: error.currentUsage,
            limit: error.limit,
            feature: error.feature,
            retryAfter: error.retryAfter,
        };
    }
    if (error && typeof error === "object" && "limitType" in error) {
        return error as Record<string, unknown>;
    }
    // Try to parse JSON from Error message (legacy)
    if (error instanceof Error && error.message) {
        try {
            const parsed = JSON.parse(error.message) as Record<string, unknown>;
            return parsed;
        } catch {
            return { message: error.message };
        }
    }
    return {};
}

export function useSubscriptionLimits() {
    const [limitModal, setLimitModal] = useState<{
        opened: boolean;
        error: LimitError | null;
    }>({
        opened: false,
        error: null,
    });

    const router = useRouter();

    const handleLimitError = useCallback((error: unknown): boolean => {
        const e = normalizeError(error);

        // Rate limit (429) - show notification
        if (
            (error instanceof ApiError && error.isRateLimited) ||
            e.error === "Too Many Requests" ||
            e.error === "Rate limit exceeded"
        ) {
            let message =
                e.message ||
                "You're making requests too quickly. Please slow down.";
            if (e.retryAfter && e.retryAfter > 0) {
                message = `Please try again in ${e.retryAfter} seconds.`;
            }
            notifications.show({
                title: "Too Many Requests",
                message,
                color: "orange",
                autoClose: 6000,
            });
            return true;
        }

        // Subscription limit or feature not available (403)
        if (e.limitType || e.error === "Feature not available") {
            setLimitModal({
                opened: true,
                error: {
                    limitType: e.limitType ?? "feature",
                    currentUsage: e.currentUsage,
                    limit: e.limit,
                    feature: e.feature,
                    message:
                        e.message ||
                        "This action is not available on your current plan. Please upgrade to continue.",
                },
            });
            return true;
        }

        return false;
    }, []);

    const closeLimitModal = useCallback(() => {
        setLimitModal({
            opened: false,
            error: null,
        });
    }, []);

    const handleUpgrade = useCallback(() => {
        closeLimitModal();
        router.push("/purchase");
    }, [closeLimitModal, router]);

    const showLimitNotification = useCallback(
        (message: string, type: "warning" | "error" = "warning") => {
            notifications.show({
                title: "Subscription Limit",
                message,
                color: type === "error" ? "red" : "orange",
                autoClose: 5000,
            });
        },
        []
    );

    return {
        limitModal,
        handleLimitError,
        closeLimitModal,
        handleUpgrade,
        showLimitNotification,
    };
}
