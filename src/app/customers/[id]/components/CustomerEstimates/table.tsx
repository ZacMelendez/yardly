"use client";
import { Estimate, EstimateItem, initialCustomerDetailAtom } from "@/lib/atoms";
import { Group, Stack, Title, Text, Table, ActionIcon } from "@mantine/core";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { IconPencil, IconTrash } from "@tabler/icons-react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useAtomValue } from "jotai";
import { useCallback } from "react";
import EstimatesClient from "@/components/forms/EstimatesClient";
import EstimateStatusMenu from "@/components/forms/EstimateStatusMenu";
import { fetchJSON } from "@/lib/fetchJson";
import { useSubscriptionLimits } from "@/hooks/useSubscriptionLimits";

function formatCurrency(amount: number) {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
    }).format(amount);
}

function calculateTotal(items: EstimateItem[]) {
    return items.reduce(
        (sum, item) => sum + item.quantity * Number(item.unitPrice),
        0
    );
}
export const CustomerEstimatesTable = ({
    estimates: initialEstimates,
}: {
    estimates: Estimate[];
}) => {
    const customer = useAtomValue(initialCustomerDetailAtom);
    const queryClient = useQueryClient();
    const { handleLimitError } = useSubscriptionLimits();

    const { data: estimates } = useQuery({
        queryKey: ["customer", "estimates", customer.id],
        queryFn: () =>
            fetchJSON<Estimate[]>(`/api/estimates/customer/${customer.id}`),
        enabled: !!customer.id,
        initialData: initialEstimates,
    });

    const deleteEstimateMutation = useMutation({
        mutationFn: (id: string) =>
            fetchJSON<Estimate>(`/api/estimates/${id}`, {
                method: "DELETE",
            }),
        onMutate: async (estimateId) => {
            // Cancel any outgoing refetches
            await queryClient.cancelQueries({
                queryKey: ["customer", "estimates", customer.id],
            });

            // Snapshot the previous value
            const previousEstimates = queryClient.getQueryData<Estimate[]>([
                "customer",
                "estimates",
                customer.id,
            ]);

            // Optimistically update to the new value
            queryClient.setQueryData<Estimate[]>(
                ["customer", "estimates", customer.id],
                (old) =>
                    old?.filter((estimate) => estimate.id !== estimateId) || []
            );

            // Return a context object with the snapshotted value
            return { previousEstimates };
        },
        onError: (err, estimateId, context) => {
            // If the mutation fails, use the context returned from onMutate to roll back
            if (context?.previousEstimates) {
                queryClient.setQueryData(
                    ["customer", "estimates", customer.id],
                    context.previousEstimates
                );
            }
            if (!handleLimitError(err)) {
                notifications.show({
                    title: "Error",
                    message: "Failed to delete estimate",
                    color: "red",
                });
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["customer", "estimates", customer.id],
            });
        },
    });

    const handleDeleteEstimate = useCallback(
        async (id: string) => {
            try {
                await deleteEstimateMutation.mutateAsync(id);
            } catch (error) {
                console.error(error);
            }
        },
        [deleteEstimateMutation]
    );

    return (
        <Stack gap="md">
            <Group justify="space-between" align="center">
                <Title order={4}>Estimates ({estimates.length})</Title>
                <EstimatesClient customerId={customer.id} />
            </Group>

            {estimates.length === 0 ? (
                <Text c="dimmed" ta="center" py="md">
                    No estimates found for this customer.
                </Text>
            ) : (
                <div
                    style={{
                        overflowX: "auto",
                        WebkitOverflowScrolling: "touch",
                    }}
                >
                    <Table
                        highlightOnHover
                        withRowBorders={false}
                        verticalSpacing="sm"
                    >
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th>Title</Table.Th>
                                <Table.Th>Status</Table.Th>
                                <Table.Th>Total</Table.Th>
                                <Table.Th>Created</Table.Th>
                                <Table.Th></Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {estimates.map((estimate) => (
                                <Table.Tr key={estimate.id}>
                                    <Table.Td>
                                        <Text fw={500}>{estimate.title}</Text>
                                    </Table.Td>
                                    <Table.Td>
                                        <EstimateStatusMenu
                                            estimate={estimate}
                                            refetchQueryKeys={[
                                                [
                                                    "customer",
                                                    "estimates",
                                                    customer.id,
                                                ],
                                            ]}
                                        />
                                    </Table.Td>
                                    <Table.Td>
                                        {formatCurrency(
                                            calculateTotal(estimate.items || [])
                                        )}
                                    </Table.Td>
                                    <Table.Td>
                                        {new Date(
                                            estimate.createdAt
                                        ).toLocaleDateString()}
                                    </Table.Td>
                                    <Table.Td>
                                        <Group gap="xs">
                                            <EstimatesClient
                                                refetchQueryKeys={[
                                                    [
                                                        "customer",
                                                        "estimates",
                                                        customer.id,
                                                    ],
                                                ]}
                                                customerId={estimate.customerId}
                                                estimate={estimate}
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
                                                        title: "Delete Estimate",
                                                        children: (
                                                            <Text size="sm">
                                                                Are you sure you
                                                                want to delete
                                                                this estimate?
                                                                This will delete
                                                                all jobs,
                                                                invoices, etc.
                                                                associated with
                                                                this estimate.
                                                            </Text>
                                                        ),
                                                        labels: {
                                                            confirm: "Delete",
                                                            cancel: "Cancel",
                                                        },
                                                        onConfirm: () =>
                                                            handleDeleteEstimate(
                                                                estimate.id
                                                            ),
                                                    });
                                                }}
                                                color="red"
                                            >
                                                <IconTrash size={16} />
                                            </ActionIcon>
                                        </Group>
                                    </Table.Td>
                                </Table.Tr>
                            ))}
                        </Table.Tbody>
                    </Table>
                </div>
            )}
        </Stack>
    );
};
