"use client";
import { useAtom } from "jotai";
import {
    ActionIcon,
    Button,
    Group,
    Modal,
    NumberInput,
    Stack,
    Switch,
    TextInput,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    createServiceMutationAtom,
    Service,
    updateServiceMutationAtom,
} from "@/lib/atoms";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";
import React from "react";
import { IconPlus } from "@tabler/icons-react";

const serviceSchema = z.object({
    name: z.string().min(1, "Name is required"),
    defaultPrice: z.number().min(0, "Default price is required"),
    unit: z.string().min(1, "Unit is required"),
    isActive: z.boolean(),
    description: z.string().optional(),
    category: z.string().optional(),
});

type ServiceFormData = z.infer<typeof serviceSchema>;

export default function ServicesClient({
    trigger,
    service,
}: {
    trigger?: React.ReactNode;
    service?: Service | null;
}) {
    const [opened, { open, close }] = useDisclosure(false);

    const [createMutationResult] = useAtom(createServiceMutationAtom);
    const [updateMutationResult] = useAtom(updateServiceMutationAtom);
    const queryClient = useQueryClient();

    const {
        handleSubmit,
        control,
        formState: { isSubmitting },
        reset,
    } = useForm<ServiceFormData>({
        resolver: zodResolver(serviceSchema),
        defaultValues: {
            name: service?.name ?? "",
            defaultPrice: Number(service?.defaultPrice) ?? 100,
            unit: service?.unit ?? "",
            isActive: service?.isActive ?? false,
            description: service?.description ?? "",
            category: service?.category ?? "",
        },
    });

    const onSubmit = async (data: ServiceFormData) => {
        try {
            if (service?.id) {
                await updateMutationResult.mutateAsync({
                    id: service.id,
                    data,
                });
                await queryClient.invalidateQueries({
                    queryKey: ["services"],
                });
            } else {
                await createMutationResult.mutateAsync({
                    ...data,
                    description: data.description ?? null,
                    category: data.category ?? null,
                });
                await queryClient.invalidateQueries({
                    queryKey: ["services"],
                });
            }
            close();
            reset();
        } catch (error) {
            console.error("Failed to create service:", error);
        }
    };

    return (
        <>
            <Group justify="flex-end">
                {trigger ? (
                    <span onClick={open}>{trigger}</span>
                ) : (
                    <>
                        <Button onClick={open} variant="light" visibleFrom="sm">
                            Add service
                        </Button>
                        <ActionIcon
                            onClick={open}
                            variant="light"
                            hiddenFrom="sm"
                            size="lg"
                        >
                            <IconPlus />
                        </ActionIcon>
                    </>
                )}
            </Group>

            <Modal opened={opened} onClose={close} title="New service" centered>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <Stack>
                        <Controller
                            name="name"
                            control={control}
                            render={({ field, fieldState }) => (
                                <TextInput
                                    {...field}
                                    label="Name"
                                    placeholder="Service name"
                                    required
                                    error={fieldState.error?.message}
                                />
                            )}
                        />

                        <Controller
                            name="defaultPrice"
                            control={control}
                            render={({ field, fieldState }) => (
                                <NumberInput
                                    {...field}
                                    label="Default Price"
                                    placeholder="100.00"
                                    decimalScale={2}
                                    fixedDecimalScale
                                    thousandSeparator=","
                                    error={fieldState.error?.message}
                                />
                            )}
                        />

                        <Controller
                            name="unit"
                            control={control}
                            render={({ field }) => (
                                <TextInput
                                    {...field}
                                    label="Unit"
                                    placeholder="hour"
                                />
                            )}
                        />

                        <Controller
                            name="isActive"
                            control={control}
                            render={({ field, fieldState: { error } }) => (
                                <Switch
                                    {...field}
                                    label="Is Active"
                                    error={error?.message}
                                    checked={field.value}
                                    value={field.value.toString()}
                                    onChange={(event) =>
                                        field.onChange(
                                            event.currentTarget.checked
                                        )
                                    }
                                />
                            )}
                        />

                        <Controller
                            name="description"
                            control={control}
                            render={({ field }) => (
                                <TextInput
                                    {...field}
                                    label="Description"
                                    placeholder="Service description"
                                />
                            )}
                        />

                        <Group justify="flex-end">
                            <Button variant="light" onClick={close}>
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                loading={
                                    isSubmitting ||
                                    createMutationResult.isPending
                                }
                            >
                                Create
                            </Button>
                        </Group>
                    </Stack>
                </form>
            </Modal>
        </>
    );
}
