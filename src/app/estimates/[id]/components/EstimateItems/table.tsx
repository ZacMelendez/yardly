"use client";

import React from "react";
import { useAtomValue } from "jotai";
import { useQuery } from "@tanstack/react-query";
import { useDisclosure } from "@mantine/hooks";
import { Stack, Group, Title, Text, Button, Table } from "@mantine/core";
import { initialEstimateDetailAtom, type EstimateItem } from "@/lib/atoms";
import { fetchJSON } from "@/lib/fetchJson";
import EstimateItemsModal from "../EstimateItemsModal";

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

export default function EstimateItemsTable({
    items: initialItems,
}: {
    items: EstimateItem[];
}) {
    const estimate = useAtomValue(initialEstimateDetailAtom);
    const [editItemsOpened, { open: openEditItems, close: closeEditItems }] =
        useDisclosure(false);

    // React Query with initial data from server
    const { data: items } = useQuery({
        queryKey: ["estimate", "items", estimate?.id],
        queryFn: () =>
            fetchJSON<EstimateItem[]>(`/api/estimates/${estimate?.id}/items`),
        enabled: !!estimate?.id,
        initialData: initialItems, // Server data as initial state
    });

    const estimateTotal = calculateTotal(items || []);

    return (
        <>
            <Stack gap="md">
                <Group justify="space-between" align="center">
                    <Title order={4}>Items ({items?.length || 0})</Title>
                    <Group gap="sm">
                        <Button
                            variant="light"
                            size="sm"
                            onClick={openEditItems}
                        >
                            Edit Items
                        </Button>
                    </Group>
                </Group>

                {!items || items.length === 0 ? (
                    <Text c="dimmed" ta="center" py="md">
                        No items found for this estimate.
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
                            style={{ minWidth: "600px" }}
                        >
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th>Description</Table.Th>
                                    <Table.Th>Service</Table.Th>
                                    <Table.Th>Quantity</Table.Th>
                                    <Table.Th>Unit Price</Table.Th>
                                    <Table.Th>Total</Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {items.map((item: EstimateItem) => {
                                    const itemTotal =
                                        item.quantity * Number(item.unitPrice);
                                    return (
                                        <Table.Tr key={item.id}>
                                            <Table.Td>
                                                <Text fw={500}>
                                                    {item.description ||
                                                        item.service?.name ||
                                                        "Custom Item"}
                                                </Text>
                                            </Table.Td>
                                            <Table.Td>
                                                <Text c="dimmed" size="sm">
                                                    {item.service?.name ||
                                                        "Custom"}
                                                </Text>
                                            </Table.Td>
                                            <Table.Td>
                                                <Text>{item.quantity}</Text>
                                            </Table.Td>
                                            <Table.Td>
                                                {formatCurrency(
                                                    Number(item.unitPrice)
                                                )}
                                            </Table.Td>
                                            <Table.Td>
                                                <Text fw={500}>
                                                    {formatCurrency(itemTotal)}
                                                </Text>
                                            </Table.Td>
                                        </Table.Tr>
                                    );
                                })}
                            </Table.Tbody>
                            <Table.Tfoot>
                                <Table.Tr>
                                    <Table.Td colSpan={4}>
                                        <Text fw={600} ta="right">
                                            Total:
                                        </Text>
                                    </Table.Td>
                                    <Table.Td>
                                        <Text fw={600} size="lg" c="green">
                                            {formatCurrency(estimateTotal)}
                                        </Text>
                                    </Table.Td>
                                </Table.Tr>
                            </Table.Tfoot>
                        </Table>
                    </div>
                )}
            </Stack>

            {/* Edit Items Modal */}
            {estimate && (
                <EstimateItemsModal
                    estimate={estimate}
                    opened={editItemsOpened}
                    onClose={closeEditItems}
                />
            )}
        </>
    );
}
