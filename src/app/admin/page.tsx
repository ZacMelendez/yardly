import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import AdminPage from "./components/AdminPage";

async function checkAdminAccess(userId: string): Promise<boolean> {
    const adminIds = process.env.ADMIN_USER_IDS?.split(",") || [];
    return adminIds.includes(userId);
}

export default async function Index() {
    const session = await getSession();

    if (!session?.user?.id) {
        redirect("/login?callbackUrl=" + encodeURIComponent("/admin"));
    }

    const isAdmin = await checkAdminAccess(session.user.id);

    if (!isAdmin) {
        redirect("/");
    }

    return <AdminPage session={session} />;
}
