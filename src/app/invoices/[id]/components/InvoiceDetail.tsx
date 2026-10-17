"use client";

import { useState } from "react";
import {
    Group,
    Title,
    Button,
    Badge,
    ActionIcon,
    Card,
    Stack,
    Text,
    Table,
    Anchor,
    rem,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconArrowLeft, IconFileDownload, IconMail, IconPencil } from "@tabler/icons-react";
import { useTransitionRouter } from "next-view-transitions";
import { useRouter } from "next/navigation";
import { notifications } from "@mantine/notifications";
import { fetchJSON } from "@/lib/fetchJson";
import { useSubscriptionLimits } from "@/hooks/useSubscriptionLimits";
import { Link } from "next-view-transitions";
import InvoiceEditModal from "./InvoiceEditModal";

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
    updatedAt: string;
    customer?: { id: string; name: string; email?: string | null; address?: string | null };
    items: InvoiceItem[];
    job?: { id: string; title: string; date: string | null } | null;
};

const statusColors: Record<string, string> = {
    draft: "gray",
    unpaid: "yellow",
    paid: "green",
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

function formatDate(dateString?: string | null) {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}

function calculateTotal(items: InvoiceItem[]) {
    return (items || []).reduce(
        (sum, item) => sum + item.quantity * Number(item.unitPrice),
        0
    );
}

export default function InvoiceDetail({
    invoice: initialInvoice,
}: {
    invoice: Invoice;
}) {
    const router = useTransitionRouter();
    const nextRouter = useRouter();
    const { handleLimitError } = useSubscriptionLimits();
    const [invoice, setInvoice] = useState(initialInvoice);
    const [sending, setSending] = useState(false);
    const [editOpened, { open: openEdit, close: closeEdit }] = useDisclosure(false);

    const invNum = formatInvoiceNumber(invoice.id);
    const hasCustomerEmail = !!invoice.customer?.email?.trim();
    const isDraft = invoice.status === "draft";
    const canSend = isDraft || invoice.status === "unpaid";

    const handleSend = async () => {
        if (!hasCustomerEmail || sending || !canSend) return;
        setSending(true);
        try {
            await fetchJSON(`/api/invoices/${invoice.id}/send`, {
                method: "POST",
            });
            notifications.show({
                title: "Invoice sent",
                message: `Invoice sent to ${invoice.customer?.email}`,
                color: "green",
            });
            nextRouter.refresh();
            setInvoice((prev) => ({ ...prev, status: "unpaid" }));
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
            setSending(false);
        }
    };

    const handleSaved = (updated: Invoice) => {
        setInvoice(updated);
        closeEdit();
        nextRouter.refresh();
    };

    return (
        <>
            <Group justify="space-between" align="center">
                <Group gap="sm">
                    <ActionIcon
                        variant="subtle"
                        size="lg"
                        onClick={() => router.back()}
                    >
                        <IconArrowLeft size={20} />
                    </ActionIcon>
                    <Title order={2}>{invNum}</Title>
                    <Badge
                        color={statusColors[invoice.status] ?? "gray"}
                        variant="light"
                        size="lg"
                    >
                        {invoice.status}
                    </Badge>
                </Group>
                <Group gap="xs">
                    <Button
                        variant="light"
                        component="a"
                        href={`/api/invoices/${invoice.id}/pdf`}
                        target="_blank"
                        rel="noopener noreferrer"
                        leftSection={<IconFileDownload size={16} />}
                    >
                        Download PDF
                    </Button>
                    {canSend && (
                        <Button
                            variant="light"
                            leftSection={<IconMail size={16} />}
                            onClick={handleSend}
                            loading={sending}
                            disabled={!hasCustomerEmail}
                            title={
                                !hasCustomerEmail
                                    ? "Add an email to this customer to send the invoice"
                                    : "Send invoice by email"
                            }
                        >
                            Send
                        </Button>
                    )}
                    {isDraft && (
                        <Button
                            variant="light"
                            leftSection={<IconPencil size={16} />}
                            onClick={openEdit}
                        >
                            Edit
                        </Button>
                    )}
                </Group>
            </Group>

            <Card withBorder>
                <Stack gap="md">
                    <Title order={4}>Invoice details</Title>
                    <Group grow>
                        <Stack gap="xs">
                            <Text size="sm" fw={500} c="dimmed">
                                Customer
                            </Text>
                            <Anchor
                                component={Link}
                                href={`/customers/${invoice.customer?.id}`}
                            >
                                {invoice.customer?.name ?? "—"}
                            </Anchor>
                        </Stack>
                        <Stack gap="xs">
                            <Text size="sm" fw={500} c="dimmed">
                                Due date
                            </Text>
                            <Text>{formatDate(invoice.dueDate)}</Text>
                        </Stack>
                        <Stack gap="xs">
                            <Text size="sm" fw={500} c="dimmed">
                                Total
                            </Text>
                            <Text size="lg" fw={600} c="green">
                                {formatCurrency(calculateTotal(invoice.items))}
                            </Text>
                        </Stack>
                    </Group>
                    {invoice.customer?.email && (
                        <Stack gap="xs">
                            <Text size="sm" fw={500} c="dimmed">
                                Customer email
                            </Text>
                            <Text>{invoice.customer.email}</Text>
                        </Stack>
                    )}
                    {invoice.job && (
                        <Stack gap="xs">
                            <Text size="sm" fw={500} c="dimmed">
                                Related job
                            </Text>
                            <Anchor
                                component={Link}
                                href={`/jobs/${invoice.job.id}`}
                                fw={500}
                            >
                                {invoice.job.title}
                            </Anchor>
                        </Stack>
                    )}
                </Stack>
            </Card>

            <Card withBorder>
                <Stack gap="md">
                    <Title order={4}>Line items</Title>
                    <Table withRowBorders={false}>
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th>Description</Table.Th>
                                <Table.Th>Qty</Table.Th>
                                <Table.Th>Unit price</Table.Th>
                                <Table.Th>Amount</Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {invoice.items.map((item) => (
                                <Table.Tr key={item.id}>
                                    <Table.Td>
                                        {item.description ?? "Item"}
                                    </Table.Td>
                                    <Table.Td>{item.quantity}</Table.Td>
                                    <Table.Td>
                                        {formatCurrency(Number(item.unitPrice))}
                                    </Table.Td>
                                    <Table.Td>
                                        {formatCurrency(
                                            item.quantity * Number(item.unitPrice)
                                        )}
                                    </Table.Td>
                                </Table.Tr>
                            ))}
                        </Table.Tbody>
                    </Table>
                </Stack>
            </Card>

            <InvoiceEditModal
                invoice={invoice}
                opened={editOpened}
                onClose={closeEdit}
                onSaved={handleSaved}
            />
        </>
    );
}
