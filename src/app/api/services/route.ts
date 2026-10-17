import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdOrOrgId, buildScopeWhere } from "../utils";

export async function GET() {
    const scope = await getUserIdOrOrgId();
    const scopeWhere = buildScopeWhere(scope);
    const services = await prisma.service.findMany({
        where: scopeWhere,
        orderBy: { createdAt: "desc" },
    });
    // Serialize to ensure Decimal objects are converted to numbers
    const serializedServices = JSON.parse(JSON.stringify(services));
    return NextResponse.json(serializedServices);
}

export async function POST(req: NextRequest) {
    const scope = await getUserIdOrOrgId();
    const body = await req.json();

    const service = await prisma.service.create({
        data: {
            userId: scope.userId,
            organizationId: scope.organizationId,
            name: body.name,
            defaultPrice: body.defaultPrice ?? 0,
            unit: body.unit ?? "each",
            isActive: body.isActive ?? true,
            description: body.description ?? null,
            category: body.category ?? null,
        },
    });
    // Serialize to ensure Decimal objects are converted to numbers
    const serializedService = JSON.parse(JSON.stringify(service));
    return NextResponse.json(serializedService, { status: 201 });
}
