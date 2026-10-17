"use client";
import React from "react";
import { useAtomValue } from "jotai";
import {
    Container,
    Title,
    Stack,
    Group,
    Button,
    Text,
    Card,
    Divider,
    ActionIcon,
    Badge,
    Anchor,
    rem,
} from "@mantine/core";
import { initialJobDetailAtom } from "@/lib/atoms";
import { IconArrowLeft } from "@tabler/icons-react";
import { Link, useTransitionRouter } from "next-view-transitions";
import JobsClient from "@/components/forms/JobsClient";

function getEstimateStatusColor(status: string) {
    switch (status.toLowerCase()) {
        case "accepted":
            return "green";
        case "rejected":
            return "red";
        case "pending":
            return "yellow";
        default:
            return "gray";
    }
}

function getJobStatusColor(status: string) {
    switch (status.toLowerCase()) {
        case "scheduled":
            return "blue";
        case "in_progress":
            return "yellow";
        case "completed":
            return "green";
        case "cancelled":
            return "red";
        default:
            return "gray";
    }
}

function formatDate(dateString?: string | Date | null) {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function formatCurrency(amount: number) {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
    }).format(amount);
}

function calculateEstimateTotal(items: any[]) {
    return items.reduce(
        (sum, item) => sum + item.quantity * Number(item.unitPrice),
        0
    );
}

export default function JobDetailPage() {
    const router = useTransitionRouter();

    const job = useAtomValue(initialJobDetailAtom)!;

    return (
        <Container size="lg" py="md">
            <Stack gap="lg">
                <Group justify="space-between" align="center">
                    <Group gap="sm">
                        <ActionIcon
                            variant="subtle"
                            size="lg"
                            onClick={() => router.back()}
                        >
                            <IconArrowLeft size={20} />
                        </ActionIcon>
                        <Title order={2}>{job.title}</Title>
                    </Group>
                    <JobsClient
                        job={job}
                        trigger={
                            <Button variant="light" size="sm">
                                Edit Job
                            </Button>
                        }
                    />
                </Group>

                <Card withBorder>
                    <Stack gap="md">
                        <Title order={3}>Job Information</Title>
                        <Group grow>
                            <Stack gap="xs">
                                <Text size="sm" fw={500} c="dimmed">
                                    Title
                                </Text>
                                <Text>{job.title}</Text>
                            </Stack>
                            <Stack gap="xs">
                                <Text size="sm" fw={500} c="dimmed">
                                    Date
                                </Text>
                                <Text>{formatDate(job.date) || "—"}</Text>
                            </Stack>
                        </Group>
                        <Group grow>
                            <Stack gap="xs">
                                <Text size="sm" fw={500} c="dimmed">
                                    Status
                                </Text>
                                <Badge
                                    color={getJobStatusColor(job.status)}
                                    variant="light"
                                    size="lg"
                                >
                                    {job.status.toUpperCase()}
                                </Badge>
                            </Stack>
                            <Stack gap="xs">
                                <Text size="sm" fw={500} c="dimmed">
                                    Created
                                </Text>
                                <Text>{formatDate(job.createdAt) || "—"}</Text>
                            </Stack>
                        </Group>
                        {"invoices" in job &&
                            Array.isArray(job.invoices) &&
                            job.invoices.length > 0 && (
                                <Stack gap="xs">
                                    <Text size="sm" fw={500} c="dimmed">
                                        Invoice
                                    </Text>
                                    <Anchor
                                        component={Link}
                                        href={`/invoices/${(job as { invoices: { id: string; status: string }[] }).invoices[0].id}`}
                                        fw={500}
                                    >
                                        View invoice (
                                        {(job as { invoices: { status: string }[] }).invoices[0].status}
                                        )
                                    </Anchor>
                                </Stack>
                            )}
                    </Stack>
                </Card>

                {job.estimate && (
                    <>
                        <Divider />
                        <Card withBorder>
                            <Stack gap="md">
                                <Title order={4}>Estimate Details</Title>

                                <Group justify="space-between" align="center">
                                    <Anchor
                                        component={Link}
                                        href={`/estimates/${job.estimate.id}`}
                                        fw={500}
                                        fs={rem(24)}
                                    >
                                        {job.estimate.title}
                                    </Anchor>
                                    <Badge
                                        color={getEstimateStatusColor(
                                            job.estimate.status
                                        )}
                                        variant="light"
                                        size="lg"
                                    >
                                        {job.estimate.status.toUpperCase()}
                                    </Badge>
                                </Group>

                                {/* Estimate Summary */}
                                <Group grow>
                                    <Stack gap="xs">
                                        <Text size="sm" fw={500} c="dimmed">
                                            Created
                                        </Text>
                                        <Text>
                                            {formatDate(job.estimate.createdAt)}
                                        </Text>
                                    </Stack>
                                    <Stack gap="xs">
                                        <Text size="sm" fw={500} c="dimmed">
                                            Total Amount
                                        </Text>
                                        <Text size="lg" fw={600} c="green">
                                            {formatCurrency(
                                                calculateEstimateTotal(
                                                    job.estimate.items || []
                                                )
                                            )}
                                        </Text>
                                    </Stack>
                                </Group>

                                {/* Customer Information */}
                                {job.customer && (
                                    <Group grow>
                                        <Stack gap="xs">
                                            <Text size="sm" fw={500} c="dimmed">
                                                Customer
                                            </Text>
                                            <Text>{job.customer.name}</Text>
                                        </Stack>
                                        {job.customer.email && (
                                            <Stack gap="xs">
                                                <Text
                                                    size="sm"
                                                    fw={500}
                                                    c="dimmed"
                                                >
                                                    Email
                                                </Text>
                                                <Text>
                                                    {job.customer.email}
                                                </Text>
                                            </Stack>
                                        )}
                                    </Group>
                                )}

                                {/* Estimate Items */}
                                {job.estimate.items &&
                                    job.estimate.items.length > 0 && (
                                        <>
                                            <Divider />
                                            <Stack gap="md">
                                                <Title order={5}>
                                                    Items (
                                                    {job.estimate.items.length})
                                                </Title>
                                                <Stack gap="sm">
                                                    {job.estimate.items.map(
                                                        (item) => (
                                                            <Card
                                                                key={item.id}
                                                                withBorder
                                                                p="md"
                                                            >
                                                                <Group justify="space-between">
                                                                    <div>
                                                                        <Text
                                                                            fw={
                                                                                500
                                                                            }
                                                                        >
                                                                            {item
                                                                                .service
                                                                                ?.name ||
                                                                                item.description}
                                                                        </Text>
                                                                        {item
                                                                            .service
                                                                            ?.category && (
                                                                            <Text
                                                                                size="sm"
                                                                                c="dimmed"
                                                                            >
                                                                                {
                                                                                    item
                                                                                        .service
                                                                                        .category
                                                                                }
                                                                            </Text>
                                                                        )}
                                                                    </div>
                                                                    <div
                                                                        style={{
                                                                            textAlign:
                                                                                "right",
                                                                        }}
                                                                    >
                                                                        <Text size="sm">
                                                                            {
                                                                                item.quantity
                                                                            }{" "}
                                                                            ×{" "}
                                                                            {formatCurrency(
                                                                                item.unitPrice
                                                                            )}
                                                                        </Text>
                                                                        <Text
                                                                            fw={
                                                                                500
                                                                            }
                                                                        >
                                                                            {formatCurrency(
                                                                                item.quantity *
                                                                                    item.unitPrice
                                                                            )}
                                                                        </Text>
                                                                    </div>
                                                                </Group>
                                                            </Card>
                                                        )
                                                    )}
                                                </Stack>
                                            </Stack>
                                        </>
                                    )}
                            </Stack>
                        </Card>
                    </>
                )}
            </Stack>
        </Container>
    );
}
