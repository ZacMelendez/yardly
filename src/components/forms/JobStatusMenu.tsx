"use client";

import { Job } from "@/lib/atoms";
import {
    Menu,
    Badge,
    Loader,
    Modal,
    Text,
    Button,
    Group,
    Stack,
} from "@mantine/core";
import { IconChevronDown } from "@tabler/icons-react";
import { fetchJSON } from "@/lib/fetchJson";
import { useState } from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";
import { useSubscriptionLimits } from "@/hooks/useSubscriptionLimits";
import {
    calculateNextOccurrence,
    shouldCreateNextRecurringJob,
} from "@/lib/utils";

export const statusOptions = [
    { value: "scheduled", label: "Scheduled" },
    { value: "in_progress", label: "In Progress" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
];

export const statusColors: Record<string, string> = {
    scheduled: "blue",
    in_progress: "yellow",
    completed: "green",
    cancelled: "red",
};

export default function JobStatusMenu({
    job,
    fetchAllJobs = false,
    refetchQueryKeys,
}: {
    job: Job;
    fetchAllJobs?: boolean;
    refetchQueryKeys?: Array<Array<string | number>>;
}) {
    const [showRecurringModal, setShowRecurringModal] = useState(false);
    const [pendingStatus, setPendingStatus] = useState<string | null>(null);
    const queryClient = useQueryClient();
    const { handleLimitError } = useSubscriptionLimits();

    const updateStatusMutation = useMutation({
        mutationFn: (
            status: "scheduled" | "in_progress" | "completed" | "cancelled"
        ) =>
            fetchJSON<Job>(`/api/jobs/${job.id}`, {
                method: "PATCH",
                body: JSON.stringify({ status }),
            }),
        onMutate: async (
            newStatus: "scheduled" | "in_progress" | "completed" | "cancelled"
        ) => {
            // Cancel any outgoing refetches for all relevant queries
            const queriesToCancel = [["jobs"], ...(refetchQueryKeys || [])];

            await Promise.all(
                queriesToCancel.map((queryKey) =>
                    queryClient.cancelQueries({ queryKey })
                )
            );

            // Snapshot previous values for all relevant queries
            const previousData: Record<string, any> = {};

            // Snapshot jobs query if needed
            if (fetchAllJobs) {
                previousData.jobs = queryClient.getQueryData(["jobs"]);
            }

            // Snapshot refetch query keys
            if (refetchQueryKeys) {
                refetchQueryKeys.forEach((queryKey) => {
                    const key = queryKey.join("-");
                    previousData[key] = queryClient.getQueryData(queryKey);
                });
            }

            // Optimistically update all relevant queries
            if (fetchAllJobs) {
                queryClient.setQueryData<Job[]>(
                    ["jobs"],
                    (old) =>
                        old?.map((j) =>
                            j.id === job.id ? { ...j, status: newStatus } : j
                        ) || []
                );
            }

            if (refetchQueryKeys) {
                refetchQueryKeys.forEach((queryKey) => {
                    queryClient.setQueryData<Job[]>(
                        queryKey,
                        (old) =>
                            old?.map((j) =>
                                j.id === job.id
                                    ? { ...j, status: newStatus }
                                    : j
                            ) || []
                    );
                });
            }

            return { previousData };
        },
        onError: (err, newStatus, context) => {
            // Rollback all optimistic updates
            if (context?.previousData) {
                Object.entries(context.previousData).forEach(([key, data]) => {
                    if (key === "jobs") {
                        queryClient.setQueryData(["jobs"], data);
                    } else {
                        const queryKey = key.split("-");
                        queryClient.setQueryData(queryKey, data);
                    }
                });
            }

            if (!handleLimitError(err)) {
                notifications.show({
                    title: "Error",
                    message: "Failed to update job status",
                    color: "red",
                });
            }
        },
        onSuccess: () => {
            // Invalidate queries to ensure consistency
            if (fetchAllJobs) {
                queryClient.invalidateQueries({ queryKey: ["jobs"] });
            }
            if (refetchQueryKeys) {
                refetchQueryKeys.forEach((queryKey) => {
                    queryClient.invalidateQueries({ queryKey });
                });
            }
        },
    });

    const handleUpdateStatus = async (status: string) => {
        if (shouldCreateNextRecurringJob(job, status)) {
            setPendingStatus(status);
            setShowRecurringModal(true);
            return;
        }

        try {
            await updateStatusMutation.mutateAsync(
                status as
                    | "scheduled"
                    | "in_progress"
                    | "completed"
                    | "cancelled"
            );
        } catch (error) {
            console.error(error);
        }
    };

    const updateJobStatus = async (status: string) => {
        try {
            await updateStatusMutation.mutateAsync(
                status as
                    | "scheduled"
                    | "in_progress"
                    | "completed"
                    | "cancelled"
            );
        } catch (error) {
            console.error(error);
        }
    };

    const handleCreateNextRecurringJob = async () => {
        if (!pendingStatus || !job.recurrenceRule) return;

        try {
            await updateJobStatus(pendingStatus);

            const currentDate = job.date ? new Date(job.date) : new Date();
            const nextDate = calculateNextOccurrence(
                currentDate,
                job.recurrenceRule
            );

            const customerId = job.customer?.id;
            if (!customerId) {
                throw new Error("Customer ID not found for recurring job");
            }

            await fetchJSON<Job>(`/api/jobs`, {
                method: "POST",
                body: JSON.stringify({
                    customerId: customerId,
                    title: job.title,
                    date: nextDate.toISOString(),
                    status: "scheduled",
                    isRecurring: true,
                    recurrenceRule: job.recurrenceRule,
                    parentJobId: job.id,
                    estimateId: job.estimateId,
                }),
            });

            if (fetchAllJobs) {
                await queryClient.invalidateQueries({ queryKey: ["jobs"] });
            }
        } catch (error) {
            console.error("Error creating next recurring job:", error);
            notifications.show({
                title: "Error",
                message: "Failed to create next recurring job",
                color: "red",
            });
        } finally {
            setShowRecurringModal(false);
            setPendingStatus(null);
        }
    };

    const handleSkipRecurringJob = async () => {
        if (!pendingStatus) return;

        await updateJobStatus(pendingStatus);
        setShowRecurringModal(false);
        setPendingStatus(null);
    };

    const getRecurringJobDescription = () => {
        if (!job.recurrenceRule) return "";

        const { frequency, interval } = job.recurrenceRule;
        const currentDate = job.date ? new Date(job.date) : new Date();
        const nextDate = calculateNextOccurrence(
            currentDate,
            job.recurrenceRule
        );

        let frequencyText = "";
        switch (frequency) {
            case "DAILY":
                frequencyText = `every ${interval} day${
                    interval !== 1 ? "s" : ""
                }`;
                break;
            case "WEEKLY":
                frequencyText = `every ${interval} week${
                    interval !== 1 ? "s" : ""
                }`;
                break;
            case "MONTHLY":
                frequencyText = `every ${interval} month${
                    interval !== 1 ? "s" : ""
                }`;
                break;
            case "YEARLY":
                frequencyText = `every ${interval} year${
                    interval !== 1 ? "s" : ""
                }`;
                break;
        }

        return `This job is set to repeat ${frequencyText}. The next occurrence would be scheduled for ${nextDate.toLocaleDateString()}.`;
    };

    return (
        <>
            <Menu shadow="md" width={200}>
                <Menu.Target>
                    <Badge
                        color={statusColors[job.status]}
                        style={{ cursor: "pointer" }}
                        variant="light"
                        size="md"
                        rightSection={
                            updateStatusMutation.isPending ? (
                                <Loader size={12} />
                            ) : (
                                <IconChevronDown size={16} />
                            )
                        }
                    >
                        {statusOptions.find((opt) => opt.value === job.status)
                            ?.label || job.status}
                    </Badge>
                </Menu.Target>

                <Menu.Dropdown>
                    {statusOptions.map((option) => (
                        <Menu.Item
                            key={option.value}
                            onClick={() => handleUpdateStatus(option.value)}
                        >
                            {option.label}
                        </Menu.Item>
                    ))}
                </Menu.Dropdown>
            </Menu>

            <Modal
                opened={showRecurringModal}
                onClose={() => setShowRecurringModal(false)}
                title="Schedule Next Recurring Job?"
                centered
            >
                <Stack gap="md">
                    <Text size="sm">{getRecurringJobDescription()}</Text>

                    <Text size="sm" c="dimmed">
                        Would you like to automatically schedule the next
                        occurrence of this job?
                    </Text>

                    <Group justify="flex-end" gap="sm">
                        <Button
                            variant="outline"
                            onClick={handleSkipRecurringJob}
                            disabled={updateStatusMutation.isPending}
                        >
                            Skip
                        </Button>
                        <Button
                            onClick={handleCreateNextRecurringJob}
                            loading={updateStatusMutation.isPending}
                        >
                            Schedule Next Job
                        </Button>
                    </Group>
                </Stack>
            </Modal>
        </>
    );
}
