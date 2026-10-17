import { HydrationBoundary } from "jotai-ssr";
import CustomersView from "@/components/views/CustomersView";
import { initialCustomersAtom } from "@/lib/atoms";
import { getCustomers } from "@/lib/actions/customers";

export default async function CustomersPage() {
    const customers = await getCustomers();

    return (
        <HydrationBoundary hydrateAtoms={[[initialCustomersAtom, customers]]}>
            <CustomersView />
        </HydrationBoundary>
    );
}
