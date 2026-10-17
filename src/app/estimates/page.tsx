import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { HydrationBoundary } from "jotai-ssr";
import { initialCustomersAtom, initialEstimatesAtom } from "@/lib/atoms";
import EstimatesView from "@/components/views/EstimatesView";
import {
    getUserIdOrOrgId,
    buildScopeWhere,
} from "../api/utils";

async function getEstimatesData() {
    const scope = await getUserIdOrOrgId();
    const scopeWhere = buildScopeWhere(scope);

    const [estimates, customers] = await Promise.all([
        prisma.estimate.findMany({
            where: scopeWhere,
            select: {
                id: true,
                title: true,
                status: true,
                createdAt: true,
                customerId: true,
                userId: true,
                customer: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                items: {
                    select: {
                        id: true,
                        description: true,
                        quantity: true,
                        unitPrice: true,
                        estimateId: true,
                        serviceId: true,
                        service: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        }),
        prisma.customer
            .findMany({
                where: scopeWhere,
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                    address: true,
                    notes: true,
                    createdAt: true,
                },
                orderBy: { name: "asc" },
            })
            .then((customers) =>
                customers.map((customer) => ({
                    ...customer,
                    createdAt: customer.createdAt.toISOString(),
                }))
            ),
    ]);

    return {
        estimates,
        customers,
    };
}

export default async function EstimatesPage() {
    const session = await getSession();

    if (!session?.user?.email) {
        redirect("/login?callbackUrl=" + encodeURIComponent("/estimates"));
    }

    const { estimates, customers } = await getEstimatesData();

    // Convert Decimal objects to numbers for client-side serialization
    const serializedEstimates = JSON.parse(JSON.stringify(estimates));
    const serializedCustomers = JSON.parse(JSON.stringify(customers));

    return (
        <HydrationBoundary
            hydrateAtoms={[
                [initialEstimatesAtom, serializedEstimates],
                [initialCustomersAtom, serializedCustomers],
            ]}
        >
            <EstimatesView />
        </HydrationBoundary>
    );
}
