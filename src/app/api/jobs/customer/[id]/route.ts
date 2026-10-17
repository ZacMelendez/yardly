import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdOrOrgId, buildScopeWhere } from "../../../utils";

export async function GET(
    req: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const scope = await getUserIdOrOrgId();
    const scopeWhere = buildScopeWhere(scope);
    const params = await props.params;
    const customerId = params.id;

    try {
        // Verify the customer belongs to the user/org
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

        const jobs = await prisma.job.findMany({
            where: {
                ...scopeWhere,
                customerId,
            },
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

        // Transform the data to match our expected types
        const transformedJobs = jobs.map((job) => ({
            ...job,
            createdAt: job.createdAt.toISOString(),
            date: job.date?.toISOString() || null,
        }));

        return NextResponse.json(transformedJobs);
    } catch (error) {
        console.error("Error fetching jobs:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
