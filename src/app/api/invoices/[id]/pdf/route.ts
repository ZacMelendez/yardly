import { NextRequest, NextResponse } from "next/server";
import { getUserIdOrOrgId, buildScopeWhere } from "../../../utils";
import { prisma } from "@/lib/prisma";
import { generateInvoicePdf } from "@/lib/pdf/invoice-pdf";

export const dynamic = "force-dynamic";

export async function GET(
    req: NextRequest,
    props: { params: Promise<{ id: string }> },
) {
    const params = await props.params;
    const invoiceId = params.id;

    let scope: Awaited<ReturnType<typeof getUserIdOrOrgId>>;
    try {
        scope = await getUserIdOrOrgId();
    } catch {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const scopeWhere = buildScopeWhere(scope);
    const invoice = await prisma.invoice.findFirst({
        where: {
            id: invoiceId,
            ...scopeWhere,
        },
        include: {
            customer: true,
            items: true,
            organization: true,
        },
    });

    if (!invoice) {
        return NextResponse.json(
            { error: "Invoice not found" },
            { status: 404 },
        );
    }

    const businessName = invoice.organization?.name ?? "Yardli";
    const pdfData = {
        id: invoice.id,
        status: invoice.status,
        dueDate: invoice.dueDate?.toISOString() ?? null,
        createdAt: invoice.createdAt.toISOString(),
        businessName,
        customer: {
            name: invoice.customer.name,
            email: invoice.customer.email,
            phone: invoice.customer.phone,
            address: invoice.customer.address,
        },
        items: invoice.items.map((item) => ({
            description: item.description || "Item",
            quantity: item.quantity,
            unitPrice: Number(item.unitPrice),
        })),
    };

    const pdfBytes = await generateInvoicePdf(pdfData);

    const invNum = `INV-${invoiceId.slice(-8).toUpperCase()}`;
    const filename = `invoice-${invNum}.pdf`;

    return new NextResponse(Buffer.from(pdfBytes), {
        status: 200,
        headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename="${filename}"`,
            "Content-Length": String(pdfBytes.length),
        },
    });
}
