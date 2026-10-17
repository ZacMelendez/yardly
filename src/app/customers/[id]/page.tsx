import React, { Suspense } from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Container, Stack, Divider } from "@mantine/core";
import { CustomerHeader } from "./components/CustomerHeader";
import { CustomerInfo } from "./components/CustomerInfo";
import { CustomerJobs } from "./components/CustomerJobs";
import { CustomerInfoLoading } from "./components/CustomerInfoLoading";
import { JobsLoading } from "./components/JobsLoading";
import { HydrationBoundary } from "jotai-ssr";
import { initialCustomerDetailAtom } from "@/lib/atoms";
import { CustomerEstimates } from "./components/CustomerEstimates";
import { EstimatesLoading } from "./components/EstimatesLoading";
import { CustomerInvoices } from "./components/CustomerInvoices";
import { InvoicesLoading } from "./components/InvoicesLoading";
import { DeleteCustomer } from "./components/DeleteCustomer";
import { getUserIdOrOrgId, buildScopeWhere } from "../../api/utils";

export default async function Index(props: {
    params: Promise<{ id: string }>;
}) {
    const params = await props.params;
    const scope = await getUserIdOrOrgId();
    const scopeWhere = buildScopeWhere(scope);

    const customer = await prisma.customer.findFirst({
        where: {
            id: params.id,
            ...scopeWhere,
        },
    });

    if (!customer) {
        return notFound();
    }

    return (
        <Container size="lg" py="md">
            <Stack gap="lg">
                <HydrationBoundary
                    hydrateAtoms={[[initialCustomerDetailAtom, customer]]}
                >
                    <CustomerHeader customer={customer} />

                    <Suspense fallback={<CustomerInfoLoading />}>
                        <CustomerInfo {...customer} />
                    </Suspense>

                    <Divider />

                    <Suspense fallback={<JobsLoading />}>
                        <CustomerJobs customerId={params.id} />
                    </Suspense>

                    <Divider />

                    <Suspense fallback={<EstimatesLoading />}>
                        <CustomerEstimates customerId={params.id} />
                    </Suspense>

                    <Divider />

                    <Suspense fallback={<InvoicesLoading />}>
                        <CustomerInvoices customerId={params.id} />
                    </Suspense>

                    <Divider />

                    <DeleteCustomer id={params.id} />
                </HydrationBoundary>
            </Stack>
        </Container>
    );
}
