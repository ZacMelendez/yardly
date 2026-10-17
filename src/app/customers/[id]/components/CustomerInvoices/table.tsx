"use client";

import { Invoice, InvoiceItemType, initialCustomerDetailAtom } from "@/lib/atoms";
import { Group, Stack, Title, Text, Table, ActionIcon, Button } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconFileDownload, IconMail } from "@tabler/icons-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAtomValue } from "jotai";
import { useState } from "react";
import { fetchJSON } from "@/lib/fetchJson";
import { useSubscriptionLimits } from "@/hooks/useSubscriptionLimits";

function formatCurrency(amount: number) {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
    }).format(amount);
}

function formatInvoiceNumber(id: string) {
    return `INV-${id.slice(-8).toUpperCase()}`;
}

function calculateTotal(items: InvoiceItemType[]) {
    return (items || []).reduce(
        (sum, item) => sum + item.quantity * Number(item.unitPrice),
        0
    );
}

export function CustomerInvoicesTable({
    invoices: initialInvoices,
}: {
    invoices: Invoice[];
}) {
    const customer = useAtomValue(initialCustomerDetailAtom);
    const queryClient = useQueryClient();
    const { handleLimitError } = useSubscriptionLimits();
    const [sendingId, setSendingId] = useState<string | null>(null);

    const { data: invoices } = useQuery({
        queryKey: ["customer", "invoices", customer.id],
        queryFn: () =>
            fetchJSON<Invoice[]>(`/api/invoices/customer/${customer.id}`),
        enabled: !!customer.id,
        initialData: initialInvoices,
    });

    const handleSend = async (invoice: Invoice) => {
        const hasEmail = !!invoice.customer?.email?.trim();
        if (!hasEmail || sendingId) return;
        setSendingId(invoice.id);
        try {
            await fetchJSON(`/api/invoices/${invoice.id}/send`, {
                method: "POST",
            });
            notifications.show({
                title: "Invoice sent",
                message: `Invoice sent to ${invoice.customer?.email}`,
                color: "green",
            });
            queryClient.invalidateQueries({
                queryKey: ["customer", "invoices", customer.id],
            });
        } catch (err) {
            if (!handleLimitError(err)) {
                notifications.show({
                    title: "Error",
                    message:
                        err instanceof Error
                            ? err.message
                            : "Failed to send invoice",
                    color: "red",
                });
            }
        } finally {
            setSendingId(null);
        }
    };

    return (
        <Stack gap="md">
            <Group justify="space-between" align="center">
                <Title order={4}>Invoices ({invoices.length})</Title>
            </Group>

            {invoices.length === 0 ? (
                <Text c="dimmed" ta="center" py="md">
                    No invoices found for this customer.
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
                                <Table.Th>Invoice #</Table.Th>
                                <Table.Th>Status</Table.Th>
                                <Table.Th>Due Date</Table.Th>
                                <Table.Th>Total</Table.Th>
                                <Table.Th>Created</Table.Th>
                                <Table.Th></Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {invoices.map((invoice) => {
                                const invNum = formatInvoiceNumber(invoice.id);
                                const hasEmail = !!invoice.customer?.email?.trim();
                                const isSending = sendingId === invoice.id;

                                return (
                                    <Table.Tr key={invoice.id}>
                                        <Table.Td>
                                            <Text fw={500}>{invNum}</Text>
                                        </Table.Td>
                                        <Table.Td>
                                            <Text size="sm">{invoice.status}</Text>
                                        </Table.Td>
                                        <Table.Td>
                                            {invoice.dueDate
                                                ? new Date(
                                                      invoice.dueDate
                                                  ).toLocaleDateString()
                                                : "—"}
                                        </Table.Td>
                                        <Table.Td>
                                            {formatCurrency(
                                                calculateTotal(
                                                    invoice.items || []
                                                )
                                            )}
                                        </Table.Td>
                                        <Table.Td>
                                            {new Date(
                                                invoice.createdAt
                                            ).toLocaleDateString()}
                                        </Table.Td>
                                        <Table.Td>
                                            <Group gap="xs">
                                                <ActionIcon
                                                    variant="light"
                                                    component="a"
                                                    href={`/api/invoices/${invoice.id}/pdf`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    title="Download PDF"
                                                >
                                                    <IconFileDownload
                                                        size={16}
                                                    />
                                                </ActionIcon>
                                                <Button
                                                    variant="light"
                                                    size="xs"
                                                    leftSection={
                                                        <IconMail size={14} />
                                                    }
                                                    loading={isSending}
                                                    disabled={!hasEmail}
                                                    onClick={() =>
                                                        handleSend(invoice)
                                                    }
                                                    title={
                                                        !hasEmail
                                                            ? "Add an email to this customer to send the invoice"
                                                            : "Send invoice by email"
                                                    }
                                                >
                                                    Send
                                                </Button>
                                            </Group>
                                        </Table.Td>
                                    </Table.Tr>
                                );
                            })}
                        </Table.Tbody>
                    </Table>
                </div>
            )}
        </Stack>
    );
}
