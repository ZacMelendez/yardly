"use client";
import { useAtom } from "jotai";
import {
    Button,
    Group,
    Modal,
    Stack,
    TextInput,
    NumberInput,
    ActionIcon,
    Text,
    Divider,
    Box,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
    createEstimateMutationAtom,
    Estimate,
    Service,
    updateEstimateMutationAtom,
} from "@/lib/atoms";
import { useSubscriptionLimits } from "@/hooks/useSubscriptionLimits";
import { notifications } from "@mantine/notifications";
import { Controller, useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { IconPlus, IconTrash } from "@tabler/icons-react";
import { useEffect } from "react";
import ServiceSelect from "./ServicesSelect";
import { fetchJSON } from "@/lib/fetchJson";
import CustomerSelect from "./CustomerSelect";

const estimateItemSchema = z.object({
    id: z.string().optional(),
    serviceId: z.string().min(1, "Service is required"),
    description: z.string().optional(),
    quantity: z.number().min(1, "Quantity must be at least 1"),
    unitPrice: z.number().min(0, "Unit price must be positive"),
});

const estimateSchema = z.object({
    title: z.string().min(1, "Title is required"),
    customerId: z.string().min(1, "Customer is required"),
    date: z.date().nullable(),
    status: z.enum(["draft", "sent", "accepted", "rejected"]),
    items: z
        .array(estimateItemSchema)
        .min(1, "At least one service item is required"),
});

type EstimateFormData = z.infer<typeof estimateSchema>;

export default function EstimatesClient({
    estimate,
    trigger,
    customerId,
    refetchQueryKeys,
}: {
    estimate?: Estimate;
    trigger?: React.ReactNode;
    customerId?: string;
    refetchQueryKeys?: Array<Array<string | number>>;
}) {
    const [opened, { open, close }] = useDisclosure(false);
    const queryClient = useQueryClient();
    const { handleLimitError } = useSubscriptionLimits();
    const { data: services } = useQuery({
        queryKey: ["services-estimates"],
        queryFn: () => fetchJSON<Service[]>("/api/services"),
    });

    const methods = useForm<EstimateFormData>({
        resolver: zodResolver(estimateSchema),
        defaultValues: {
            title: estimate?.title || "",
            customerId: estimate?.customer?.id || customerId || "",
            date: estimate?.createdAt ? new Date(estimate.createdAt) : null,
            status: estimate?.status || "draft",
            items:
                estimate?.items?.map((item) => ({
                    id: item.id,
                    serviceId: item.serviceId,
                    description: item.description,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                })) || [],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: methods.control,
        name: "items",
    });

    const [createMutationResult] = useAtom(createEstimateMutationAtom);
    const [updateMutationResult] = useAtom(updateEstimateMutationAtom);

    const { handleSubmit, control, watch, setValue } = methods;

    const onSubmit = async (data: EstimateFormData) => {
        try {
            if (estimate?.id) {
                await updateMutationResult.mutateAsync({
                    id: estimate.id,
                    data: {
                        ...data,
                        items: data.items.map((item) => ({
                            id: item.id || "",
                            estimateId: estimate.id,
                            description: item.description || "",
                            quantity: item.quantity,
                            unitPrice: item.unitPrice,
                        })),
                    },
                });
            } else {
                await createMutationResult.mutateAsync(data);
            }
            await queryClient.invalidateQueries({ queryKey: ["estimates"] });
            if (refetchQueryKeys) {
                refetchQueryKeys.forEach((queryKey) => {
                    queryClient.invalidateQueries({ queryKey });
                });
            }
            close();
            methods.reset();
        } catch (error) {
            console.error("Failed to create estimate:", error);
            if (!handleLimitError(error)) {
                notifications.show({
                    title: "Error",
                    message: "Failed to save estimate. Please try again.",
                    color: "red",
                });
            }
        }
    };

    const addLineItem = () => {
        append({ serviceId: "", description: "", quantity: 1, unitPrice: 0 });
    };

    const removeLineItem = (index: number) => {
        if (fields.length > 1) {
            remove(index);
        }
    };

    const calculateTotal = () => {
        const items = methods.watch("items");
        return items.reduce(
            (total, item) => total + item.quantity * item.unitPrice,
            0
        );
    };

    // Watch for changes in service selections and update unit prices accordingly
    useEffect(() => {
        const subscription = watch((value, { name }) => {
            // Check if a service selection changed
            if (
                name &&
                name.startsWith("items.") &&
                name.endsWith(".serviceId")
            ) {
                const index = parseInt(name.split(".")[1]);
                const serviceId = value.items?.[index]?.serviceId;
                if (serviceId && services) {
                    const service = services.find(
                        (s) => `${s.id}` === `${serviceId}`
                    );
                    if (service) {
                        setValue(
                            `items.${index}.unitPrice`,
                            service.defaultPrice || 0
                        );
                    }
                }
            }
        });

        return () => subscription.unsubscribe();
    }, [watch, services, setValue]);

    // Initialize unit prices when services data becomes available
    useEffect(() => {
        if (services && fields.length > 0) {
            fields.forEach((field, index) => {
                const serviceId = watch(`items.${index}.serviceId`);
                if (serviceId) {
                    const service = services.find(
                        (s) => `${s.id}` === `${serviceId}`
                    );
                    if (service) {
                        setValue(
                            `items.${index}.unitPrice`,
                            service.defaultPrice || 0
                        );
                    }
                }
            });
        }
    }, [services, fields, watch, setValue]);

    return (
        <>
            <Group justify="flex-end">
                {trigger ? (
                    <span onClick={open}>{trigger}</span>
                ) : (
                    <>
                        <Button onClick={open} variant="light" visibleFrom="sm">
                            Add estimate
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
                title="New estimate"
                centered
                size="xl"
            >
                <Stack>
                    <Controller
                        name="title"
                        control={control}
                        render={({ field, fieldState }) => (
                            <TextInput
                                {...field}
                                label="Job Title"
                                placeholder="e.g., Lawn mowing, Tree removal"
                                required
                                error={fieldState.error?.message}
                            />
                        )}
                    />

                    <CustomerSelect control={control} customerId={customerId} />

                    <Group justify="space-between">
                        <Divider
                            label="Services"
                            labelPosition="left"
                            flex={1}
                        />
                        <Button onClick={addLineItem} variant="light" size="xs">
                            <IconPlus
                                size={12}
                                style={{
                                    marginRight: "4px",
                                }}
                            />
                            Add service
                        </Button>
                    </Group>

                    {fields.map((field, index) => {
                        const serviceId = watch(`items.${index}.serviceId`);
                        const service = services?.find(
                            (s) => `${s.id}` === `${serviceId}`
                        );

                        return (
                            <Box key={field.id}>
                                <Group align="flex-start" gap="md">
                                    <ServiceSelect
                                        control={control}
                                        name={`items.${index}.serviceId`}
                                    />
                                    <Controller
                                        name={`items.${index}.quantity`}
                                        control={control}
                                        render={({ field, fieldState }) => (
                                            <NumberInput
                                                {...field}
                                                label="Quantity"
                                                placeholder="1"
                                                min={1}
                                                required
                                                style={{ flex: 1 }}
                                                error={
                                                    fieldState.error?.message
                                                }
                                            />
                                        )}
                                    />
                                    <Controller
                                        name={`items.${index}.unitPrice`}
                                        control={control}
                                        render={({ field, fieldState }) => {
                                            return (
                                                <NumberInput
                                                    {...field}
                                                    label={
                                                        service?.unit
                                                            ? `Price (per ${service?.unit})`
                                                            : "Unit Price"
                                                    }
                                                    placeholder="0.00"
                                                    min={0}
                                                    decimalScale={2}
                                                    fixedDecimalScale
                                                    prefix="$"
                                                    required
                                                    style={{ flex: 1 }}
                                                    error={
                                                        fieldState.error
                                                            ?.message
                                                    }
                                                />
                                            );
                                        }}
                                    />
                                    <Group gap="xs">
                                        <ActionIcon
                                            color="red"
                                            variant="light"
                                            size="lg"
                                            style={{ marginTop: "25px" }}
                                            onClick={() =>
                                                removeLineItem(index)
                                            }
                                            disabled={fields.length === 1}
                                        >
                                            <IconTrash size={16} />
                                        </ActionIcon>
                                    </Group>
                                </Group>
                                <Controller
                                    name={`items.${index}.description`}
                                    control={control}
                                    render={({ field, fieldState }) => (
                                        <TextInput
                                            {...field}
                                            label="Description"
                                            placeholder="Service description (optional)"
                                            mt="md"
                                            error={fieldState.error?.message}
                                        />
                                    )}
                                />
                            </Box>
                        );
                    })}

                    <Group justify="space-between">
                        <Text fw={600} size="lg">
                            Total: ${calculateTotal().toFixed(2)}
                        </Text>
                    </Group>

                    <Group justify="flex-end">
                        <Button variant="light" onClick={close}>
                            Cancel
                        </Button>
                        <Button
                            loading={createMutationResult.isPending}
                            onClick={handleSubmit(onSubmit)}
                        >
                            Create
                        </Button>
                    </Group>
                </Stack>
            </Modal>
        </>
    );
}
