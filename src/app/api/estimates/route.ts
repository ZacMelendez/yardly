import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { getUserIdOrOrgId, buildScopeWhere } from "../utils";
import { validateFeatureAccess } from "@/lib/subscription-validation";

export async function GET() {
    const scope = await getUserIdOrOrgId();
    const scopeWhere = buildScopeWhere(scope);

    try {
        const estimates = await prisma.estimate.findMany({
            where: scopeWhere,
            include: {
                customer: true,
                items: {
                    include: {
                        service: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        // Serialize to ensure Decimal objects are converted to numbers
        const serializedEstimates = JSON.parse(JSON.stringify(estimates));
        return NextResponse.json(serializedEstimates);
    } catch (error) {
        console.error("Error fetching estimates:", error);
        return new NextResponse(
            JSON.stringify({ error: "Internal Server Error" }),
            {
                status: 500,
            }
        );
    }
}

export async function POST(request: Request) {
    try {
        const session = await getSession();

        if (!session?.user?.email) {
            return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
                status: 401,
            });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            return new NextResponse(
                JSON.stringify({ error: "User not found" }),
                {
                    status: 404,
                }
            );
        }

        // Check if user has access to estimates feature
        const featureValidation = await validateFeatureAccess(
            user.id,
            "estimates"
        );
        if (!featureValidation.success) {
            return featureValidation.error!;
        }

        const body = await request.json();
        const { customerId, title, items } = body;

        // Validate required fields
        if (!customerId || typeof customerId !== "string") {
            return new NextResponse(
                JSON.stringify({
                    error: "Customer ID is required and must be a string",
                }),
                { status: 400 }
            );
        }

        if (!title || typeof title !== "string" || title.trim().length === 0) {
            return new NextResponse(
                JSON.stringify({
                    error: "Title is required and must be a non-empty string",
                }),
                { status: 400 }
            );
        }

        if (!Array.isArray(items) || items.length === 0) {
            return new NextResponse(
                JSON.stringify({ error: "At least one item is required" }),
                { status: 400 }
            );
        }

        const scope = await getUserIdOrOrgId();
        const scopeWhere = buildScopeWhere(scope);

        // Validate customer belongs to user/org
        const customer = await prisma.customer.findFirst({
            where: {
                id: customerId,
                ...scopeWhere,
            },
        });

        if (!customer) {
            return new NextResponse(
                JSON.stringify({
                    error: "Customer not found or access denied",
                }),
                { status: 404 }
            );
        }

        // Validate items
        for (let i = 0; i < items.length; i++) {
            const item = items[i];

            if (
                !item.description ||
                typeof item.description !== "string" ||
                item.description.trim().length === 0
            ) {
                return new NextResponse(
                    JSON.stringify({
                        error: `Item ${i + 1}: Description is required`,
                    }),
                    { status: 400 }
                );
            }

            if (typeof item.quantity !== "number" || item.quantity <= 0) {
                return new NextResponse(
                    JSON.stringify({
                        error: `Item ${
                            i + 1
                        }: Quantity must be a positive number`,
                    }),
                    { status: 400 }
                );
            }

            if (typeof item.unitPrice !== "number" || item.unitPrice < 0) {
                return new NextResponse(
                    JSON.stringify({
                        error: `Item ${
                            i + 1
                        }: Unit price must be a non-negative number`,
                    }),
                    { status: 400 }
                );
            }

            // Validate serviceId if provided
            if (item.serviceId && typeof item.serviceId === "string") {
                const service = await prisma.service.findFirst({
                    where: {
                        id: item.serviceId,
                        ...scopeWhere,
                    },
                });

                if (!service) {
                    return new NextResponse(
                        JSON.stringify({
                            error: `Item ${
                                i + 1
                            }: Service not found or access denied`,
                        }),
                        { status: 404 }
                    );
                }
            }
        }

        const estimate = await prisma.estimate.create({
            data: {
                title: title.trim(),
                customerId,
                userId: user.id,
                organizationId: scope.organizationId,
                items: {
                    create: items.map((item: any) => ({
                        serviceId: item.serviceId || null,
                        description: item.description.trim(),
                        quantity: Math.floor(item.quantity),
                        unitPrice: Math.round(item.unitPrice * 100) / 100, // Round to 2 decimal places
                    })),
                },
            },
            include: {
                customer: true,
                items: {
                    include: {
                        service: true,
                    },
                },
            },
        });

        // Serialize to ensure Decimal objects are converted to numbers
        const serializedEstimate = JSON.parse(JSON.stringify(estimate));
        return NextResponse.json(serializedEstimate);
    } catch (error) {
        console.error("Error creating estimate:", error);
        return new NextResponse(
            JSON.stringify({ error: "Internal Server Error" }),
            {
                status: 500,
            }
        );
    }
}
