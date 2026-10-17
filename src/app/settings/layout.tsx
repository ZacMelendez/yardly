import { AppShellLayout } from "@/components/layout/AppShellLayout";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";

export default async function SettingsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getSession();
    if (!session?.user) {
        redirect("/login");
    }

    return <AppShellLayout>{children}</AppShellLayout>;
}
