"use client";
import { useAtom } from "jotai";
import { useMemo, useEffect, useState } from "react";
import { Group, ActionIcon, Tooltip, Anchor, Box } from "@mantine/core";
import { type MRT_ColumnDef } from "mantine-react-table";
import EstimatesClient from "@/components/forms/EstimatesClient";
import { EstimateItem, estimatesAtom, type Estimate } from "@/lib/atoms";
import { formatDistanceToNow } from "date-fns";
import { IconPencil, IconPlus } from "@tabler/icons-react";
import DataTable from "@/components/ui/DataTable";
import { Link } from "next-view-transitions";
import EstimateStatusMenu from "../forms/EstimateStatusMenu";
import JobsClient from "../forms/JobsClient";

export default function EstimatesView() {
    const [estimatesResult] = useAtom(estimatesAtom);
    const [estimates, setEstimates] = useState<Estimate[] | undefined>(
        undefined
    );
    const [isPending, setIsPending] = useState(true);
    const [isError, setIsError] = useState(false);

    useEffect(() => {
        if (estimatesResult) {
            setEstimates(estimatesResult.data);
            setIsPending(estimatesResult.isPending || false);
            setIsError(estimatesResult.isError || false);
        }
    }, [estimatesResult]);

    const calculateTotal = (items: EstimateItem[]) => {
        return items.reduce(
            (sum, item) => sum + item.quantity * Number(item.unitPrice),
            0
        );
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
        }).format(amount);
    };

    const columns = useMemo<MRT_ColumnDef<Estimate>[]>(
        () => [
            {
                accessorKey: "title",
                header: "Title",
                Cell: ({ cell }) => (
                    <Anchor
                        href={`/estimates/${cell.row.original.id}`}
                        component={Link}
                        fw={500}
                    >
                        {cell.getValue<string>()}
                    </Anchor>
                ),
            },
            {
                accessorKey: "customer",
                header: "Customer",
                Cell: ({ row }) => {
                    return (
                        <div>
                            <Anchor
                                href={`/customers/${row.original.customer?.id}`}
                                component={Link}
                            >
                                {row.original.customer?.name}
                            </Anchor>
                            {row.original.customer?.email && (
                                <div
                                    style={{
                                        fontSize: "0.875rem",
                                        color: "#6b7280",
                                    }}
                                >
                                    {row.original.customer.email}
                                </div>
                            )}
                        </div>
                    );
                },
            },
            {
                accessorKey: "status",
                header: "Status",
                Cell: ({ row }) => (
                    <EstimateStatusMenu
                        estimate={row.original}
                        refetchQueryKeys={[["estimates"]]}
                    />
                ),
            },
            {
                accessorKey: "items",
                header: "Total",
                Cell: ({ cell }) =>
                    formatCurrency(
                        calculateTotal(cell.getValue<EstimateItem[]>())
                    ),
            },
            {
                accessorKey: "createdAt",
                header: "Created",
                Cell: ({ cell }) =>
                    formatDistanceToNow(
                        new Date(cell.getValue<string | Date>()),
                        {
                            addSuffix: true,
                        }
                    ),
            },
            {
                id: "actions",
                header: "Actions",
                Cell: ({ row }) => (
                    <Group gap="xs">
                        <EstimatesClient
                            trigger={
                                <ActionIcon variant="light">
                                    <IconPencil size={16} />
                                </ActionIcon>
                            }
                            estimate={row.original}
                        />
                        {row.original.status === "accepted" && (
                            <JobsClient
                                trigger={
                                    <Tooltip label="Add Job">
                                        <ActionIcon variant="light">
                                            <IconPlus size={16} />
                                        </ActionIcon>
                                    </Tooltip>
                                }
                                estimateId={row.original.id}
                                customerId={row.original.customerId}
                            />
                        )}
                    </Group>
                ),
            },
        ],
        []
    );

    return (
        <Box
            style={{ height: "100%", display: "flex", flexDirection: "column" }}
        >
            <DataTable<Estimate>
                data={estimates}
                columns={columns}
                isLoading={isPending}
                isError={isError}
                loadingText="Loading estimates..."
                errorText="Error loading estimates"
                emptyStateText="No estimates found. Create your first estimate to get started."
                tableTitle="Estimates"
                toolbarActions={<EstimatesClient />}
            />
        </Box>
    );
}
