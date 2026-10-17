"use client";
import DataTable from "@/components/ui/DataTable";
import { ActionIcon, Button } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";

export default function Index() {
    return (
        <DataTable
            tableTitle="Services"
            data={[]}
            columns={[
                {
                    accessorKey: "name",
                    header: "Name",
                },
                {
                    accessorKey: "defaultPrice",
                    header: "Default Price",
                },
                {
                    accessorKey: "unit",
                    header: "Unit",
                },
                {
                    accessorKey: "isActive",
                    header: "Is Active",
                },
                {
                    accessorKey: "description",
                    header: "Description",
                },
                {
                    accessorKey: "category",
                    header: "Category",
                },
            ]}
            isLoading
            toolbarActions={
                <>
                    <Button disabled variant="light" visibleFrom="sm">
                        Add service
                    </Button>
                    <ActionIcon
                        disabled
                        variant="light"
                        hiddenFrom="sm"
                        size="lg"
                    >
                        <IconPlus />
                    </ActionIcon>
                </>
            }
        />
    );
}
