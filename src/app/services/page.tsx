import { prisma } from "@/lib/prisma";
import { HydrationBoundary } from "jotai-ssr";
import ServicesView from "@/components/views/ServicesView";
import { initialServicesAtom } from "@/lib/atoms";
import { getUserIdOrOrgId, buildScopeWhere } from "../api/utils";

async function getServices() {
    const scope = await getUserIdOrOrgId();
    const scopeWhere = buildScopeWhere(scope);
    const services = await prisma.service.findMany({
        where: scopeWhere,
        orderBy: { createdAt: "desc" },
    });

    return services;
}

export default async function ServicesPage() {
    const services = await getServices();

    // Convert Decimal objects to numbers for client-side serialization
    const serializedServices = JSON.parse(JSON.stringify(services));

    return (
        <HydrationBoundary
            hydrateAtoms={[[initialServicesAtom, serializedServices]]}
        >
            <ServicesView />
        </HydrationBoundary>
    );
}
