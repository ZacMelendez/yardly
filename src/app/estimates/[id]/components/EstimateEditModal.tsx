"use client";

import React from "react";
import { useAtom } from "jotai";
import { useQueryClient } from "@tanstack/react-query";
import { Modal, Stack, TextInput, Select, Group, Button } from "@mantine/core";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { updateEstimateMutationAtom, type EstimateDetail } from "@/lib/atoms";

const estimateSchema = z.object({
    title: z.string().min(1, "Title is required"),
    status: z.enum(["draft", "sent", "accepted", "rejected"]),
});

type EstimateFormData = z.infer<typeof estimateSchema>;

interface EstimateEditModalProps {
    estimate: EstimateDetail;
    opened: boolean;
    onClose: () => void;
}

export default function EstimateEditModal({
    estimate,
    opened,
    onClose,
}: EstimateEditModalProps) {
    const queryClient = useQueryClient();
    const [updateMutationResult] = useAtom(updateEstimateMutationAtom);

    const {
        handleSubmit,
        control,
        formState: { isSubmitting },
    } = useForm<EstimateFormData>({
        resolver: zodResolver(estimateSchema),
        defaultValues: {
            title: estimate?.title || "",
            status: estimate?.status || "draft",
        },
    });

    const onSubmit = async (data: EstimateFormData) => {
        if (!estimate) return;

        try {
            await updateMutationResult.mutateAsync({
                id: estimate.id,
                data,
            });
            await queryClient.invalidateQueries({
                queryKey: ["estimate", estimate.id],
            });
            await queryClient.invalidateQueries({
                queryKey: ["estimates"],
            });
            onClose();
        } catch (error) {
            console.error("Failed to update estimate:", error);
        }
    };

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title="Edit Estimate"
            centered
            size="md"
        >
            <form onSubmit={handleSubmit(onSubmit as any)}>
                <Stack gap="md">
                    <Controller
                        name="title"
                        control={control}
                        render={({ field, fieldState }) => (
                            <TextInput
                                {...field}
                                label="Title"
                                placeholder="Estimate title"
                                required
                                error={fieldState.error?.message}
                            />
                        )}
                    />

                    <Controller
                        name="status"
                        control={control}
                        render={({ field, fieldState }) => (
                            <Select
                                {...field}
                                label="Status"
                                placeholder="Select status"
                                required
                                data={[
                                    { value: "draft", label: "Draft" },
                                    { value: "sent", label: "Sent" },
                                    { value: "accepted", label: "Accepted" },
                                    { value: "rejected", label: "Rejected" },
                                ]}
                                error={fieldState.error?.message}
                            />
                        )}
                    />

                    <Group justify="flex-end" gap="sm">
                        <Button variant="light" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            loading={
                                isSubmitting || updateMutationResult.isPending
                            }
                        >
                            Save Changes
                        </Button>
                    </Group>
                </Stack>
            </form>
        </Modal>
    );
}
