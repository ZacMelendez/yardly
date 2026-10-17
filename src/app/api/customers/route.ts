import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdOrOrgId } from "../utils";
import { getCustomers } from "@/lib/actions/customers";
import { validateCustomerCreation } from "@/lib/subscription-validation";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);

    // Extract parameters
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || undefined;
    const createdAfter = searchParams.get("createdAfter") || undefined;
    const createdBefore = searchParams.get("createdBefore") || undefined;
    const sortBy = (searchParams.get("sortBy") as any) || "createdAt";
    const sortOrder = (searchParams.get("sortOrder") as any) || "desc";

    try {
        const result = await getCustomers({
            page,
            limit,
            search,
            createdAfter,
            createdBefore,
            sortBy,
            sortOrder,
        });

        return NextResponse.json(result);
    } catch (error) {
        console.error("Error fetching customers:", error);
        return NextResponse.json(
            { error: "Failed to fetch customers" },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        const scope = await getUserIdOrOrgId();

        // Validate subscription limits before creating customer
        const validation = await validateCustomerCreation(
            scope.userId,
            scope.organizationId!
        );
        if (!validation.success) {
            return validation.error!;
        }

        const body = await req.json();

        // Basic input validation
        if (
            !body.name ||
            typeof body.name !== "string" ||
            body.name.trim().length === 0
        ) {
            return NextResponse.json(
                { error: "Name is required and must be a non-empty string" },
                { status: 400 }
            );
        }

        // Validate email format if provided
        if (body.email && typeof body.email === "string") {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(body.email)) {
                return NextResponse.json(
                    { error: "Invalid email format" },
                    { status: 400 }
                );
            }
        }

        const customer = await prisma.customer.create({
            data: {
                userId: scope.userId,
                organizationId: scope.organizationId,
                name: body.name.trim(),
                email: body.email?.trim() || null,
                phone: body.phone?.trim() || null,
                address: body.address?.trim() || null,
                notes: body.notes?.trim() || null,
            },
        });

        return NextResponse.json(customer, { status: 201 });
    } catch (error) {
        console.error("Error creating customer:", error);
        return NextResponse.json(
            { error: "Failed to create customer" },
            { status: 500 }
        );
    }
}
