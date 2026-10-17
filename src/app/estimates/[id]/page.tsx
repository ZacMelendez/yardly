import React, { Suspense } from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Container, Stack, Divider } from "@mantine/core";
import { HydrationBoundary } from "jotai-ssr";
import { initialEstimateDetailAtom } from "@/lib/atoms";
import EstimateHeader from "./components/EstimateHeader";
import EstimateInfo from "./components/EstimateInfo";
import EstimateInfoLoading from "./components/EstimateInfoLoading";
import EstimateItems from "./components/EstimateItems";
import EstimateItemsLoading from "./components/EstimateItemsLoading";
import DeleteEstimate from "./components/DeleteEstimate";

export default async function Index(props: {
    params: Promise<{ id: string }>;
}) {
    const params = await props.params;

    // Server-side data fetching
    const estimate = await prisma.estimate.findUnique({
        where: { id: params.id },
        include: {
            customer: true,
            items: {
                include: {
                    service: true,
                },
            },
        },
    });

    if (!estimate) {
        return notFound();
    }

    // Convert Decimal objects to numbers for client-side serialization
    const serializedEstimate = JSON.parse(JSON.stringify(estimate));

    return (
        <Container size="lg" py="md">
            <Stack gap="lg">
                <HydrationBoundary
                    hydrateAtoms={[
                        [initialEstimateDetailAtom, serializedEstimate],
                    ]}
                >
                    <EstimateHeader estimate={serializedEstimate} />

                    <Suspense fallback={<EstimateInfoLoading />}>
                        <EstimateInfo {...serializedEstimate} />
                    </Suspense>

                    <Divider />

                    <Suspense fallback={<EstimateItemsLoading />}>
                        <EstimateItems estimateId={params.id} />
                    </Suspense>

                    <DeleteEstimate id={params.id} />
                </HydrationBoundary>
            </Stack>
        </Container>
    );
}
