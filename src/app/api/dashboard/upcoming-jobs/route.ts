import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdOrOrgId, buildScopeWhere } from "../../utils";

export interface UpcomingJob {
    id: string;
    title: string;
    date: string | null;
    status: string;
    customer: {
        id: string;
        name: string;
        address: string | null;
        phone: string | null;
    };
    coordinates?: {
        lat: number;
        lng: number;
    } | null;
}

export async function GET() {
    try {
        const scope = await getUserIdOrOrgId();
        const scopeWhere = buildScopeWhere(scope);

        // Get upcoming jobs (scheduled status and future dates)
        const upcomingJobs = await prisma.job.findMany({
            where: {
                ...scopeWhere,
                status: "scheduled",
                date: {
                    gte: new Date(), // Future dates only
                },
            },
            include: {
                customer: {
                    select: {
                        id: true,
                        name: true,
                        address: true,
                        phone: true,
                    },
                },
            },
            orderBy: {
                date: "asc",
            },
            take: 50, // Limit to avoid too many map markers
        });

        // Transform jobs to include geocoding data
        const jobsWithCoordinates: UpcomingJob[] = await Promise.all(
            upcomingJobs.map(async (job) => {
                let coordinates = null;

                // If customer has an address, try to geocode it
                if (job.customer.address) {
                    try {
                        const apiKey = process.env.GOOGLE_MAPS_API_KEY;
                        if (apiKey) {
                            const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
                                job.customer.address
                            )}&key=${apiKey}`;

                            const response = await fetch(geocodeUrl);
                            const data = await response.json();

                            if (
                                data.status === "OK" &&
                                data.results.length > 0
                            ) {
                                const location =
                                    data.results[0].geometry.location;
                                coordinates = {
                                    lat: location.lat,
                                    lng: location.lng,
                                };
                            }
                        }
                    } catch (error) {
                        console.error(
                            `Failed to geocode address for job ${job.id}:`,
                            error
                        );
                    }
                }

                return {
                    id: job.id,
                    title: job.title,
                    date: job.date?.toISOString() || null,
                    status: job.status,
                    customer: {
                        id: job.customer.id,
                        name: job.customer.name,
                        address: job.customer.address,
                        phone: job.customer.phone,
                    },
                    coordinates,
                };
            })
        );

        return NextResponse.json({ jobs: jobsWithCoordinates, upcomingJobs });
    } catch (error) {
        console.error("Error fetching upcoming jobs:", error);
        return NextResponse.json(
            { error: "Failed to fetch upcoming jobs" },
            { status: 500 }
        );
    }
}
