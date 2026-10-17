import React from "react";
import { NextRequest, NextResponse } from "next/server";
import { getUserIdOrOrgId, buildScopeWhere } from "../../../utils";
import { prisma } from "@/lib/prisma";
import { generateEstimatePdf } from "@/lib/pdf/estimate-pdf";
import { sendEmail } from "@/lib/email/resend";
import EstimateEmail from "@/emails/EstimateEmail";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

function getAppBaseUrl() {
    const envUrl =
        process.env.BETTER_AUTH_URL ||
        process.env.NEXT_PUBLIC_APP_URL ||
        process.env.VERCEL_URL;

    if (!envUrl) {
        return "http://localhost:3000";
    }

    const url = envUrl.startsWith("http") ? envUrl : `https://${envUrl}`;
    return url.replace(/\/$/, "");
}

export async function POST(
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

    const customerEmail = estimate.customer.email?.trim();
    if (!customerEmail) {
        return NextResponse.json(
            {
                error: "Add an email to this customer to send the estimate",
            },
            { status: 400 },
        );
    }

    const businessName = estimate.organization?.name ?? "Yardli";

    const pdfData = {
        title: estimate.title,
        status: estimate.status,
        createdAt: estimate.createdAt.toISOString(),
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
        businessName,
    };

    const pdfBytes = await generateEstimatePdf(pdfData);
    const pdfBase64 = Buffer.from(pdfBytes).toString("base64");
    const filename = `estimate-${estimate.title.replace(/[^a-z0-9]/gi, "-").toLowerCase()}-${estimateId.slice(-6)}.pdf`;

    const session = await getSession();
    const senderName = session?.user?.name ?? undefined;
    const baseUrl = getAppBaseUrl();
    const acceptUrl = `${baseUrl}/estimates/accept/${estimateId}`;

    try {
        await sendEmail({
            to: customerEmail,
            subject: `Your estimate: ${estimate.title}`,
            organizationId: estimate.organizationId,
            react: React.createElement(EstimateEmail, {
                customerName: estimate.customer.name,
                estimateTitle: estimate.title,
                businessName,
                senderName,
                acceptUrl,
            }),
            attachments: [
                {
                    content: pdfBase64,
                    filename,
                },
            ],
        });
    } catch (err) {
        console.error("Error sending estimate email:", err);
        return NextResponse.json(
            {
                error:
                    err instanceof Error ? err.message : "Failed to send email",
            },
            { status: 500 },
        );
    }

    await prisma.estimate.update({
        where: { id: estimateId },
        data: { status: "sent" },
    });

    return NextResponse.json({ success: true });
}
