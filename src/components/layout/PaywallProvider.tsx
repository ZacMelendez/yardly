"use client";

import { usePaywallModal } from "../ui/PaywallModal";

export function PaywallProvider({ children }: { children: React.ReactNode }) {
    const { PaywallModal } = usePaywallModal();

    return (
        <>
            {children}
            <PaywallModal />
        </>
    );
}
