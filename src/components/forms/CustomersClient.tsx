"use client";
import { useAtom, useSetAtom } from "jotai";
import {
    ActionIcon,
    Button,
    Group,
    Modal,
    Stack,
    TextInput,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    createCustomerMutationAtom,
    Customer,
    initialCustomerDetailAtom,
    updateCustomerMutationAtom,
} from "@/lib/atoms";
import { useSubscriptionLimits } from "@/hooks/useSubscriptionLimits";
import { notifications } from "@mantine/notifications";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { PlacesAutocomplete } from "../ui/PlacesAutocomplete";
import React from "react";
import { IconPlus } from "@tabler/icons-react";

const customerSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.email("Invalid email").optional().or(z.literal("")),
    phone: z.string().optional(),
    address: z.string().optional(),
    notes: z.string().optional(),
});

type CustomerFormData = z.infer<typeof customerSchema>;

export default function CustomersClient({
    trigger,
    customer,
}: {
    trigger?: React.ReactNode;
    customer?: Customer | null;
}) {
    const [opened, { open, close }] = useDisclosure(false);
    const { handleLimitError } = useSubscriptionLimits();

    const [createMutationResult] = useAtom(createCustomerMutationAtom);
    const [updateMutationResult] = useAtom(updateCustomerMutationAtom);
    const setCustomerDetails = useSetAtom(initialCustomerDetailAtom);
    const queryClient = useQueryClient();

    const {
        handleSubmit,
        control,
        formState: { isSubmitting },
        reset,
    } = useForm<CustomerFormData>({
        resolver: zodResolver(customerSchema),
        defaultValues: {
            name: customer?.name ?? "",
            email: customer?.email ?? "",
            phone: customer?.phone ?? "",
            address: customer?.address ?? "",
            notes: customer?.notes ?? "",
        },
    });

    const onSubmit = async (data: CustomerFormData) => {
        try {
            if (customer?.id) {
                await updateMutationResult.mutateAsync({
                    id: customer.id,
                    data,
                });
                await queryClient.invalidateQueries({
                    queryKey: ["customers"],
                });
                setCustomerDetails({
                    ...customer,
                    ...data,
                } as any);
            } else {
                await createMutationResult.mutateAsync(data);
                await queryClient.invalidateQueries({
                    queryKey: ["customers"],
                });
            }
            close();
            reset();
        } catch (error) {
            console.error("Failed to create/update customer:", error);
            if (!handleLimitError(error)) {
                notifications.show({
                    title: "Error",
                    message: "Failed to save customer. Please try again.",
                    color: "red",
                });
            }
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
                            Add customer
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

            <Modal
                opened={opened}
                onClose={close}
                title={customer ? "Edit customer" : "New customer"}
                centered
            >
                <form onSubmit={handleSubmit(onSubmit)}>
                    <Stack>
                        <Controller
                            name="name"
                            control={control}
                            render={({ field, fieldState }) => (
                                <TextInput
                                    {...field}
                                    label="Name"
                                    placeholder="Customer name"
                                    required
                                    error={fieldState.error?.message}
                                />
                            )}
                        />

                        <Controller
                            name="email"
                            control={control}
                            render={({ field, fieldState }) => (
                                <TextInput
                                    {...field}
                                    label="Email"
                                    placeholder="customer@example.com"
                                    type="email"
                                    error={fieldState.error?.message}
                                />
                            )}
                        />

                        <Controller
                            name="phone"
                            control={control}
                            render={({ field }) => (
                                <TextInput
                                    {...field}
                                    label="Phone"
                                    placeholder="(555) 123-4567"
                                />
                            )}
                        />

                        <Controller
                            name="address"
                            control={control}
                            render={({ field, fieldState: { error } }) => (
                                <PlacesAutocomplete
                                    {...field}
                                    label="Customer Address"
                                    error={error?.message}
                                />
                            )}
                        />

                        <Controller
                            name="notes"
                            control={control}
                            render={({ field }) => (
                                <TextInput
                                    {...field}
                                    label="Notes"
                                    placeholder="Additional notes..."
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
                                {customer ? "Update" : "Create"}
                            </Button>
                        </Group>
                    </Stack>
                </form>
            </Modal>
        </>
    );
}
