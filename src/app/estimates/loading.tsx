"use client";
import DataTable from "@/components/ui/DataTable";
import { ActionIcon, Button } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";

export default function Index() {
    return (
        <DataTable
            tableTitle="Estimates"
            data={[]}
            columns={[
                {
                    accessorKey: "title",
                    header: "Title",
                },
                {
                    accessorKey: "customer",
                    header: "Customer",
                },
                {
                    accessorKey: "status",
                    header: "Status",
                },
                {
                    accessorKey: "items",
                    header: "Total",
                },
                {
                    accessorKey: "createdAt",
                    header: "Created",
                },
                {
                    id: "actions",
                    header: "Actions",
                },
            ]}
            isLoading
            toolbarActions={
                <>
                    <Button disabled variant="light" visibleFrom="sm">
                        Add estimate
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
