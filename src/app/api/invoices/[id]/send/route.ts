import React from "react";
import { NextRequest, NextResponse } from "next/server";
import { getUserIdOrOrgId, buildScopeWhere } from "../../../utils";
import { prisma } from "@/lib/prisma";
import { generateInvoicePdf } from "@/lib/pdf/invoice-pdf";
import { sendEmail } from "@/lib/email/resend";
import InvoiceEmail from "@/emails/InvoiceEmail";
import { getSession } from "@/lib/session";
import {
    createAndFinalizeStripeInvoice,
    getStripeInvoiceHostedUrl,
} from "@/lib/stripe-invoice";

export const dynamic = "force-dynamic";

function formatInvoiceNumber(id: string): string {
    return `INV-${id.slice(-8).toUpperCase()}`;
}

export async function POST(
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

    const session = await getSession();
    const senderName = session?.user?.name ?? undefined;

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

    const customerEmail = invoice.customer.email?.trim();
    if (!customerEmail) {
        return NextResponse.json(
            {
                error: "Add an email to this customer to send the invoice",
            },
            { status: 400 },
        );
    }

    // When sending, move draft → unpaid (so it appears in "unpaid" list)
    if (invoice.status === "draft") {
        await prisma.invoice.update({
            where: { id: invoiceId },
            data: { status: "unpaid" },
        });
    }

    let payLink: string | null = null;
    if (invoice.stripeInvoiceId) {
        payLink = await getStripeInvoiceHostedUrl(invoice.stripeInvoiceId);
    } else {
        const stripeResult = await createAndFinalizeStripeInvoice({
            yardlyInvoiceId: invoice.id,
            customerId: invoice.customerId,
            customerEmail: invoice.customer.email,
            customerName: invoice.customer.name,
            items: invoice.items.map((item) => ({
                description: item.description || "Item",
                quantity: item.quantity,
                unitPrice: Number(item.unitPrice),
            })),
            dueDate: invoice.dueDate,
        });
        payLink = stripeResult?.hostedInvoiceUrl ?? null;
    }

    const businessName = invoice.organization?.name ?? "Yardli";

    const pdfData = {
        id: invoice.id,
        status: invoice.status === "draft" ? "unpaid" : invoice.status,
        dueDate: invoice.dueDate?.toISOString() ?? null,
        createdAt: invoice.createdAt.toISOString(),
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
        businessName,
    };

    const pdfBytes = await generateInvoicePdf(pdfData);
    const invNum = formatInvoiceNumber(invoiceId);
    const filename = `invoice-${invNum}.pdf`;
    const base64Pdf = Buffer.from(pdfBytes).toString("base64");

    try {
        await sendEmail({
            to: customerEmail,
            subject: `Invoice ${invNum} from ${businessName}`,
            organizationId: invoice.organizationId,
            react: React.createElement(InvoiceEmail, {
                customerName: invoice.customer.name,
                invoiceNumber: invNum,
                dueDate: invoice.dueDate
                    ? invoice.dueDate.toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                      })
                    : null,
                businessName,
                senderName,
                payLink: payLink ?? undefined,
            }),
            attachments: [
                {
                    content: base64Pdf,
                    filename,
                },
            ],
        });
    } catch (err) {
        console.error("Error sending invoice email:", err);
        return NextResponse.json(
            {
                error:
                    err instanceof Error
                        ? err.message
                        : "Failed to send invoice",
            },
            { status: 500 },
        );
    }

    return NextResponse.json({
        success: true,
        payLink: payLink ?? undefined,
    });
}
