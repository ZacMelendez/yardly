import React from "react";
import { Card, Stack, Group, Text, Title } from "@mantine/core";
import { type EstimateDetail, type EstimateItem } from "@/lib/atoms";

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

function formatDate(dateString?: string | Date | null) {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}

export default function EstimateInfo(estimate: EstimateDetail) {
    const estimateTotal = calculateTotal(estimate.items || []);

    return (
        <Card withBorder>
            <Stack gap="md">
                <Title order={4}>Estimate Details</Title>
                <Group grow>
                    <Stack gap="xs">
                        <Text size="sm" fw={500} c="dimmed">
                            Customer
                        </Text>
                        <Text>{estimate.customer?.name || "—"}</Text>
                    </Stack>
                    <Stack gap="xs">
                        <Text size="sm" fw={500} c="dimmed">
                            Total Amount
                        </Text>
                        <Text size="lg" fw={600} c="green">
                            {formatCurrency(estimateTotal)}
                        </Text>
                    </Stack>
                </Group>
                <Group grow>
                    <Stack gap="xs">
                        <Text size="sm" fw={500} c="dimmed">
                            Created
                        </Text>
                        <Text>{formatDate(estimate.createdAt)}</Text>
                    </Stack>
                    <Stack gap="xs">
                        <Text size="sm" fw={500} c="dimmed">
                            Last Updated
                        </Text>
                        <Text>{formatDate(estimate.updatedAt)}</Text>
                    </Stack>
                </Group>
                {estimate.customer?.email && (
                    <Stack gap="xs">
                        <Text size="sm" fw={500} c="dimmed">
                            Customer Email
                        </Text>
                        <Text>{estimate.customer.email}</Text>
                    </Stack>
                )}
                {estimate.customer?.address && (
                    <Stack gap="xs">
                        <Text size="sm" fw={500} c="dimmed">
                            Customer Address
                        </Text>
                        <Text>{estimate.customer.address}</Text>
                    </Stack>
                )}
            </Stack>
        </Card>
    );
}
