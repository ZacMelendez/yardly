import React from "react";

import { HydrationBoundary } from "jotai-ssr";
import { initialJobDetailAtom } from "@/lib/atoms";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import JobDetailPage from "./components/JobDetailPage";

export default async function Index(props: {
    params: Promise<{ id: string }>;
}) {
    const params = await props.params;
    const job = await prisma.job.findUnique({
        where: {
            id: params.id,
        },
        include: {
            estimate: {
                include: {
                    items: {
                        include: {
                            service: true,
                        },
                    },
                },
            },
            customer: true,
            invoices: {
                select: { id: true, status: true },
                orderBy: { createdAt: "desc" },
                take: 1,
            },
        },
    });

    if (!job) {
        return notFound();
    }

    const serializedJob = JSON.parse(JSON.stringify(job));

    return (
        <HydrationBoundary
            hydrateAtoms={[[initialJobDetailAtom, serializedJob]]}
        >
            <JobDetailPage />
        </HydrationBoundary>
    );
}
