import { NextRequest, NextResponse } from "next/server";
import { searchPlaces } from "@/lib/places-api";
import { getUserIdOrOrgId } from "../../utils";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
    try {
        const scope = await getUserIdOrOrgId();
        const { searchParams } = new URL(request.url);
        const query = searchParams.get("q");
        const types = searchParams.get("types");
        const country = searchParams.get("country");

        if (!query || query.trim().length === 0) {
            return NextResponse.json(
                { error: "Query parameter is required" },
                { status: 400 }
            );
        }

        const { places, fromCache } = await searchPlaces(
            { query, types: types || undefined, country: country || undefined },
            scope.userId
        );

        return NextResponse.json({
            places,
            fromCache,
            rateLimitInfo: {
                message: fromCache
                    ? "Results served from cache"
                    : "Live API call made",
            },
        });
    } catch (error) {
        console.error("Places API route error:", error);

        // Handle rate limit errors specifically
        if (
            error instanceof Error &&
            error.message.includes("Rate limit exceeded")
        ) {
            return NextResponse.json(
                {
                    error: "Rate limit exceeded",
                    message: error.message,
                    retryAfter: 60,
                },
                { status: 429 }
            );
        }

        return NextResponse.json(
            {
                error: "Internal server error",
                message:
                    error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}
