import React from "react";
import { prisma } from "@/lib/prisma";
import { type EstimateItem } from "@/lib/atoms";
import EstimateItemsTable from "./table";

export default async function EstimateItems({
    estimateId,
}: {
    estimateId: string;
}) {
    const items = await prisma.estimateItem.findMany({
        where: { estimateId },
        include: {
            service: true,
        },
    });

    return (
        <EstimateItemsTable
            items={JSON.parse(JSON.stringify(items)) as EstimateItem[]}
        />
    );
}
