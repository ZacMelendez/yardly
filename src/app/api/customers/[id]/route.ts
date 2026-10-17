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
        const customerId = params.id;
        const scopeWhere = buildScopeWhere(scope);

        const customer = await prisma.customer.findFirst({
            where: {
                id: customerId,
                ...scopeWhere,
            },
            include: {
                jobs: {
                    orderBy: { createdAt: "desc" },
                },
                estimates: {
                    include: {
                        items: true,
                    },
                    orderBy: { createdAt: "desc" },
                },
            },
        });

        if (!customer) {
            return NextResponse.json(
                { error: "Customer not found" },
                { status: 404 }
            );
        }

        // Transform the data to match our expected types
        const transformedCustomer = {
            ...customer,
            createdAt: customer.createdAt.toISOString(),
            jobs: customer.jobs.map((job) => ({
                ...job,
                createdAt: job.createdAt.toISOString(),
                date: job.date?.toISOString() || null,
                customer: {
                    id: customer.id,
                    name: customer.name,
                },
            })),
            estimates: customer.estimates.map((estimate) => ({
                ...estimate,
                createdAt: estimate.createdAt.toISOString(),
                customer: {
                    id: customer.id,
                    name: customer.name,
                    email: customer.email,
                },
            })),
        };

        // Serialize to ensure Decimal objects are converted to numbers
        const serializedCustomer = JSON.parse(
            JSON.stringify(transformedCustomer)
        );
        return NextResponse.json(serializedCustomer);
    } catch (error) {
        console.error("Error fetching customer:", error);
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
        const customerId = params.id;
        const body = await req.json();
        const scopeWhere = buildScopeWhere(scope);

        // First verify the customer belongs to the user/org
        const existingCustomer = await prisma.customer.findFirst({
            where: {
                id: customerId,
                ...scopeWhere,
            },
        });

        if (!existingCustomer) {
            return NextResponse.json(
                { error: "Customer not found" },
                { status: 404 }
            );
        }

        const updatedCustomer = await prisma.customer.update({
            where: { id: customerId },
            data: {
                name: body.name,
                email: body.email ?? null,
                phone: body.phone ?? null,
                address: body.address ?? null,
                notes: body.notes ?? null,
            },
        });

        return NextResponse.json({
            ...updatedCustomer,
            createdAt: updatedCustomer.createdAt.toISOString(),
        });
    } catch (error) {
        console.error("Error updating customer:", error);
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
    const customerId = params.id;
    const scopeWhere = buildScopeWhere(scope);

    const customer = await prisma.customer.findFirst({
        where: {
            id: customerId,
            ...scopeWhere,
        },
    });

    if (!customer) {
        return NextResponse.json(
            { error: "Customer not found" },
            { status: 404 }
        );
    }

    await prisma.customer.delete({
        where: { id: customerId },
    });

    return NextResponse.json({ message: "Customer deleted" });
}
