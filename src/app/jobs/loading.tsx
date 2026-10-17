"use client";
import DataTable from "@/components/ui/DataTable";
import { ActionIcon, Button } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";

export default function Index() {
    return (
        <DataTable
            tableTitle="Jobs"
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
                    accessorKey: "date",
                    header: "Scheduled Date",
                },
                {
                    accessorKey: "status",
                    header: "Status",
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
                        Add job
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
