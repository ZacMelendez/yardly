import { NextRequest, NextResponse } from "next/server";
import { getUserIdOrOrgId, buildScopeWhere } from "../../utils";
import { prisma } from "@/lib/prisma";

export async function GET(
    req: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    const scope = await getUserIdOrOrgId();
    const scopeWhere = buildScopeWhere(scope);
    const invoiceId = params.id;

    const invoice = await prisma.invoice.findFirst({
        where: { id: invoiceId, ...scopeWhere },
        include: {
            customer: true,
            items: { include: { service: true } },
            job: { select: { id: true, title: true, date: true } },
            organization: { select: { name: true } },
        },
    });

    if (!invoice) {
        return NextResponse.json(
            { error: "Invoice not found" },
            { status: 404 }
        );
    }

    return NextResponse.json(JSON.parse(JSON.stringify(invoice)));
}

export async function PATCH(
    req: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    const scope = await getUserIdOrOrgId();
    const scopeWhere = buildScopeWhere(scope);
    const invoiceId = params.id;

    const invoice = await prisma.invoice.findFirst({
        where: { id: invoiceId, ...scopeWhere },
        include: { items: true },
    });

    if (!invoice) {
        return NextResponse.json(
            { error: "Invoice not found" },
            { status: 404 }
        );
    }

    const data = await req.json();

    // Only allow editing draft invoices (or allow dueDate/status on any)
    const isDraft = invoice.status === "draft";
    const updates: Record<string, unknown> = {};
    if (data.dueDate !== undefined) {
        updates.dueDate = data.dueDate ? new Date(data.dueDate) : null;
    }
    if (data.status !== undefined && typeof data.status === "string") {
        const allowed = ["draft", "unpaid", "paid"];
        if (allowed.includes(data.status)) updates.status = data.status;
    }

    if (data.items !== undefined && Array.isArray(data.items) && isDraft) {
        await prisma.invoiceItem.deleteMany({ where: { invoiceId } });
        if (data.items.length > 0) {
            await prisma.invoiceItem.createMany({
                data: data.items.map(
                    (item: {
                        description?: string | null;
                        quantity: number;
                        unitPrice: number;
                        serviceId?: string | null;
                    }) => ({
                        invoiceId,
                        description: item.description ?? "Item",
                        quantity:
                            typeof item.quantity === "number"
                                ? item.quantity
                                : 1,
                        unitPrice:
                            typeof item.unitPrice === "number"
                                ? item.unitPrice
                                : 0,
                        serviceId: item.serviceId ?? null,
                    })
                ),
            });
        }
    }

    const updated = await prisma.invoice.update({
        where: { id: invoiceId },
        data: updates,
        include: {
            customer: true,
            items: true,
            job: { select: { id: true, title: true, date: true } },
        },
    });

    return NextResponse.json(JSON.parse(JSON.stringify(updated)));
}

export async function DELETE(
    req: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    const scope = await getUserIdOrOrgId();
    const scopeWhere = buildScopeWhere(scope);
    const invoiceId = params.id;

    const invoice = await prisma.invoice.findFirst({
        where: { id: invoiceId, ...scopeWhere },
    });

    if (!invoice) {
        return NextResponse.json(
            { error: "Invoice not found" },
            { status: 404 }
        );
    }

    if (invoice.status !== "draft") {
        return NextResponse.json(
            { error: "Only draft invoices can be deleted" },
            { status: 400 }
        );
    }

    await prisma.invoice.delete({ where: { id: invoiceId } });
    return NextResponse.json({ message: "Invoice deleted" });
}
