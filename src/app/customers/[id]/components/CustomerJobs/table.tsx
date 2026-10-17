"use client";
import JobsClient from "@/components/forms/JobsClient";
import JobStatusMenu from "@/components/forms/JobStatusMenu";
import { initialCustomerDetailAtom } from "@/lib/atoms";
import { Group, Stack, Title, Text, Table, ActionIcon } from "@mantine/core";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { Job } from "@/lib/atoms";
import { IconPencil, IconTrash } from "@tabler/icons-react";
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { useAtomValue } from "jotai";
import { useCallback } from "react";
import { fetchJSON } from "@/lib/fetchJson";
import { useSubscriptionLimits } from "@/hooks/useSubscriptionLimits";

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

export const CustomerJobsTable = ({ jobs: initialJobs }: { jobs: Job[] }) => {
    const customer = useAtomValue(initialCustomerDetailAtom);
    const queryClient = useQueryClient();
    const { handleLimitError } = useSubscriptionLimits();

    const { data: jobs } = useQuery({
        queryKey: ["customer", "jobs", customer.id],
        queryFn: () => fetchJSON<Job[]>(`/api/jobs/customer/${customer.id}`),
        enabled: !!customer.id,
        initialData: initialJobs,
    });

    const deleteJobMutation = useMutation({
        mutationFn: (id: string) =>
            fetchJSON<Job>(`/api/jobs/${id}`, {
                method: "DELETE",
            }),
        onMutate: async (jobId) => {
            // Cancel any outgoing refetches
            await queryClient.cancelQueries({
                queryKey: ["customer", customer.id],
            });

            // Snapshot the previous value
            const previousCustomer = queryClient.getQueryData([
                "customer",
                customer.id,
            ]);

            // Optimistically update to the new value
            queryClient.setQueryData(["customer", customer.id], (old: any) => {
                if (!old) return old;
                return {
                    ...old,
                    jobs:
                        old.jobs?.filter((job: Job) => job.id !== jobId) || [],
                };
            });

            // Return a context object with the snapshotted value
            return { previousCustomer };
        },
        onError: (err, jobId, context) => {
            // If the mutation fails, use the context returned from onMutate to roll back
            if (context?.previousCustomer) {
                queryClient.setQueryData(
                    ["customer", customer.id],
                    context.previousCustomer
                );
            }
            if (!handleLimitError(err)) {
                notifications.show({
                    title: "Error",
                    message: "Failed to delete job",
                    color: "red",
                });
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["customer", "jobs", customer.id],
            });
        },
    });

    const handleDeleteJob = useCallback(
        async (id: string) => {
            try {
                await deleteJobMutation.mutateAsync(id);
            } catch (error) {
                console.error(error);
            }
        },
        [deleteJobMutation]
    );

    return (
        <Stack gap="md">
            <Group justify="space-between" align="center">
                <Title order={4}>Jobs ({jobs.length})</Title>
                <JobsClient
                    customerId={customer.id}
                    refetchQueryKeys={[["customer", "jobs", customer.id]]}
                />
            </Group>

            {jobs.length === 0 ? (
                <Text c="dimmed" ta="center" py="md">
                    No jobs found for this customer.
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
                        style={{ minWidth: "600px" }}
                    >
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th>Title</Table.Th>
                                <Table.Th>Scheduled Date</Table.Th>
                                <Table.Th>Status</Table.Th>
                                <Table.Th>Created</Table.Th>
                                <Table.Th></Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {jobs.map((job) => (
                                <Table.Tr key={job.id}>
                                    <Table.Td>
                                        <Text fw={500}>{job.title}</Text>
                                    </Table.Td>
                                    <Table.Td>{formatDate(job.date)}</Table.Td>
                                    <Table.Td>
                                        <JobStatusMenu
                                            job={job}
                                            refetchQueryKeys={[
                                                [
                                                    "customer",
                                                    "jobs",
                                                    customer.id,
                                                ],
                                            ]}
                                        />
                                    </Table.Td>
                                    <Table.Td>
                                        {new Date(
                                            job.createdAt
                                        ).toLocaleDateString()}
                                    </Table.Td>
                                    <Table.Td>
                                        <Group gap="xs">
                                            <JobsClient
                                                customerId={customer.id}
                                                refetchQueryKeys={[
                                                    [
                                                        "customer",
                                                        "jobs",
                                                        customer.id,
                                                    ],
                                                ]}
                                                job={job}
                                                trigger={
                                                    <ActionIcon variant="light">
                                                        <IconPencil size={16} />
                                                    </ActionIcon>
                                                }
                                            />
                                            <ActionIcon
                                                variant="light"
                                                onClick={() => {
                                                    modals.openConfirmModal({
                                                        title: "Delete Job",
                                                        children: (
                                                            <Text size="sm">
                                                                Are you sure you
                                                                want to delete
                                                                this job? This
                                                                will delete all
                                                                items associated
                                                                with this job.
                                                            </Text>
                                                        ),
                                                        labels: {
                                                            confirm: "Delete",
                                                            cancel: "Cancel",
                                                        },
                                                        onConfirm: () =>
                                                            handleDeleteJob(
                                                                job.id
                                                            ),
                                                    });
                                                }}
                                                color="red"
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
            )}
        </Stack>
    );
};
