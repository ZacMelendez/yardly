"use client";
import { Notifications } from "@mantine/notifications";
import { QueryClient } from "@tanstack/react-query";
import { QueryClientAtomProvider } from "jotai-tanstack-query/react";
import { PropsWithChildren, useState } from "react";
// import { PaywallProvider } from "./PaywallProvider";

export function Providers({ children }: PropsWithChildren) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        staleTime: 5 * 60 * 1000, // 5 minutes
                        retry: 1,
                    },
                },
            })
    );

    return (
        <QueryClientAtomProvider client={queryClient}>
            <Notifications />
            {/* <PaywallProvider> */}
            {children}
            {/* </PaywallProvider> */}
        </QueryClientAtomProvider>
    );
}
