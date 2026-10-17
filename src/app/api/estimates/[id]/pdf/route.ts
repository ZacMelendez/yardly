import { NextRequest, NextResponse } from "next/server";
import { getUserIdOrOrgId, buildScopeWhere } from "../../../utils";
import { prisma } from "@/lib/prisma";
import { generateEstimatePdf } from "@/lib/pdf/estimate-pdf";

export const dynamic = "force-dynamic";

export async function GET(
    req: NextRequest,
    props: { params: Promise<{ id: string }> },
) {
    const params = await props.params;
    const estimateId = params.id;

    let scope: Awaited<ReturnType<typeof getUserIdOrOrgId>>;
    try {
        scope = await getUserIdOrOrgId();
    } catch {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const scopeWhere = buildScopeWhere(scope);
    const estimate = await prisma.estimate.findFirst({
        where: {
            id: estimateId,
            ...scopeWhere,
        },
        include: {
            customer: true,
            items: true,
            organization: true,
        },
    });

    if (!estimate) {
        return NextResponse.json(
            { error: "Estimate not found" },
            { status: 404 },
        );
    }

    const businessName = estimate.organization?.name ?? "Yardli";
    const pdfData = {
        title: estimate.title,
        status: estimate.status,
        createdAt: estimate.createdAt.toISOString(),
        businessName,
        customer: {
            name: estimate.customer.name,
            email: estimate.customer.email,
            phone: estimate.customer.phone,
            address: estimate.customer.address,
        },
        items: estimate.items.map((item) => ({
            description: item.description || "Item",
            quantity: item.quantity,
            unitPrice: Number(item.unitPrice),
        })),
    };

    const pdfBytes = await generateEstimatePdf(pdfData);

    const filename = `estimate-${estimate.title.replace(/[^a-z0-9]/gi, "-").toLowerCase()}-${estimateId.slice(-6)}.pdf`;

    return new NextResponse(Buffer.from(pdfBytes), {
        status: 200,
        headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename="${filename}"`,
            "Content-Length": String(pdfBytes.length),
        },
    });
}
