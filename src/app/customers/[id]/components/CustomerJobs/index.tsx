import React from "react";
import { prisma } from "@/lib/prisma";
import { CustomerJobsTable } from "./table";
import { Job } from "@/lib/atoms";

interface CustomerJobsProps {
    customerId: string;
}

export async function CustomerJobs({ customerId }: CustomerJobsProps) {
    const jobs = await prisma.job.findMany({
        where: {
            customerId,
        },
        include: {
            customer: {
                select: {
                    id: true,
                    name: true,
                },
            },
            estimate: {
                select: {
                    id: true,
                    title: true,
                },
            },
        },
        orderBy: { createdAt: "desc" },
    });

    return (
        <CustomerJobsTable jobs={JSON.parse(JSON.stringify(jobs)) as Job[]} />
    );
}
