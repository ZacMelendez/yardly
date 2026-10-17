"use client";
import { useAtom } from "jotai";
import { useMemo, useCallback, useEffect, useState } from "react";
import { Group, Anchor, Text, ActionIcon, Box, Tooltip } from "@mantine/core";
import { type MRT_ColumnDef } from "mantine-react-table";
import { Link } from "next-view-transitions";
import CustomersClient from "@/components/forms/CustomersClient";
import {
    CustomerResponse,
    customersAtom,
    deleteCustomerMutationAtom,
    type Customer,
} from "@/lib/atoms";
import DataTable from "@/components/ui/DataTable";
import { modals } from "@mantine/modals";
import { IconPencil, IconTrash, IconUpload } from "@tabler/icons-react";
import { useQueryClient } from "@tanstack/react-query";

export default function CustomersView() {
    const [customersResult] = useAtom(customersAtom);
    const [customers, setCustomers] = useState<CustomerResponse | undefined>(
        undefined
    );
    const [isPending, setIsPending] = useState(true);
    const [isError, setIsError] = useState(false);
    const [deleteCustomerMutation] = useAtom(deleteCustomerMutationAtom);

    const queryClient = useQueryClient();

    const handleDeleteCustomer = useCallback(
        async (id: string) => {
            try {
                await deleteCustomerMutation.mutateAsync(id);
                await queryClient.invalidateQueries({
                    queryKey: ["customers"],
                });
            } catch (error) {
                console.error(error);
            }
        },
        [deleteCustomerMutation, queryClient]
    );

    const columns = useMemo<MRT_ColumnDef<Customer>[]>(
        () => [
            {
                accessorKey: "name",
                header: "Name",
                Cell: ({ cell, row }) => (
                    <Anchor
                        component={Link}
                        href={`/customers/${row.original.id}`}
                        fw={500}
                        c="blue"
                    >
                        {cell.getValue<string>()}
                    </Anchor>
                ),
            },
            {
                accessorKey: "email",
                header: "Email",
                Cell: ({ cell }) => cell.getValue<string>() || "-",
            },
            {
                accessorKey: "phone",
                header: "Phone",
                Cell: ({ cell }) => cell.getValue<string>() || "-",
            },
            {
                accessorKey: "address",
                header: "Address",
                Cell: ({ cell }) => cell.getValue<string>() || "-",
            },
            {
                accessorKey: "notes",
                header: "Notes",
                Cell: ({ cell }) => cell.getValue<string>() || "-",
            },
            {
                accessorKey: "actions",
                header: "Actions",
                Cell: ({ row }) => (
                    <Group gap="xs">
                        <CustomersClient
                            customer={row.original}
                            trigger={
                                <ActionIcon variant="light">
                                    <IconPencil size={16} />
                                </ActionIcon>
                            }
                        />
                        <ActionIcon
                            variant="light"
                            onClick={() => {
                                modals.openConfirmModal({
                                    title: "Delete Customer",
                                    children: (
                                        <Text size="sm">
                                            Are you sure you want to delete this
                                            customer? This will delete all jobs,
                                            estimates, invoices, etc. associated
                                            with this customer.
                                        </Text>
                                    ),
                                    labels: {
                                        confirm: "Delete",
                                        cancel: "Cancel",
                                    },
                                    onConfirm: () =>
                                        handleDeleteCustomer(row.original.id),
                                });
                            }}
                            color="red"
                        >
                            <IconTrash size={16} />
                        </ActionIcon>
                    </Group>
                ),
            },
        ],
        [handleDeleteCustomer]
    );

    useEffect(() => {
        if (customersResult) {
            setCustomers(customersResult.data);
            setIsPending(customersResult.isPending || false);
            setIsError(customersResult.isError || false);
        }
    }, [customersResult]);

    return (
        <Box
            style={{ height: "100%", display: "flex", flexDirection: "column" }}
        >
            <DataTable<Customer>
                data={customers?.data}
                columns={columns}
                isLoading={isPending}
                isError={isError}
                loadingText="Loading customers..."
                errorText="Error loading customers"
                emptyStateText="No customers found. Create your first customer to get started."
                tableTitle="Customers"
                toolbarActions={
                    <Group gap="xs">
                        <CustomersClient />
                        <Tooltip label="Bulk Upload" openDelay={250} withArrow>
                            <ActionIcon
                                component={Link}
                                href="/customers/upload"
                                variant="outline"
                                size="lg"
                            >
                                <IconUpload size={16} />
                            </ActionIcon>
                        </Tooltip>
                    </Group>
                }
            />
        </Box>
    );
}
