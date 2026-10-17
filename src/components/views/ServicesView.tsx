"use client";
import { useAtom } from "jotai";
import { useEffect, useMemo, useState } from "react";
import { Anchor, Box } from "@mantine/core";
import { type MRT_ColumnDef } from "mantine-react-table";
import { Link } from "next-view-transitions";
import ServicesClient from "@/components/forms/ServicesClient";
import { servicesAtom, type Service } from "@/lib/atoms";
import DataTable from "@/components/ui/DataTable";

export default function ServicesView() {
    const [servicesResult] = useAtom(servicesAtom);

    const [services, setServices] = useState<Service[] | undefined>(undefined);
    const [isPending, setIsPending] = useState(true);
    const [isError, setIsError] = useState(false);

    useEffect(() => {
        if (servicesResult) {
            setServices(servicesResult.data);
            setIsPending(servicesResult.isPending || false);
            setIsError(servicesResult.isError || false);
        }
    }, [servicesResult]);

    const columns = useMemo<MRT_ColumnDef<Service>[]>(
        () => [
            {
                accessorKey: "name",
                header: "Name",
                Cell: ({ cell, row }) => (
                    <Anchor
                        component={Link}
                        href={`/services/${row.original.id}`}
                        fw={500}
                        c="blue"
                    >
                        {cell.getValue<string>()}
                    </Anchor>
                ),
            },
            {
                accessorKey: "defaultPrice",
                header: "Default Price",
                Cell: ({ cell }) => `$${cell.getValue<number>()}`,
            },
            {
                accessorKey: "unit",
                header: "Unit",
            },
            {
                accessorKey: "isActive",
                header: "Is Active",
                Cell: ({ cell }) => (cell.getValue<boolean>() ? "Yes" : "No"),
            },
            {
                accessorKey: "description",
                header: "Description",
            },
            {
                accessorKey: "category",
                header: "Category",
            },
        ],
        []
    );

    return (
        <Box
            style={{ height: "100%", display: "flex", flexDirection: "column" }}
        >
            <DataTable<Service>
                data={services}
                columns={columns}
                isLoading={isPending}
                isError={isError}
                loadingText="Loading services..."
                errorText="Error loading services"
                emptyStateText="No services found. Create your first service to get started."
                tableTitle="Services"
                toolbarActions={<ServicesClient />}
            />
        </Box>
    );
}
