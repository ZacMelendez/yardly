"use client";
import DataTable from "@/components/ui/DataTable";
import { ActionIcon, Button } from "@mantine/core";
import { IconPlus, IconUpload } from "@tabler/icons-react";

export default function Index() {
    return (
        <DataTable
            tableTitle="Customers"
            data={[]}
            columns={[
                {
                    accessorKey: "name",
                    header: "Name",
                },
                {
                    accessorKey: "email",
                    header: "Email",
                },
                {
                    accessorKey: "phone",
                    header: "Phone",
                },
                {
                    accessorKey: "address",
                    header: "Address",
                },
                {
                    accessorKey: "notes",
                    header: "Notes",
                },
                {
                    accessorKey: "actions",
                    header: "Actions",
                },
            ]}
            isLoading
            toolbarActions={
                <>
                    <Button disabled variant="light" visibleFrom="sm">
                        Add customer
                    </Button>
                    <ActionIcon
                        disabled
                        variant="light"
                        hiddenFrom="sm"
                        size="lg"
                    >
                        <IconPlus />
                    </ActionIcon>
                    <ActionIcon disabled variant="outline" size="lg">
                        <IconUpload size={16} />
                    </ActionIcon>
                </>
            }
        />
    );
}
