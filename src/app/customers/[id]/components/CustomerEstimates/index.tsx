import React from "react";
import { prisma } from "@/lib/prisma";
import { CustomerEstimatesTable } from "./table";
import { Estimate } from "@/lib/atoms";

interface CustomerEstimatesProps {
    customerId: string;
}

export async function CustomerEstimates({
    customerId,
}: CustomerEstimatesProps) {
    const estimates = await prisma.estimate.findMany({
        where: {
            customerId,
        },
        include: {
            customer: true,
            items: true,
        },
        orderBy: { createdAt: "desc" },
    });

    return (
        <CustomerEstimatesTable
            estimates={JSON.parse(JSON.stringify(estimates)) as Estimate[]}
        />
    );
}
