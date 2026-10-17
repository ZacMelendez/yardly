import React from "react";
import { Card, Stack, Group, Text, Title } from "@mantine/core";
import { Customer } from "@/lib/atoms";

export async function CustomerInfo(customer: Partial<Customer>) {
    return (
        <Card withBorder>
            <Stack gap="md">
                <Title order={4}>Customer Information</Title>
                <Group grow>
                    <Stack gap="xs">
                        <Text size="sm" fw={500} c="dimmed">
                            Name
                        </Text>
                        <Text>{customer.name}</Text>
                    </Stack>
                    <Stack gap="xs">
                        <Text size="sm" fw={500} c="dimmed">
                            Email
                        </Text>
                        <Text>{customer.email || "—"}</Text>
                    </Stack>
                </Group>
                <Group grow>
                    <Stack gap="xs">
                        <Text size="sm" fw={500} c="dimmed">
                            Phone
                        </Text>
                        <Text>{customer.phone || "—"}</Text>
                    </Stack>
                    <Stack gap="xs">
                        <Text size="sm" fw={500} c="dimmed">
                            Address
                        </Text>
                        <Text>{customer.address || "—"}</Text>
                    </Stack>
                </Group>
                {customer.notes && (
                    <Stack gap="xs">
                        <Text size="sm" fw={500} c="dimmed">
                            Notes
                        </Text>
                        <Text>{customer.notes}</Text>
                    </Stack>
                )}
            </Stack>
        </Card>
    );
}
