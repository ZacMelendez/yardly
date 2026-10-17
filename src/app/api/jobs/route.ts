import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdOrOrgId, buildScopeWhere } from "../utils";
import {
    validateJobCreation,
    validateFeatureAccess,
} from "@/lib/subscription-validation";

export async function GET() {
    const scope = await getUserIdOrOrgId();
    const scopeWhere = buildScopeWhere(scope);
    const jobs = await prisma.job.findMany({
        where: scopeWhere,
        include: {
            customer: {
                select: {
                    id: true,
                    name: true,
                },
            },
        },
        orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(jobs);
}

export async function POST(req: NextRequest) {
    try {
        const scope = await getUserIdOrOrgId();
        const scopeWhere = buildScopeWhere(scope);

        // Validate subscription limits before creating job
        const validation = await validateJobCreation(
            scope.userId,
            scope.organizationId!
        );
        if (!validation.success) {
            return validation.error!;
        }

        const body = await req.json();

        // Validate required fields
        if (!body.customerId || typeof body.customerId !== "string") {
            return NextResponse.json(
                { error: "Customer ID is required and must be a string" },
                { status: 400 }
            );
        }

        if (
            !body.title ||
            typeof body.title !== "string" ||
            body.title.trim().length === 0
        ) {
            return NextResponse.json(
                {
                    error: "Job title is required and must be a non-empty string",
                },
                { status: 400 }
            );
        }

        // Check if recurring jobs feature is available
        if (body.isRecurring) {
            const featureValidation = await validateFeatureAccess(
                scope.userId,
                "recurring_jobs"
            );
            if (!featureValidation.success) {
                return featureValidation.error!;
            }
        }

        // Verify the customer belongs to the user/org
        const customer = await prisma.customer.findFirst({
            where: {
                id: body.customerId,
                ...scopeWhere,
            },
        });

        if (!customer) {
            return NextResponse.json(
                { error: "Customer not found or access denied" },
                { status: 404 }
            );
        }

        // Validate date if provided
        let jobDate = null;
        if (body.date) {
            jobDate = new Date(body.date);
            if (isNaN(jobDate.getTime())) {
                return NextResponse.json(
                    { error: "Invalid date format" },
                    { status: 400 }
                );
            }
        }

        const job = await prisma.job.create({
            data: {
                userId: scope.userId,
                organizationId: scope.organizationId,
                customerId: body.customerId,
                title: body.title.trim(),
                date: jobDate,
                status: body.status ?? "scheduled",
                isRecurring: body.isRecurring ?? false,
                recurrenceRule: body.recurrenceRule
                    ? body.recurrenceRule
                    : null,
                parentJobId: body.parentJobId || null,
                estimateId: body.estimateId || null,
            },
            include: {
                customer: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });

        return NextResponse.json(job, { status: 201 });
    } catch (error) {
        console.error("Error creating job:", error);
        return NextResponse.json(
            { error: "Failed to create job" },
            { status: 500 }
        );
    }
}
