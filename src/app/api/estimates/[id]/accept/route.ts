import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(
    req: NextRequest,
    props: { params: Promise<{ id: string }> },
) {
    const params = await props.params;
    const estimateId = params.id;

    if (!estimateId) {
        return NextResponse.json(
            { error: "Missing estimate id" },
            { status: 400 },
        );
    }

    const estimate = await prisma.estimate.findUnique({
        where: { id: estimateId },
        select: {
            id: true,
            status: true,
        },
    });

    if (!estimate) {
        return NextResponse.json(
            { error: "Estimate not found" },
            { status: 404 },
        );
    }

    if (estimate.status === "accepted") {
        return NextResponse.json({ success: true, status: "accepted" });
    }

    if (estimate.status !== "sent" && estimate.status !== "draft") {
        return NextResponse.json(
            { error: "Estimate cannot be accepted in its current status" },
            { status: 400 },
        );
    }

    await prisma.estimate.update({
        where: { id: estimateId },
        data: { status: "accepted" },
    });

    return NextResponse.json({ success: true, status: "accepted" });
}

