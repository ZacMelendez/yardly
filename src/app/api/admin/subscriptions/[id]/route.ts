import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

// Admin access check
async function checkAdminAccess(userId: string): Promise<boolean> {
    const adminIds = process.env.ADMIN_USER_IDS?.split(",") || [];
    return adminIds.includes(userId);
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSession();

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const isAdmin = await checkAdminAccess(session.user.id);
        if (!isAdmin) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const resolvedParams = await params;
        const body = await request.json();
        const {
            planId,
            planName,
            status,
            billingCycle,
            amount,
            maxCustomers,
            maxJobs,
            maxInvoicesPerMonth,
            currentPeriodStart,
            currentPeriodEnd,
        } = body;

        // Check if subscription exists
        const existingSubscription = await prisma.subscription.findUnique({
            where: { id: resolvedParams.id },
        });

        if (!existingSubscription) {
            return NextResponse.json(
                { error: "Subscription not found" },
                { status: 404 }
            );
        }

        const subscription = await prisma.subscription.update({
            where: { id: resolvedParams.id },
            data: {
                planId,
                planName,
                status,
                billingCycle,
                amount,
                maxCustomers,
                maxJobs,
                maxInvoicesPerMonth,
                currentPeriodStart: new Date(currentPeriodStart),
                currentPeriodEnd: new Date(currentPeriodEnd),
                updatedAt: new Date(),
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true,
                    },
                },
            },
        });

        return NextResponse.json(subscription);
    } catch (error) {
        console.error("Error updating subscription:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSession();

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const isAdmin = await checkAdminAccess(session.user.id);
        if (!isAdmin) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const resolvedParams = await params;

        // Check if subscription exists
        const existingSubscription = await prisma.subscription.findUnique({
            where: { id: resolvedParams.id },
        });

        if (!existingSubscription) {
            return NextResponse.json(
                { error: "Subscription not found" },
                { status: 404 }
            );
        }

        await prisma.subscription.delete({
            where: { id: resolvedParams.id },
        });

        return NextResponse.json({
            message: "Subscription deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting subscription:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
