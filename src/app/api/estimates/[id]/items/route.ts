import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdOrOrgId, buildScopeWhere } from "../../../utils";

export async function GET(
    req: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
        const scope = await getUserIdOrOrgId();
        const scopeWhere = buildScopeWhere(scope);
    const estimateId = params.id;

    try {
        // First verify the estimate belongs to the user
        const estimate = await prisma.estimate.findFirst({
            where: {
                id: estimateId,
                ...scopeWhere,
            },
        });

        if (!estimate) {
            return NextResponse.json(
                { error: "Estimate not found" },
                { status: 404 }
            );
        }

        const items = await prisma.estimateItem.findMany({
            where: { estimateId },
            include: {
                service: true,
            },
        });

        // Serialize to ensure Decimal objects are converted to numbers
        const serializedItems = JSON.parse(JSON.stringify(items));
        return NextResponse.json(serializedItems);
    } catch (error) {
        console.error("Error fetching estimate items:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
