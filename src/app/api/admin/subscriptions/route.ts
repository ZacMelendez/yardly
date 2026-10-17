import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

// Admin access check
async function checkAdminAccess(userId: string): Promise<boolean> {
    const adminIds = process.env.ADMIN_USER_IDS?.split(",") || [];
    return adminIds.includes(userId);
}

export async function GET() {
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

        const subscriptions = await prisma.subscription.findMany({
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
            orderBy: {
                createdAt: "desc",
            },
        });

        return NextResponse.json(subscriptions);
    } catch (error) {
        console.error("Error fetching subscriptions:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
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

        const body = await request.json();
        const {
            userId,
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

        // Validate required fields
        if (
            !userId ||
            !planId ||
            !planName ||
            !status ||
            !billingCycle ||
            amount === undefined
        ) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Check if user exists
        const userExists = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!userExists) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        // Cancel any existing active subscriptions for this user
        await prisma.subscription.updateMany({
            where: {
                userId,
                status: { in: ["active", "trialing"] },
            },
            data: {
                status: "cancelled",
                canceledAt: new Date(),
            },
        });

        const subscription = await prisma.subscription.create({
            data: {
                userId,
                planId,
                planName,
                status,
                billingCycle,
                amount,
                currency: "usd",
                maxCustomers,
                maxJobs,
                maxInvoicesPerMonth,
                currentPeriodStart: new Date(currentPeriodStart),
                currentPeriodEnd: new Date(currentPeriodEnd),
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
        console.error("Error creating subscription:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
