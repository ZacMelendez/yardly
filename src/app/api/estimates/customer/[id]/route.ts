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
        const estimates = await prisma.estimate.findMany({
            where: {
                ...scopeWhere,
                customerId,
            },
            include: {
                customer: true,
                items: {
                    include: {
                        service: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        // Serialize to ensure Decimal objects are converted to numbers
        const serializedEstimates = JSON.parse(JSON.stringify(estimates));
        return NextResponse.json(serializedEstimates);
    } catch (error) {
        console.error("Error fetching estimates:", error);
        return new NextResponse(
            JSON.stringify({ error: "Internal Server Error" }),
            {
                status: 500,
            }
        );
    }
}
