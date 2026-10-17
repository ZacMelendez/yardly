"use client";
import { useAtom } from "jotai";
import {
    Button,
    Group,
    Modal,
    Stack,
    TextInput,
    Select,
    ActionIcon,
    Flex,
} from "@mantine/core";
import { DatePickerInput, TimePicker } from "@mantine/dates";
import { useDisclosure } from "@mantine/hooks";
import { useForm, Controller, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createJobMutationAtom, Job, updateJobMutationAtom } from "@/lib/atoms";
import { useSubscriptionLimits } from "@/hooks/useSubscriptionLimits";
import { notifications } from "@mantine/notifications";
import RecurrenceRuleFieldset, { recurrenceSchema } from "./RecurrenceRules";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";
import CustomerSelect from "./CustomerSelect";
import EstimateSelect from "./EstimatesSelect";
import { IconPlus } from "@tabler/icons-react";

const statusOptions = [
    { value: "scheduled", label: "Scheduled" },
    { value: "in_progress", label: "In Progress" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
];

// Extend schema to include job-specific fields
const jobSchema = z
    .object({
        title: z.string().min(1, "Title is required"),
        customerId: z.string().min(1, "Customer is required"),
        date: z.date().nullable().or(z.string()),
        time: z.string().nullable().or(z.string()),
        status: z.enum(["scheduled", "in_progress", "completed", "cancelled"]),
        estimateId: z.string().min(1, "Estimate is required"),
    })
    .extend(recurrenceSchema.shape);

type JobFormData = z.infer<typeof jobSchema>;

const combineDateAndTime = (date: string, time: string) => {
    const timeString = time + ":00"; // Add seconds to make it "21:21:00"
    const combined = new Date(date + " " + timeString);

    return combined;
};

export default function JobsClient({
    customerId,
    job,
    trigger,
    estimateId,
    refetchQueryKeys,
}: {
    customerId?: string;
    estimateId?: string;
    job?: Job;
    trigger?: React.ReactNode;
    refetchQueryKeys?: Array<Array<string | number>>;
}) {
    const [opened, { open, close }] = useDisclosure(false);
    const queryClient = useQueryClient();
    const { handleLimitError } = useSubscriptionLimits();

    const [createJobMutationResult] = useAtom(createJobMutationAtom);
    const [updateJobMutationResult] = useAtom(updateJobMutationAtom);

    const methods = useForm<JobFormData>({
        resolver: zodResolver(jobSchema),
        defaultValues: {
            title: job?.title || "",
            customerId: job?.customer?.id || customerId || "",
            estimateId: estimateId || job?.estimate?.id || "",
            date: job?.date ? new Date(job.date) : null,
            time: job?.date
                ? new Date(job.date).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                  })
                : "09:00",
            status:
                (job?.status as
                    | "scheduled"
                    | "in_progress"
                    | "completed"
                    | "cancelled") || "scheduled",
            isRecurring: job?.recurrenceRule ? true : false,
            recurrenceRule: job?.recurrenceRule
                ? (job?.recurrenceRule as any) || {
                      frequency: "DAILY",
                      interval: 1,
                      count: 1,
                      endDate: undefined,
                      endType: undefined,
                  }
                : undefined,
            recurrenceEnd: job?.recurrenceEnd
                ? new Date(job.recurrenceEnd).toISOString()
                : undefined,
            endType: job?.endType || undefined,
        },
    });

    const {
        handleSubmit,
        control,
        formState: { isSubmitting },
        reset,
        watch,
    } = methods;

    const onSubmit = async (data: JobFormData) => {
        try {
            if (job?.id) {
                await updateJobMutationResult.mutateAsync({
                    id: job.id,
                    data: {
                        ...data,
                        date: data.date
                            ? combineDateAndTime(
                                  new Date(data.date)
                                      .toISOString()
                                      .split("T")[0],
                                  data.time || ""
                              )
                            : null,
                    },
                });
            } else {
                await createJobMutationResult.mutateAsync({
                    ...data,
                    date: data.date
                        ? combineDateAndTime(
                              new Date(data.date).toISOString().split("T")[0],
                              data.time || ""
                          ).toISOString()
                        : null,
                });
            }

            await queryClient.invalidateQueries({ queryKey: ["jobs"] });
            if (refetchQueryKeys) {
                refetchQueryKeys.forEach((queryKey) => {
                    queryClient.invalidateQueries({ queryKey });
                });
            }
            close();
            reset();
        } catch (error) {
            console.error("Failed to create/update job:", error);
            if (!handleLimitError(error)) {
                notifications.show({
                    title: "Error",
                    message: "Failed to save job. Please try again.",
                    color: "red",
                });
            }
        }
    };

    const customer = watch("customerId");

    return (
        <>
            <Group justify="flex-end">
                {trigger ? (
                    <span onClick={open}>{trigger}</span>
                ) : (
                    <>
                        <Button onClick={open} variant="light" visibleFrom="sm">
                            Add job
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
                title="New Job"
                centered
                size="md"
            >
                <FormProvider {...methods}>
                    <form onSubmit={handleSubmit(onSubmit)}>
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

                            <CustomerSelect
                                control={control}
                                customerId={customerId}
                            />

                            <EstimateSelect
                                control={control}
                                customerId={customerId || customer}
                                estimateId={estimateId}
                            />

                            <Controller
                                name="status"
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        {...field}
                                        allowDeselect={false}
                                        label="Status"
                                        data={statusOptions}
                                    />
                                )}
                            />

                            <Flex direction="row" gap="sm">
                                <Controller
                                    name="date"
                                    control={control}
                                    render={({ field }) => (
                                        <DatePickerInput
                                            label="Scheduled Date"
                                            placeholder="Select date"
                                            value={field.value}
                                            onChange={(val) =>
                                                field.onChange(val)
                                            }
                                            clearable
                                            flex={1}
                                        />
                                    )}
                                />

                                <Controller
                                    name="time"
                                    control={control}
                                    render={({ field }) => (
                                        <TimePicker
                                            {...field}
                                            label="Scheduled Time"
                                            value={field.value || undefined}
                                            onChange={(val) =>
                                                field.onChange(val)
                                            }
                                            clearable
                                            flex={1}
                                            format="12h"
                                        />
                                    )}
                                />
                            </Flex>
                            <RecurrenceRuleFieldset />

                            <Group justify="flex-end">
                                <Button variant="light" onClick={close}>
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    loading={
                                        isSubmitting ||
                                        createJobMutationResult.isPending ||
                                        updateJobMutationResult.isPending
                                    }
                                >
                                    {job?.id ? "Update Job" : "Create Job"}
                                </Button>
                            </Group>
                        </Stack>
                    </form>
                </FormProvider>
            </Modal>
        </>
    );
}
