"use client";

import { ReactNode } from "react";
import { notifications } from "@mantine/notifications";
import { useSubscriptionLimits } from "@/hooks/useSubscriptionLimits";
import SubscriptionLimitModal from "./SubscriptionLimitModal";

interface ApiErrorHandlerProps {
    children: ReactNode;
}

export default function ApiErrorHandler({ children }: ApiErrorHandlerProps) {
    const { limitModal, closeLimitModal, handleUpgrade } =
        useSubscriptionLimits();

    return (
        <>
            {children}
            <SubscriptionLimitModal
                opened={limitModal.opened}
                onClose={closeLimitModal}
                limitType={limitModal.error?.limitType || "customers"}
                currentUsage={limitModal.error?.currentUsage}
                limit={limitModal.error?.limit}
                feature={limitModal.error?.feature}
                onUpgrade={handleUpgrade}
            />
        </>
    );
}

// Hook for making API calls with automatic error handling
export function useApiCall() {
    const { handleLimitError } = useSubscriptionLimits();

    const makeApiCall = async <T,>(
        apiCall: () => Promise<T>,
        options?: {
            onSuccess?: (data: T) => void;
            onError?: (error: unknown) => void;
            showNotifications?: boolean;
        }
    ): Promise<T | null> => {
        try {
            const result = await apiCall();
            options?.onSuccess?.(result);
            return result;
        } catch (error: unknown) {
            console.error("API call error:", error);

            // Try to handle rate/subscription limit errors (shows notification or modal)
            const handled = handleLimitError(error);

            if (!handled && options?.showNotifications !== false) {
                const message =
                    error instanceof Error
                        ? error.message
                        : typeof error === "object" && error && "message" in error
                          ? String((error as { message?: unknown }).message)
                          : "An unexpected error occurred. Please try again.";
                notifications.show({
                    title: "Error",
                    message,
                    color: "red",
                    autoClose: 5000,
                });
            }

            options?.onError?.(error);
            return null;
        }
    };

    return { makeApiCall };
}
