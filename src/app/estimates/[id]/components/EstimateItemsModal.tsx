"use client";
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
import { Estimate, Service, updateEstimateMutationAtom } from "@/lib/atoms";
import { Controller, useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { IconPlus, IconTrash } from "@tabler/icons-react";
import { useEffect } from "react";
import { useAtom } from "jotai";
import ServiceSelect from "@/components/forms/ServicesSelect";
import { fetchJSON } from "@/lib/fetchJson";

const estimateItemSchema = z.object({
    id: z.string().optional(),
    serviceId: z.string().min(1, "Service is required"),
    description: z.string().optional(),
    quantity: z.any().refine((val) => {
        const num = typeof val === "string" ? parseFloat(val) : val;
        return !isNaN(num) && num >= 1;
    }, "Quantity must be at least 1"),
    unitPrice: z.any().refine((val) => {
        const num = typeof val === "string" ? parseFloat(val) : val;
        return !isNaN(num) && num >= 0;
    }, "Unit price must be positive"),
});

const estimateItemsSchema = z.object({
    items: z
        .array(estimateItemSchema)
        .min(1, "At least one service item is required"),
});

type EstimateItemsFormData = {
    items: {
        id?: string;
        serviceId: string;
        description?: string;
        quantity: string | number;
        unitPrice: string | number;
    }[];
};

interface EstimateItemsModalProps {
    estimate: Estimate;
    opened: boolean;
    onClose: () => void;
}

export default function EstimateItemsModal({
    estimate,
    opened,
    onClose,
}: EstimateItemsModalProps) {
    const queryClient = useQueryClient();
    const { data: services } = useQuery({
        queryKey: ["services-estimates"],
        queryFn: () => fetchJSON<Service[]>("/api/services"),
    });

    const methods = useForm<EstimateItemsFormData>({
        resolver: zodResolver(estimateItemsSchema),
        defaultValues: {
            items: estimate?.items?.map((item) => ({
                id: item.id,
                serviceId: item.serviceId || "",
                description: item.description || "",
                quantity: item.quantity,
                unitPrice: item.unitPrice,
            })) || [
                { serviceId: "", description: "", quantity: 1, unitPrice: 0 },
            ],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: methods.control,
        name: "items",
    });

    const [updateMutationResult] = useAtom(updateEstimateMutationAtom);

    const { handleSubmit, control, watch, setValue } = methods;

    const onSubmit = async (data: EstimateItemsFormData) => {
        try {
            await updateMutationResult.mutateAsync({
                id: estimate.id,
                data: {
                    items: data.items.map((item) => ({
                        id: item.id || "",
                        estimateId: estimate.id,
                        serviceId: item.serviceId,
                        description: item.description || "",
                        quantity:
                            typeof item.quantity === "string"
                                ? parseFloat(item.quantity)
                                : item.quantity,
                        unitPrice:
                            typeof item.unitPrice === "string"
                                ? parseFloat(item.unitPrice)
                                : item.unitPrice,
                    })),
                },
            });
            await queryClient.invalidateQueries({ queryKey: ["estimates"] });
            onClose();
        } catch (error) {
            console.error("Failed to update estimate items:", error);
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
        return items.reduce((total, item) => {
            const quantity =
                typeof item.quantity === "string"
                    ? parseFloat(item.quantity) || 0
                    : item.quantity;
            const unitPrice =
                typeof item.unitPrice === "string"
                    ? parseFloat(item.unitPrice) || 0
                    : item.unitPrice;
            return total + quantity * unitPrice;
        }, 0);
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
        <Modal
            opened={opened}
            onClose={onClose}
            title="Edit Estimate Items"
            centered
            size="xl"
        >
            <form onSubmit={handleSubmit(onSubmit)}>
                <Stack>
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
                        <Button variant="light" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            loading={updateMutationResult.isPending}
                        >
                            Save Changes
                        </Button>
                    </Group>
                </Stack>
            </form>
        </Modal>
    );
}
