import { NextResponse } from "next/server";
import { getUserIdOrOrgId } from "../../utils";
import { checkUsageLimits } from "@/lib/subscription";

export async function GET() {
    try {
        const scope = await getUserIdOrOrgId();
        const limits = await checkUsageLimits(
            scope.userId,
            scope.organizationId!
        );

        return NextResponse.json(limits);
    } catch (error) {
        console.error("Error fetching subscription limits:", error);
        return NextResponse.json(
            { error: "Failed to fetch subscription limits" },
            { status: 500 }
        );
    }
}
