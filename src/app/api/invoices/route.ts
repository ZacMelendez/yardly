import { NextRequest, NextResponse } from "next/server";
import { getUserIdOrOrgId, buildScopeWhere } from "../utils";
import { prisma } from "@/lib/prisma";
import { validateInvoiceCreation } from "@/lib/subscription-validation";

export async function GET() {
    const scope = await getUserIdOrOrgId();
    const scopeWhere = buildScopeWhere(scope);

    const invoices = await prisma.invoice.findMany({
        where: scopeWhere,
        include: {
            customer: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                    address: true,
                },
            },
            items: true,
            job: {
                select: { id: true, title: true, date: true },
            },
        },
        orderBy: { createdAt: "desc" },
    });

    const serialized = JSON.parse(JSON.stringify(invoices));
    return NextResponse.json(serialized);
}

export async function POST(req: NextRequest) {
    const scope = await getUserIdOrOrgId();
    const scopeWhere = buildScopeWhere(scope);

    const validation = await validateInvoiceCreation(
        scope.userId,
        scope.organizationId!
    );
    if (!validation.success) {
        return validation.error!;
    }

    const body = await req.json();
    const { customerId, dueDate, items: itemsInput } = body;

    if (!customerId || typeof customerId !== "string") {
        return NextResponse.json(
            { error: "Customer ID is required and must be a string" },
            { status: 400 }
        );
    }

    const customer = await prisma.customer.findFirst({
        where: { id: customerId, ...scopeWhere },
    });
    if (!customer) {
        return NextResponse.json(
            { error: "Customer not found or access denied" },
            { status: 404 }
        );
    }

    const items = Array.isArray(itemsInput) ? itemsInput : [];
    if (items.length === 0) {
        return NextResponse.json(
            { error: "At least one item is required" },
            { status: 400 }
        );
    }

    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (
            typeof item.quantity !== "number" ||
            item.quantity <= 0 ||
            typeof item.unitPrice !== "number" ||
            item.unitPrice < 0
        ) {
            return NextResponse.json(
                {
                    error: `Item ${i + 1}: quantity must be positive and unitPrice non-negative`,
                },
                { status: 400 }
            );
        }
    }

    const due =
        dueDate != null
            ? new Date(dueDate)
            : (() => {
                  const d = new Date();
                  d.setDate(d.getDate() + 30);
                  return d;
              })();

    const invoice = await prisma.invoice.create({
        data: {
            customerId,
            userId: scope.userId,
            organizationId: scope.organizationId!,
            status: "draft",
            dueDate: due,
            items: {
                create: items.map((item: { description?: string; quantity: number; unitPrice: number; serviceId?: string }) => ({
                    description: item.description ?? "Item",
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                    serviceId: item.serviceId ?? null,
                })),
            },
        },
        include: {
            customer: true,
            items: true,
        },
    });

    return NextResponse.json(JSON.parse(JSON.stringify(invoice)));
}
