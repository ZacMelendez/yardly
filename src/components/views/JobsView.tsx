"use client";
import { useAtom } from "jotai";
import { useEffect, useMemo, useState } from "react";
import { ActionIcon, Text, Group, Box } from "@mantine/core";
import { type MRT_ColumnDef } from "mantine-react-table";
import JobsClient from "@/components/forms/JobsClient";
import { deleteJobMutationAtom, jobsAtom, type Job } from "@/lib/atoms";
import JobStatusMenu from "../forms/JobStatusMenu";
import DataTable from "@/components/ui/DataTable";
import { IconPencil, IconTrash } from "@tabler/icons-react";
import { modals } from "@mantine/modals";
import { useQueryClient } from "@tanstack/react-query";
import { Anchor } from "@mantine/core";
import { Link } from "next-view-transitions";
import { AddToCalendarMenu } from "../ui/AddToCalendar";

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

export default function JobsView() {
    const [jobsResult] = useAtom(jobsAtom);
    const [deleteJobMutation] = useAtom(deleteJobMutationAtom);

    const [jobs, setJobs] = useState<Job[] | undefined>(undefined);
    const [isPending, setIsPending] = useState(true);
    const [isError, setIsError] = useState(false);

    const queryClient = useQueryClient();
    const columns = useMemo<MRT_ColumnDef<Job>[]>(
        () => [
            {
                accessorKey: "title",
                header: "Title",
                Cell: ({ row }) => (
                    <Anchor
                        href={`/jobs/${row.original.id}`}
                        component={Link}
                        fw={500}
                    >
                        {row.original.title}
                    </Anchor>
                ),
            },
            {
                accessorKey: "customer",
                header: "Customer",
                Cell: ({ row }) => {
                    return row.original.customer ? (
                        <div>
                            <Anchor
                                href={`/customers/${row.original.customer.id}`}
                                component={Link}
                            >
                                {row.original.customer.name}
                            </Anchor>
                            {row.original.customer?.email && (
                                <div
                                    style={{
                                        fontSize: "0.875rem",
                                        color: "#6b7280",
                                    }}
                                >
                                    {row.original.customer.email}
                                </div>
                            )}
                        </div>
                    ) : (
                        "N/A"
                    );
                },
            },
            {
                accessorKey: "date",
                header: "Scheduled Date",
                Cell: ({ cell }) =>
                    formatDate(
                        cell.getValue<string | Date | null | undefined>()
                    ),
            },
            {
                accessorKey: "status",
                header: "Status",
                Cell: ({ row }) => (
                    <JobStatusMenu job={row.original} fetchAllJobs />
                ),
            },
            {
                accessorKey: "createdAt",
                header: "Created",
                Cell: ({ cell }) =>
                    new Date(
                        cell.getValue<string | Date>()
                    ).toLocaleDateString(),
            },
            {
                id: "actions",
                header: "Actions",
                Cell: ({ row }) => (
                    <Group gap="xs">
                        <JobsClient
                            job={row.original}
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
                                    title: "Delete Job?",
                                    children: (
                                        <Text size="sm">
                                            Are you sure you want to delete this
                                            job?
                                        </Text>
                                    ),
                                    labels: {
                                        confirm: "Delete",
                                        cancel: "Cancel",
                                    },
                                    confirmProps: {
                                        color: "red",
                                        loading: deleteJobMutation.isPending,
                                    },
                                    onConfirm: async () => {
                                        try {
                                            await deleteJobMutation.mutateAsync(
                                                row.original.id
                                            );
                                            await queryClient.invalidateQueries(
                                                {
                                                    queryKey: ["jobs"],
                                                }
                                            );
                                        } catch (error) {
                                            console.error(error);
                                        }
                                    },
                                });
                            }}
                            color="red"
                        >
                            <IconTrash size={16} />
                        </ActionIcon>
                        <AddToCalendarMenu job={row.original} />
                    </Group>
                ),
            },
        ],
        [deleteJobMutation, queryClient]
    );

    useEffect(() => {
        if (jobsResult) {
            setJobs(jobsResult.data);
            setIsPending(jobsResult.isPending || false);
            setIsError(jobsResult.isError || false);
        }
    }, [jobsResult]);

    return (
        <Box
            style={{ height: "100%", display: "flex", flexDirection: "column" }}
        >
            <DataTable<Job>
                data={jobs}
                columns={columns}
                isLoading={isPending}
                isError={isError}
                loadingText="Loading jobs..."
                errorText="Error loading jobs"
                emptyStateText="No jobs found. Create your first job to get started."
                tableTitle="Jobs"
                toolbarActions={<JobsClient />}
            />
        </Box>
    );
}
