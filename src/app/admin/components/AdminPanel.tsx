"use client";

import { useState, useEffect } from "react";
import {
    Button,
    Table,
    Select,
    TextInput,
    Modal,
    Group,
    Stack,
    Text,
    Badge,
    ActionIcon,
    LoadingOverlay,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { IconEdit, IconTrash, IconPlus } from "@tabler/icons-react";

interface User {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
}

interface Subscription {
    id: string;
    userId: string;
    planId: string;
    planName: string;
    status: string;
    currentPeriodStart: string;
    currentPeriodEnd: string;
    billingCycle: string;
    amount: string;
    maxCustomers: number | null;
    maxJobs: number | null;
    maxInvoicesPerMonth: number | null;
    user: User;
}

const PLAN_OPTIONS = [
    { value: "free", label: "Free Plan" },
    { value: "basic", label: "Basic Plan" },
    { value: "pro", label: "Pro Plan" },
    { value: "enterprise", label: "Enterprise Plan" },
];

const STATUS_OPTIONS = [
    { value: "active", label: "Active" },
    { value: "trialing", label: "Trialing" },
    { value: "past_due", label: "Past Due" },
    { value: "cancelled", label: "Cancelled" },
    { value: "expired", label: "Expired" },
];

const BILLING_CYCLE_OPTIONS = [
    { value: "monthly", label: "Monthly" },
    { value: "yearly", label: "Yearly" },
];

export default function AdminPanel() {
    const [users, setUsers] = useState<User[]>([]);
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpened, setModalOpened] = useState(false);
    const [editingSubscription, setEditingSubscription] =
        useState<Subscription | null>(null);

    const form = useForm({
        initialValues: {
            userId: "",
            planId: "free",
            planName: "Free Plan",
            status: "active",
            billingCycle: "monthly",
            amount: "0",
            maxCustomers: "",
            maxJobs: "",
            maxInvoicesPerMonth: "",
            currentPeriodStart: new Date().toISOString().split("T")[0],
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                .toISOString()
                .split("T")[0],
        },
    });

    const fetchData = async () => {
        try {
            const [usersRes, subscriptionsRes] = await Promise.all([
                fetch("/api/admin/users"),
                fetch("/api/admin/subscriptions"),
            ]);

            if (usersRes.ok && subscriptionsRes.ok) {
                const usersData = await usersRes.json();
                const subscriptionsData = await subscriptionsRes.json();
                setUsers(usersData);
                setSubscriptions(subscriptionsData);
            }
        } catch {
            notifications.show({
                title: "Error",
                message: "Failed to fetch data",
                color: "red",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSubmit = async (values: typeof form.values) => {
        try {
            const payload = {
                ...values,
                amount: parseFloat(values.amount),
                maxCustomers: values.maxCustomers
                    ? parseInt(values.maxCustomers)
                    : null,
                maxJobs: values.maxJobs ? parseInt(values.maxJobs) : null,
                maxInvoicesPerMonth: values.maxInvoicesPerMonth
                    ? parseInt(values.maxInvoicesPerMonth)
                    : null,
            };

            const url = editingSubscription
                ? `/api/admin/subscriptions/${editingSubscription.id}`
                : "/api/admin/subscriptions";

            const method = editingSubscription ? "PUT" : "POST";

            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                setModalOpened(false);
                setEditingSubscription(null);
                form.reset();
                fetchData();
            } else {
                throw new Error("Failed to save subscription");
            }
        } catch {
            notifications.show({
                title: "Error",
                message: "Failed to save subscription",
                color: "red",
            });
        }
    };

    const handleEdit = (subscription: Subscription) => {
        setEditingSubscription(subscription);
        form.setValues({
            userId: subscription.userId,
            planId: subscription.planId,
            planName: subscription.planName,
            status: subscription.status,
            billingCycle: subscription.billingCycle,
            amount: subscription.amount.toString(),
            maxCustomers: subscription.maxCustomers?.toString() || "",
            maxJobs: subscription.maxJobs?.toString() || "",
            maxInvoicesPerMonth:
                subscription.maxInvoicesPerMonth?.toString() || "",
            currentPeriodStart: subscription.currentPeriodStart.split("T")[0],
            currentPeriodEnd: subscription.currentPeriodEnd.split("T")[0],
        });
        setModalOpened(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this subscription?"))
            return;

        try {
            const response = await fetch(`/api/admin/subscriptions/${id}`, {
                method: "DELETE",
            });

            if (response.ok) {
                fetchData();
            } else {
                throw new Error("Failed to delete subscription");
            }
        } catch {
            notifications.show({
                title: "Error",
                message: "Failed to delete subscription",
                color: "red",
            });
        }
    };

    const openCreateModal = () => {
        setEditingSubscription(null);
        form.reset();
        setModalOpened(true);
    };

    if (loading) {
        return <LoadingOverlay visible={true} />;
    }

    return (
        <div>
            <Group justify="space-between" mb="md">
                <Text size="xl" fw={600}>
                    Subscription Management
                </Text>
                <Button
                    leftSection={<IconPlus size={16} />}
                    onClick={openCreateModal}
                >
                    Create Subscription
                </Button>
            </Group>

            <div
                style={{
                    overflowX: "auto",
                    WebkitOverflowScrolling: "touch",
                }}
            >
                <Table striped highlightOnHover style={{ minWidth: "600px" }}>
                    <Table.Thead>
                        <Table.Tr>
                            <Table.Th>User</Table.Th>
                            <Table.Th>Email</Table.Th>
                            <Table.Th>Plan</Table.Th>
                            <Table.Th>Status</Table.Th>
                            <Table.Th>Billing</Table.Th>
                            <Table.Th>Amount</Table.Th>
                            <Table.Th>Period</Table.Th>
                            <Table.Th>Actions</Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                        {subscriptions.map((subscription) => (
                            <Table.Tr key={subscription.id}>
                                <Table.Td>
                                    {subscription.user?.name || "Unknown"}
                                </Table.Td>
                                <Table.Td>
                                    {subscription.user?.email || "Unknown"}
                                </Table.Td>
                                <Table.Td>{subscription.planName}</Table.Td>
                                <Table.Td>
                                    <Badge
                                        color={
                                            subscription.status === "active"
                                                ? "green"
                                                : subscription.status ===
                                                  "trialing"
                                                ? "blue"
                                                : "red"
                                        }
                                    >
                                        {subscription.status}
                                    </Badge>
                                </Table.Td>
                                <Table.Td>{subscription.billingCycle}</Table.Td>
                                <Table.Td>${subscription.amount}</Table.Td>
                                <Table.Td>
                                    {new Date(
                                        subscription.currentPeriodStart
                                    ).toLocaleDateString()}{" "}
                                    -{" "}
                                    {new Date(
                                        subscription.currentPeriodEnd
                                    ).toLocaleDateString()}
                                </Table.Td>
                                <Table.Td>
                                    <Group gap="xs">
                                        <ActionIcon
                                            variant="subtle"
                                            color="blue"
                                            onClick={() =>
                                                handleEdit(subscription)
                                            }
                                        >
                                            <IconEdit size={16} />
                                        </ActionIcon>
                                        <ActionIcon
                                            variant="subtle"
                                            color="red"
                                            onClick={() =>
                                                handleDelete(subscription.id)
                                            }
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

            <Modal
                opened={modalOpened}
                onClose={() => setModalOpened(false)}
                title={
                    editingSubscription
                        ? "Edit Subscription"
                        : "Create Subscription"
                }
                size="lg"
            >
                <form onSubmit={form.onSubmit(handleSubmit)}>
                    <Stack>
                        <Select
                            allowDeselect={false}
                            label="User"
                            placeholder="Select a user"
                            data={users.map((user) => ({
                                value: user.id,
                                label: `${user.name} (${user.email})`,
                            }))}
                            {...form.getInputProps("userId")}
                            required
                        />

                        <Select
                            allowDeselect={false}
                            label="Plan"
                            data={PLAN_OPTIONS}
                            {...form.getInputProps("planId")}
                            onChange={(value) => {
                                form.setFieldValue("planId", value || "");
                                const plan = PLAN_OPTIONS.find(
                                    (p) => p.value === value
                                );
                                form.setFieldValue(
                                    "planName",
                                    plan?.label || ""
                                );
                            }}
                            required
                        />

                        <Select
                            allowDeselect={false}
                            label="Status"
                            data={STATUS_OPTIONS}
                            {...form.getInputProps("status")}
                            required
                        />

                        <Select
                            allowDeselect={false}
                            label="Billing Cycle"
                            data={BILLING_CYCLE_OPTIONS}
                            {...form.getInputProps("billingCycle")}
                            required
                        />

                        <TextInput
                            label="Amount"
                            type="number"
                            step="0.01"
                            {...form.getInputProps("amount")}
                            required
                        />

                        <Group grow>
                            <TextInput
                                label="Max Customers"
                                type="number"
                                placeholder="Unlimited"
                                {...form.getInputProps("maxCustomers")}
                            />
                            <TextInput
                                label="Max Jobs"
                                type="number"
                                placeholder="Unlimited"
                                {...form.getInputProps("maxJobs")}
                            />
                            <TextInput
                                label="Max Monthly Invoices"
                                type="number"
                                placeholder="Unlimited"
                                {...form.getInputProps("maxInvoicesPerMonth")}
                            />
                        </Group>

                        <Group grow>
                            <TextInput
                                label="Period Start"
                                type="date"
                                {...form.getInputProps("currentPeriodStart")}
                                required
                            />
                            <TextInput
                                label="Period End"
                                type="date"
                                {...form.getInputProps("currentPeriodEnd")}
                                required
                            />
                        </Group>

                        <Group justify="flex-end" mt="md">
                            <Button
                                variant="subtle"
                                onClick={() => setModalOpened(false)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit">
                                {editingSubscription ? "Update" : "Create"}
                            </Button>
                        </Group>
                    </Stack>
                </form>
            </Modal>
        </div>
    );
}
