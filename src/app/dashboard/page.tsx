import { prisma } from "@/lib/prisma";
import DashboardView from "@/components/views/DashboardView";
import { type DashboardData } from "@/lib/atoms";
import {
    getUserIdOrOrgId,
    buildScopeWhere,
} from "../api/utils";
import { getUserId } from "../api/utils";

async function getDashboardData(): Promise<DashboardData> {
    const scope = await getUserIdOrOrgId();
    const scopeWhere = buildScopeWhere(scope);

    const [customers, estimates, invoices, jobs] = await Promise.all([
        prisma.customer.count({ where: scopeWhere }),
        prisma.estimate.count({ where: scopeWhere }),
        prisma.invoice.count({ where: { ...scopeWhere, status: "unpaid" } }),
        prisma.job.count({ where: { ...scopeWhere, status: "scheduled" } }),
    ]);

    const recentCustomers = await prisma.customer.findMany({
        where: scopeWhere,
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
            id: true,
            name: true,
        },
    });

    return {
        metrics: {
            customers,
            estimates,
            unpaidInvoices: invoices,
            scheduledJobs: jobs,
        },
        recentCustomers,
    };
}

async function getUpcomingJobs() {
    const scope = await getUserIdOrOrgId();
    const scopeWhere = buildScopeWhere(scope);

    const jobs = await prisma.job.findMany({
        where: {
            ...scopeWhere,
            status: "scheduled",
            date: {
                gte: new Date(),
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
        take: 10,
    });

    const jobsWithCoordinates = await Promise.all(
        jobs.map(async (job) => {
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

                        if (data.status === "OK" && data.results.length > 0) {
                            const location = data.results[0].geometry.location;
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

    return jobsWithCoordinates;
}

const EMPTY_DASHBOARD_DATA: DashboardData = {
    metrics: {
        customers: 0,
        estimates: 0,
        unpaidInvoices: 0,
        scheduledJobs: 0,
    },
    recentCustomers: [],
};

export default async function DashboardPage() {
    const userId = await getUserId();
    const organizationCount = await prisma.member.count({
        where: { userId },
    });

    // When user has no organizations, show create prompt with empty data
    if (organizationCount === 0) {
        return (
            <DashboardView
                data={EMPTY_DASHBOARD_DATA}
                upcomingJobs={[]}
                showCreateCompanyPrompt={true}
            />
        );
    }

    // Try to load org-scoped data (requires active organization selection)
    try {
        const [data, upcomingJobs] = await Promise.all([
            getDashboardData(),
            getUpcomingJobs(),
        ]);

        return (
            <DashboardView
                data={data}
                upcomingJobs={upcomingJobs}
                showCreateCompanyPrompt={false}
            />
        );
    } catch (error) {
        // No organization selected - show prompt to select one
        const isNoOrgError =
            error instanceof Error &&
            error.message.includes("No organization selected");

        return (
            <DashboardView
                data={EMPTY_DASHBOARD_DATA}
                upcomingJobs={[]}
                showCreateCompanyPrompt={isNoOrgError}
                showSelectCompanyPrompt={isNoOrgError}
            />
        );
    }
}
