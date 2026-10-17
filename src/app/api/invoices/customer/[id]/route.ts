import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdOrOrgId, buildScopeWhere } from "../../../utils";

export async function GET(
    req: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const scope = await getUserIdOrOrgId();
    const scopeWhere = buildScopeWhere(scope);
    const params = await props.params;
    const customerId = params.id;

    try {
        const invoices = await prisma.invoice.findMany({
            where: {
                ...scopeWhere,
                customerId,
            },
            include: {
                customer: true,
                items: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        const serializedInvoices = JSON.parse(JSON.stringify(invoices));
        return NextResponse.json(serializedInvoices);
    } catch (error) {
        console.error("Error fetching invoices:", error);
        return new NextResponse(
            JSON.stringify({ error: "Internal Server Error" }),
            {
                status: 500,
            }
        );
    }
}
