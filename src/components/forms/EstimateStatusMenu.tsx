"use client";

import { Estimate } from "@/lib/atoms";
import { Menu, Badge, Loader } from "@mantine/core";
import { IconChevronDown } from "@tabler/icons-react";
import { fetchJSON } from "@/lib/fetchJson";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";
import { useSubscriptionLimits } from "@/hooks/useSubscriptionLimits";

export const statusOptions = [
    { value: "draft", label: "Draft" },
    { value: "sent", label: "Sent" },
    { value: "accepted", label: "Accepted" },
    { value: "rejected", label: "Rejected" },
];

export const statusColors: Record<string, string> = {
    draft: "blue",
    sent: "yellow",
    accepted: "green",
    rejected: "red",
};

export default function EstimateStatusMenu({
    estimate,

    refetchQueryKeys,
}: {
    estimate: Estimate;

    refetchQueryKeys?: Array<Array<string | number>>;
}) {
    const queryClient = useQueryClient();
    const { handleLimitError } = useSubscriptionLimits();

    const updateStatusMutation = useMutation({
        mutationFn: (status: "draft" | "sent" | "accepted" | "rejected") =>
            fetchJSON<Estimate>(`/api/estimates/${estimate.id}`, {
                method: "PATCH",
                body: JSON.stringify({ status }),
            }),
        onMutate: async (
            newStatus: "draft" | "sent" | "accepted" | "rejected"
        ) => {
            // Cancel any outgoing refetches for all relevant queries
            const queriesToCancel = [
                ["estimates"],
                ...(refetchQueryKeys || []),
            ];

            await Promise.all(
                queriesToCancel.map((queryKey) =>
                    queryClient.cancelQueries({ queryKey })
                )
            );

            // Snapshot previous values for all relevant queries
            const previousData: Record<string, any> = {};

            // Snapshot refetch query keys
            if (refetchQueryKeys) {
                refetchQueryKeys.forEach((queryKey) => {
                    const key = queryKey.join("-");
                    previousData[key] = queryClient.getQueryData(queryKey);
                });
            }

            if (refetchQueryKeys) {
                refetchQueryKeys.forEach((queryKey) => {
                    queryClient.setQueryData<Estimate[]>(
                        queryKey,
                        (old) =>
                            old?.map((est) =>
                                est.id === estimate.id
                                    ? { ...est, status: newStatus }
                                    : est
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
                    if (key === "estimates") {
                        queryClient.setQueryData(["estimates"], data);
                    } else {
                        const queryKey = key.split("-");
                        queryClient.setQueryData(queryKey, data);
                    }
                });
            }

            if (!handleLimitError(err)) {
                notifications.show({
                    title: "Error",
                    message: "Failed to update estimate status",
                    color: "red",
                });
            }
        },
        onSuccess: () => {
            if (refetchQueryKeys) {
                refetchQueryKeys.forEach((queryKey) => {
                    queryClient.invalidateQueries({ queryKey });
                });
            }
        },
    });

    const handleUpdateStatus = async (
        status: "draft" | "sent" | "accepted" | "rejected"
    ) => {
        try {
            await updateStatusMutation.mutateAsync(status);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <Menu shadow="md" width={200}>
            <Menu.Target>
                <Badge
                    color={statusColors[estimate.status]}
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
                    {statusOptions.find((opt) => opt.value === estimate.status)
                        ?.label || estimate.status}
                </Badge>
            </Menu.Target>

            <Menu.Dropdown>
                {statusOptions.map((option) => (
                    <Menu.Item
                        key={option.value}
                        onClick={() =>
                            handleUpdateStatus(
                                option.value as
                                    | "draft"
                                    | "sent"
                                    | "accepted"
                                    | "rejected"
                            )
                        }
                    >
                        {option.label}
                    </Menu.Item>
                ))}
            </Menu.Dropdown>
        </Menu>
    );
}
