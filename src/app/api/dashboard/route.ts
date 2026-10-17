import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdOrOrgId, buildScopeWhere } from "../utils";

export async function GET() {
    const scope = await getUserIdOrOrgId();
    const scopeWhere = buildScopeWhere(scope);
    const [customers, estimates, invoices, jobs] = await Promise.all([
        prisma.customer.count({ where: scopeWhere }),
        prisma.estimate.count({ where: scopeWhere }),
        prisma.invoice.count({ where: { ...scopeWhere, status: "unpaid" } }),
        prisma.job.count({ where: { ...scopeWhere, status: "scheduled" } }),
    ]);

    const recentCustomers = await prisma.customer.findMany({
        where: scopeWhere,
        orderBy: { createdAt: "desc" },
        take: 5,
    });

    return NextResponse.json({
        metrics: {
            customers,
            estimates,
            unpaidInvoices: invoices,
            scheduledJobs: jobs,
        },
        recentCustomers,
    });
}
