import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { getUserIdOrOrgId, buildScopeWhere } from "../api/utils";
import { prisma } from "@/lib/prisma";
import InvoicesView from "@/components/views/InvoicesView";

async function getInvoices() {
    const scope = await getUserIdOrOrgId();
    const scopeWhere = buildScopeWhere(scope);

    const invoices = await prisma.invoice.findMany({
        where: scopeWhere,
        include: {
            customer: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
            items: true,
            job: {
                select: { id: true, title: true },
            },
        },
        orderBy: { createdAt: "desc" },
    });

    return JSON.parse(JSON.stringify(invoices));
}

export default async function InvoicesPage() {
    const session = await getSession();

    if (!session?.user?.email) {
        redirect("/login?callbackUrl=" + encodeURIComponent("/invoices"));
    }

    const invoices = await getInvoices();

    return <InvoicesView initialInvoices={invoices} />;
}
