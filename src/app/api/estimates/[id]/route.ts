import { NextRequest, NextResponse } from "next/server";
import { getUserIdOrOrgId, buildScopeWhere } from "../../utils";
import { prisma } from "@/lib/prisma";
import { EstimateItem, Prisma } from "@prisma/client";

export async function DELETE(
    req: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    const scope = await getUserIdOrOrgId();
    const scopeWhere = buildScopeWhere(scope);
    const estimateId = params.id;

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

    await prisma.estimate.delete({
        where: { id: estimateId },
    });

    return NextResponse.json({ message: "Estimate deleted" });
}

export async function PATCH(
    req: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    const scope = await getUserIdOrOrgId();
    const scopeWhere = buildScopeWhere(scope);
    const estimateId = params.id;

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

    const data = (await req.json()) as Prisma.EstimateUpdateArgs["data"];

    const updatedEstimate = await prisma.estimate.update({
        where: { id: estimateId },
        data: {
            ...(data.status && { status: data.status }),
            ...(data.title && { title: data.title }),
            ...(data.customerId && { customerId: data.customerId }),
            ...(data.items && {
                items: {
                    upsert: (data.items as EstimateItem[]).map((i) => {
                        const { id, estimateId, ...item } = i;
                        return {
                            where: { id },
                            update: item,
                            create: { ...item, estimateId },
                        };
                    }),
                },
            }),
            ...(data.createdAt && { createdAt: data.createdAt }),
            ...(data.updatedAt && { updatedAt: data.updatedAt }),
        },
    });

    return NextResponse.json(updatedEstimate);
}
