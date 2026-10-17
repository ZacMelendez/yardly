import { NextRequest, NextResponse } from "next/server";
import { getUserIdOrOrgId, buildScopeWhere } from "../../utils";
import { prisma } from "@/lib/prisma";
import { validateInvoiceCreation } from "@/lib/subscription-validation";

export async function GET(
    req: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    const scope = await getUserIdOrOrgId();
    const scopeWhere = buildScopeWhere(scope);
    const jobId = params.id;

    const job = await prisma.job.findFirst({
        where: {
            id: jobId,
            ...scopeWhere,
        },
        include: {
            customer: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                    address: true,
                    notes: true,
                    createdAt: true,
                },
            },
            estimate: {
                select: {
                    id: true,
                    title: true,
                    status: true,
                    createdAt: true,
                    updatedAt: true,
                    items: {
                        select: {
                            id: true,
                            description: true,
                            quantity: true,
                            unitPrice: true,
                            service: {
                                select: {
                                    id: true,
                                    name: true,
                                    category: true,
                                },
                            },
                        },
                    },
                },
            },
        },
    });

    if (!job) {
        return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    return NextResponse.json(job);
}

export async function DELETE(
    req: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    const scope = await getUserIdOrOrgId();
    const scopeWhere = buildScopeWhere(scope);
    const jobId = params.id;

    const job = await prisma.job.findFirst({
        where: {
            id: jobId,
            ...scopeWhere,
        },
    });

    if (!job) {
        return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    await prisma.job.delete({
        where: { id: jobId },
    });

    return NextResponse.json({ message: "Job deleted" });
}

export async function PATCH(
    req: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    const scope = await getUserIdOrOrgId();
    const scopeWhere = buildScopeWhere(scope);
    const jobId = params.id;

    const job = await prisma.job.findFirst({
        where: {
            id: jobId,
            ...scopeWhere,
        },
    });

    if (!job) {
        return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    const data = await req.json();
    const newStatus = data.status as string | undefined;

    await prisma.job.update({
        where: { id: jobId },
        data: {
            ...(data.id && { id: data.id }),
            ...(data.title && { title: data.title }),
            ...(data.date && { date: data.date }),
            ...(data.status && { status: data.status }),
            ...(data.createdAt && { createdAt: data.createdAt }),
            ...(data.updatedAt && { updatedAt: data.updatedAt }),
            ...(data.isRecurring && { isRecurring: data.isRecurring }),
            ...(data.recurrenceRule && { recurrenceRule: data.recurrenceRule }),
            ...(data.recurrenceEnd && { recurrenceEnd: data.recurrenceEnd }),
            ...(data.customerId && { customerId: data.customerId }),
            ...(data.estimateId && { estimateId: data.estimateId }),
        },
    });

    // When job is marked completed, create a draft invoice from the job (if none exists)
    if (newStatus === "completed" && scope.userId && scope.organizationId) {
        const existing = await prisma.invoice.findFirst({
            where: { jobId, ...scopeWhere },
        });
        if (!existing) {
            const validation = await validateInvoiceCreation(
                scope.userId,
                scope.organizationId
            );
            if (validation.success) {
                const jobWithEstimate = await prisma.job.findFirst({
                    where: { id: jobId, ...scopeWhere },
                    include: {
                        estimate: {
                            include: {
                                items: { include: { service: true } },
                            },
                        },
                    },
                });
                if (jobWithEstimate?.customerId) {
                    const dueDate = new Date();
                    dueDate.setDate(dueDate.getDate() + 30);

                    if (
                        jobWithEstimate.estimate?.items &&
                        jobWithEstimate.estimate.items.length > 0
                    ) {
                        await prisma.invoice.create({
                            data: {
                                customerId: jobWithEstimate.customerId,
                                userId: scope.userId,
                                organizationId: scope.organizationId!,
                                jobId,
                                status: "draft",
                                dueDate,
                                items: {
                                    create: jobWithEstimate.estimate.items.map(
                                        (item) => ({
                                            serviceId: item.serviceId,
                                            description:
                                                item.description ??
                                                item.service?.name ??
                                                "Service",
                                            quantity: item.quantity,
                                            unitPrice: item.unitPrice,
                                        })
                                    ),
                                },
                            },
                        });
                    } else {
                        await prisma.invoice.create({
                            data: {
                                customerId: jobWithEstimate.customerId,
                                userId: scope.userId,
                                organizationId: scope.organizationId!,
                                jobId,
                                status: "draft",
                                dueDate,
                                items: {
                                    create: [
                                        {
                                            description: jobWithEstimate.title,
                                            quantity: 1,
                                            unitPrice: 0,
                                        },
                                    ],
                                },
                            },
                        });
                    }
                }
            }
        }
    }

    return NextResponse.json({ message: "Job updated" });
}
