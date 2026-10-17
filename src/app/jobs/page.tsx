import { prisma } from "@/lib/prisma";
import { HydrationBoundary } from "jotai-ssr";
import JobsView from "@/components/views/JobsView";
import {
    initialJobsAtom,
    initialCustomersAtom,
    type Job,
    CustomerResponse,
    Estimate,
} from "@/lib/atoms";
import {
    getUserIdOrOrgId,
    buildScopeWhere,
} from "../api/utils";
import { getCustomers } from "@/lib/actions/customers";

async function getJobsData(): Promise<{
    jobs: Job[];
    customers: CustomerResponse;
}> {
    const scope = await getUserIdOrOrgId();
    const scopeWhere = buildScopeWhere(scope);

    const [jobs, customers] = await Promise.all([
        prisma.job.findMany({
            where: scopeWhere,
            select: {
                id: true,
                title: true,
                date: true,
                status: true,
                createdAt: true,
                customer: {
                    select: {
                        id: true,
                        name: true,
                        address: true,
                    },
                },
                estimate: {
                    select: {
                        id: true,
                        title: true,
                    },
                },
                isRecurring: true,
                recurrenceRule: true,
                recurrenceEnd: true,
                parentJobId: true,
            },
            orderBy: { createdAt: "desc" },
        }),
        await getCustomers(),
    ]);

    return {
        jobs: jobs.map((job) => ({
            ...job,
            createdAt: job.createdAt.toISOString(),
            date: job.date?.toISOString() || null,
            estimate: job.estimate as Estimate,
            recurrenceRule: job.recurrenceRule as any,
            recurrenceEnd: job.recurrenceEnd?.toISOString() || null,
        })),
        customers,
    };
}

export default async function JobsPage() {
    const { jobs, customers } = await getJobsData();

    return (
        <HydrationBoundary
            hydrateAtoms={[
                [initialJobsAtom, jobs],
                [initialCustomersAtom, customers],
            ]}
        >
            <JobsView />
        </HydrationBoundary>
    );
}
