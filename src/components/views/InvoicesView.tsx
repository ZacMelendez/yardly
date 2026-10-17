"use client";

import {
    Table,
    Group,
    Title,
    Text,
    Anchor,
    Badge,
    Stack,
    Paper,
} from "@mantine/core";
import { Link } from "next-view-transitions";
import { formatDistanceToNow } from "date-fns";

type InvoiceItem = {
    id: string;
    description: string | null;
    quantity: number;
    unitPrice: number;
};

type Invoice = {
    id: string;
    status: string;
    dueDate: string | null;
    createdAt: string;
    customer?: { id: string; name: string; email?: string | null };
    items: InvoiceItem[];
    job?: { id: string; title: string } | null;
};

function formatCurrency(amount: number) {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
    }).format(amount);
}

function formatInvoiceNumber(id: string) {
    return `INV-${id.slice(-8).toUpperCase()}`;
}

function calculateTotal(items: InvoiceItem[]) {
    return (items || []).reduce(
        (sum, item) => sum + item.quantity * Number(item.unitPrice),
        0
    );
}

const statusColors: Record<string, string> = {
    draft: "gray",
    unpaid: "yellow",
    paid: "green",
};

export default function InvoicesView({
    initialInvoices,
}: {
    initialInvoices: Invoice[];
}) {
    return (
        <Stack gap="lg">
            <Title order={2}>Invoices</Title>

            {initialInvoices.length === 0 ? (
                <Paper p="xl" withBorder>
                    <Text c="dimmed" ta="center">
                        No invoices yet. Complete a job to create a draft
                        invoice, or create one from the customer page.
                    </Text>
                </Paper>
            ) : (
                <Paper withBorder>
                    <Table
                        highlightOnHover
                        withRowBorders={false}
                        verticalSpacing="sm"
                    >
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th>Invoice #</Table.Th>
                                <Table.Th>Customer</Table.Th>
                                <Table.Th>Status</Table.Th>
                                <Table.Th>Due Date</Table.Th>
                                <Table.Th>Total</Table.Th>
                                <Table.Th>Created</Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {initialInvoices.map((invoice) => {
                                const invNum = formatInvoiceNumber(invoice.id);
                                return (
                                    <Table.Tr key={invoice.id}>
                                        <Table.Td>
                                            <Anchor
                                                component={Link}
                                                href={`/invoices/${invoice.id}`}
                                                fw={500}
                                            >
                                                {invNum}
                                            </Anchor>
                                        </Table.Td>
                                        <Table.Td>
                                            {invoice.customer && (
                                                <Anchor
                                                    component={Link}
                                                    href={`/customers/${invoice.customer.id}`}
                                                >
                                                    {invoice.customer.name}
                                                </Anchor>
                                            )}
                                        </Table.Td>
                                        <Table.Td>
                                            <Badge
                                                color={
                                                    statusColors[invoice.status] ??
                                                    "gray"
                                                }
                                                variant="light"
                                                size="sm"
                                            >
                                                {invoice.status}
                                            </Badge>
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
                                                calculateTotal(invoice.items)
                                            )}
                                        </Table.Td>
                                        <Table.Td>
                                            {formatDistanceToNow(
                                                new Date(invoice.createdAt),
                                                { addSuffix: true }
                                            )}
                                        </Table.Td>
                                    </Table.Tr>
                                );
                            })}
                        </Table.Tbody>
                    </Table>
                </Paper>
            )}
        </Stack>
    );
}
