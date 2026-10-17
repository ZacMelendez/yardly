"use client";
import { usePathname } from "next/navigation";
import { AppShellLayout } from "./AppShellLayout";

interface ConditionalLayoutProps {
    children: React.ReactNode;
}

// Pages that should use the AppShell layout (authenticated pages)
const appShellPages = [
    "/dashboard",
    "/customers",
    "/estimates",
    "/jobs",
    "/services",
    // "/settings",
];

export function ConditionalLayout({ children }: ConditionalLayoutProps) {
    const pathname = usePathname();

    // Check if current page should use AppShell
    const shouldUseAppShell = appShellPages.some((page) => {
        if (!pathname.startsWith(page)) return false;

        // Explicitly exclude public quote acceptance page from AppShell
        if (pathname.startsWith("/estimates/accept")) return false;

        return true;
    });

    if (shouldUseAppShell) {
        return <AppShellLayout>{children}</AppShellLayout>;
    }

    // Return children without AppShell for public pages
    return <>{children}</>;
}
