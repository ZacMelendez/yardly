// hooks/useSubscription.ts - React hook for client-side gating
import { useSession } from "@/lib/auth-client";
import type { Session } from "@/lib/auth";
import useSWR from "swr";

export function useSubscription() {
    const { data } = useSession();
    const session = data as Session | null | undefined;

    const { data: limits, error } = useSWR(
        session?.user?.id ? `/api/subscription/limits` : null,
        (url: string) => fetch(url).then((res) => res.json())
    );

    const hasFeature = (feature: string) => {
        return (
            session?.user?.subscription?.features.includes("all") ||
            session?.user?.subscription?.features.includes(feature)
        );
    };

    const isAtLimit = (limitType: "customers" | "jobs" | "monthlyInvoices") => {
        return limits?.[limitType]?.isAtLimit || false;
    };

    return {
        subscription: session?.user?.subscription,
        limits,
        hasFeature,
        isAtLimit,
        isLoading: !session && !error,
        error,
    };
}
