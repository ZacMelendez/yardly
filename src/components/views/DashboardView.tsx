"use client";
import {
    ActionIcon,
    Alert,
    Button,
    Card,
    Grid,
    Group,
    Stack,
    Text,
    Title,
} from "@mantine/core";
import { IconBuilding, IconExternalLink } from "@tabler/icons-react";
import { useTransitionRouter } from "next-view-transitions";
import { Link } from "next-view-transitions";
import UpcomingJobsMap from "@/components/ui/UpcomingJobsMap";
import { DashboardData } from "@/lib/atoms";

interface DashboardViewProps {
    data: DashboardData;
    upcomingJobs?: any[];
    showCreateCompanyPrompt?: boolean;
    showSelectCompanyPrompt?: boolean;
}

export default function DashboardView({
    data,
    upcomingJobs = [],
    showCreateCompanyPrompt = false,
    showSelectCompanyPrompt = false,
}: DashboardViewProps) {
    const router = useTransitionRouter();

    return (
        <>
            <Title order={2} mb="md">
                Dashboard
            </Title>

            {showCreateCompanyPrompt && (
                <Alert
                    mb="lg"
                    color="blue"
                    variant="light"
                    title="Create your company"
                    icon={<IconBuilding size={20} />}
                >
                    <Stack gap="sm">
                        <Text size="sm">
                            Add team members and collaborate on customers, estimates, and jobs.
                            Create a company to get started.
                        </Text>
                        <Button
                            component={Link}
                            href="/settings/company"
                            variant="light"
                            size="xs"
                            leftSection={<IconBuilding size={14} />}
                        >
                            Create company
                        </Button>
                    </Stack>
                </Alert>
            )}
            {showSelectCompanyPrompt && !showCreateCompanyPrompt && (
                <Alert
                    mb="lg"
                    color="blue"
                    variant="light"
                    title="Select a company"
                    icon={<IconBuilding size={20} />}
                >
                    <Stack gap="sm">
                        <Text size="sm">
                            Select a company from the dropdown in the header to view your dashboard.
                        </Text>
                    </Stack>
                </Alert>
            )}
            <Grid>
                <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                    <Card withBorder>
                        <Stack gap={4}>
                            <Group justify="space-between">
                                <Text fw={600}>Customers</Text>
                                <ActionIcon
                                    variant="subtle"
                                    color="gray"
                                    onClick={() => router.push("/customers")}
                                >
                                    <IconExternalLink size={16} />
                                </ActionIcon>
                            </Group>
                            <Text size="lg">{data.metrics.customers}</Text>
                        </Stack>
                    </Card>
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                    <Card withBorder>
                        <Stack gap={4}>
                            <Group justify="space-between">
                                <Text fw={600}>Estimates</Text>
                                <ActionIcon
                                    variant="subtle"
                                    color="gray"
                                    onClick={() => router.push("/estimates")}
                                >
                                    <IconExternalLink size={16} />
                                </ActionIcon>
                            </Group>
                            <Text size="lg">{data.metrics.estimates}</Text>
                        </Stack>
                    </Card>
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                    <Card withBorder>
                        <Stack gap={4}>
                            <Group justify="space-between">
                                <Text fw={600}>Unpaid Invoices</Text>
                                <ActionIcon
                                    variant="subtle"
                                    color="gray"
                                    onClick={() => router.push("/invoices")}
                                >
                                    <IconExternalLink size={16} />
                                </ActionIcon>
                            </Group>
                            <Text size="lg">{data.metrics.unpaidInvoices}</Text>
                        </Stack>
                    </Card>
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                    <Card withBorder>
                        <Stack gap={4}>
                            <Group justify="space-between">
                                <Text fw={600}>Scheduled Jobs</Text>
                                <ActionIcon
                                    variant="subtle"
                                    color="gray"
                                    onClick={() => router.push("/jobs")}
                                >
                                    <IconExternalLink size={16} />
                                </ActionIcon>
                            </Group>
                            <Text size="lg">{data.metrics.scheduledJobs}</Text>
                        </Stack>
                    </Card>
                </Grid.Col>
            </Grid>

            <Group mt="xl" align="flex-start" wrap="wrap">
                <div style={{ flex: 1, minWidth: "100%" }}>
                    <UpcomingJobsMap
                        jobs={upcomingJobs}
                        loading={false}
                        error={undefined}
                    />
                </div>
            </Group>
        </>
    );
}
