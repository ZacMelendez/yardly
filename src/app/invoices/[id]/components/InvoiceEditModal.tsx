"use client";

import { useState, useEffect } from "react";
import {
    Modal,
    Stack,
    TextInput,
    NumberInput,
    Group,
    Button,
    Table,
    ActionIcon,
    Text,
} from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { fetchJSON } from "@/lib/fetchJson";

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
    items: InvoiceItem[];
};

interface InvoiceEditModalProps {
    invoice: Invoice;
    opened: boolean;
    onClose: () => void;
    onSaved: (updated: Invoice) => void;
}

function toISODateString(d: Date | null): string {
    if (!d) return "";
    return d.toISOString().slice(0, 10);
}

export default function InvoiceEditModal({
    invoice,
    opened,
    onClose,
    onSaved,
}: InvoiceEditModalProps) {
    const [dueDate, setDueDate] = useState(
        invoice.dueDate ? toISODateString(new Date(invoice.dueDate)) : ""
    );
    const [items, setItems] = useState<
        { id: string; description: string; quantity: number; unitPrice: number }[]
    >(
        invoice.items.map((i) => ({
            id: i.id,
            description: i.description ?? "",
            quantity: i.quantity,
            unitPrice: Number(i.unitPrice),
        }))
    );
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (opened) {
            setDueDate(
                invoice.dueDate
                    ? toISODateString(new Date(invoice.dueDate))
                    : ""
            );
            setItems(
                invoice.items.map((i) => ({
                    id: i.id,
                    description: i.description ?? "",
                    quantity: i.quantity,
                    unitPrice: Number(i.unitPrice),
                }))
            );
        }
    }, [opened, invoice.dueDate, invoice.items]);

    const addRow = () => {
        setItems((prev) => [
            ...prev,
            {
                id: `new-${Date.now()}`,
                description: "",
                quantity: 1,
                unitPrice: 0,
            },
        ]);
    };

    const removeRow = (index: number) => {
        setItems((prev) => prev.filter((_, i) => i !== index));
    };

    const updateItem = (
        index: number,
        field: "description" | "quantity" | "unitPrice",
        value: string | number
    ) => {
        setItems((prev) => {
            const next = [...prev];
            if (field === "description") next[index].description = value as string;
            else if (field === "quantity") next[index].quantity = value as number;
            else next[index].unitPrice = value as number;
            return next;
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (items.length === 0) {
            notifications.show({
                title: "Error",
                message: "Add at least one line item",
                color: "red",
            });
            return;
        }
        setSaving(true);
        try {
            const payload = {
                dueDate: dueDate || null,
                items: items.map((i) => ({
                    description: i.description || "Item",
                    quantity: i.quantity,
                    unitPrice: i.unitPrice,
                })),
            };
            const updated = await fetchJSON<Invoice>(
                `/api/invoices/${invoice.id}`,
                {
                    method: "PATCH",
                    body: JSON.stringify(payload),
                }
            );
            notifications.show({
                title: "Saved",
                message: "Invoice updated",
                color: "green",
            });
            onSaved(updated);
        } catch (err) {
            notifications.show({
                title: "Error",
                message:
                    err instanceof Error ? err.message : "Failed to update invoice",
                color: "red",
            });
        } finally {
            setSaving(false);
        }
    };

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title="Edit invoice"
            size="lg"
            centered
        >
            <form onSubmit={handleSubmit}>
                <Stack gap="md">
                    <TextInput
                        type="date"
                        label="Due date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                    />

                    <Text fw={500} size="sm" c="dimmed">
                        Line items
                    </Text>
                    <Table withRowBorders>
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th>Description</Table.Th>
                                <Table.Th>Qty</Table.Th>
                                <Table.Th>Unit price</Table.Th>
                                <Table.Th></Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {items.map((item, index) => (
                                <Table.Tr key={item.id}>
                                    <Table.Td>
                                        <TextInput
                                            size="xs"
                                            value={item.description}
                                            onChange={(e) =>
                                                updateItem(
                                                    index,
                                                    "description",
                                                    e.target.value
                                                )}
                                            placeholder="Description"
                                        />
                                    </Table.Td>
                                    <Table.Td>
                                        <NumberInput
                                            size="xs"
                                            min={1}
                                            value={item.quantity}
                                            onChange={(v) =>
                                                updateItem(
                                                    index,
                                                    "quantity",
                                                    Number(v) || 1
                                                )}
                                        />
                                    </Table.Td>
                                    <Table.Td>
                                        <NumberInput
                                            size="xs"
                                            min={0}
                                            decimalScale={2}
                                            value={item.unitPrice}
                                            onChange={(v) =>
                                                updateItem(
                                                    index,
                                                    "unitPrice",
                                                    Number(v) || 0
                                                )}
                                        />
                                    </Table.Td>
                                    <Table.Td>
                                        <ActionIcon
                                            variant="subtle"
                                            color="red"
                                            onClick={() => removeRow(index)}
                                            disabled={items.length <= 1}
                                        >
                                            <IconTrash size={16} />
                                        </ActionIcon>
                                    </Table.Td>
                                </Table.Tr>
                            ))}
                        </Table.Tbody>
                    </Table>
                    <Button variant="light" size="xs" onClick={addRow}>
                        Add line
                    </Button>

                    <Group justify="flex-end" mt="md">
                        <Button variant="default" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" loading={saving}>
                            Save
                        </Button>
                    </Group>
                </Stack>
            </form>
        </Modal>
    );
}
