"use client";

import React from "react";
import { useAtom } from "jotai";
import { useQueryClient } from "@tanstack/react-query";
import { useTransitionRouter } from "next-view-transitions";
import { Button, Group, Text } from "@mantine/core";
import { modals } from "@mantine/modals";
import { deleteEstimateMutationAtom } from "@/lib/atoms";

interface DeleteEstimateProps {
    id: string;
}

export default function DeleteEstimate({ id }: DeleteEstimateProps) {
    const queryClient = useQueryClient();
    const router = useTransitionRouter();
    const [deleteMutationResult] = useAtom(deleteEstimateMutationAtom);

    const handleDelete = () => {
        modals.openConfirmModal({
            title: "Delete Estimate?",
            children: (
                <Text size="sm">
                    Are you sure you want to delete this estimate? This action
                    cannot be undone.
                </Text>
            ),
            labels: { confirm: "Delete", cancel: "Cancel" },
            confirmProps: { color: "red" },
            onConfirm: async () => {
                try {
                    await deleteMutationResult.mutateAsync(id);
                    await queryClient.invalidateQueries({
                        queryKey: ["estimates"],
                    });
                    router.push("/estimates");
                } catch (error) {
                    console.error("Failed to delete estimate:", error);
                }
            },
        });
    };

    return (
        <Group justify="flex-end">
            <Button
                color="red"
                variant="light"
                onClick={handleDelete}
                loading={deleteMutationResult.isPending}
            >
                Delete Estimate
            </Button>
        </Group>
    );
}
