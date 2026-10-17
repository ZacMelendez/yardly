import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdOrOrgId, buildScopeWhere } from "../../utils";

export async function GET(
    req: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        const scope = await getUserIdOrOrgId();
        const scopeWhere = buildScopeWhere(scope);
        const serviceId = params.id;

        const service = await prisma.service.findFirst({
            where: {
                id: serviceId,
                ...scopeWhere,
            },
            include: {
                estimateItems: true,
                invoiceItems: true,
            },
        });

        if (!service) {
            return NextResponse.json(
                { error: "Service not found" },
                { status: 404 }
            );
        }

        // Serialize to ensure Decimal objects are converted to numbers
        const serializedService = JSON.parse(JSON.stringify(service));
        return NextResponse.json(serializedService);
    } catch (error) {
        console.error("Error fetching service:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

export async function PATCH(
    req: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        const scope = await getUserIdOrOrgId();
        const scopeWhere = buildScopeWhere(scope);
        const serviceId = params.id;
        const body = await req.json();

        // First verify the service belongs to the user/org
        const existingService = await prisma.service.findFirst({
            where: {
                id: serviceId,
                ...scopeWhere,
            },
        });

        if (!existingService) {
            return NextResponse.json(
                { error: "Service not found" },
                { status: 404 }
            );
        }

        const updatedService = await prisma.service.update({
            where: { id: serviceId },
            data: {
                ...(body.name && { name: body.name }),
                ...(body.defaultPrice && { defaultPrice: body.defaultPrice }),
                ...(body.unit && { unit: body.unit }),
                ...(body.isActive && { isActive: body.isActive }),
                ...(body.description && { description: body.description }),
                ...(body.category && { category: body.category }),
                ...(body.estimateItems && {
                    estimateItems: body.estimateItems,
                }),
                ...(body.invoiceItems && { invoiceItems: body.invoiceItems }),
            },
        });

        const result = {
            ...updatedService,
            createdAt: updatedService.createdAt.toISOString(),
        };

        // Serialize to ensure Decimal objects are converted to numbers
        const serializedResult = JSON.parse(JSON.stringify(result));
        return NextResponse.json(serializedResult);
    } catch (error) {
        console.error("Error updating service:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    req: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    const scope = await getUserIdOrOrgId();
    const scopeWhere = buildScopeWhere(scope);
    const serviceId = params.id;

    const service = await prisma.service.findFirst({
        where: {
            id: serviceId,
            ...scopeWhere,
        },
    });

    if (!service) {
        return NextResponse.json(
            { error: "Service not found" },
            { status: 404 }
        );
    }

    await prisma.service.delete({
        where: { id: serviceId },
    });

    return NextResponse.json({ message: "Service deleted" });
}
