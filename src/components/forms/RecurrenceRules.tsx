"use client";

import React from "react";
import { useFormContext, Controller } from "react-hook-form";
import { z } from "zod";
import {
    Group,
    NumberInput,
    Select,
    Stack,
    TextInput,
    MultiSelect,
    Switch,
} from "@mantine/core";

// Define enums separately to reduce schema serialization size
const FREQUENCY_ENUM = ["DAILY", "WEEKLY", "MONTHLY", "YEARLY"] as const;
const WEEKDAY_ENUM = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"] as const;
const END_TYPE_ENUM = ["never", "count", "until"] as const;

export const recurrenceSchema = z.object({
    isRecurring: z.boolean(),
    recurrenceRule: z
        .object({
            frequency: z.enum(FREQUENCY_ENUM),
            interval: z.number().min(1).max(999),
            byWeekDay: z.array(z.enum(WEEKDAY_ENUM)).optional(),
            byMonthDay: z.array(z.number().min(1).max(31)).optional(),
            byMonth: z.array(z.number().min(1).max(12)).optional(),
            count: z.number().min(1).optional(),
            until: z.string().optional(), // ISO date string
        })
        .optional(),
    recurrenceEnd: z.string().optional(), // ISO date string
    endType: z.enum(END_TYPE_ENUM).optional(),
});

export type RecurrenceFormData = z.infer<typeof recurrenceSchema>;

const FREQUENCY_OPTIONS = [
    { value: "DAILY", label: "Daily" },
    { value: "WEEKLY", label: "Weekly" },
    { value: "MONTHLY", label: "Monthly" },
    { value: "YEARLY", label: "Yearly" },
];

const WEEKDAY_OPTIONS = [
    { value: "SU", label: "Sunday" },
    { value: "MO", label: "Monday" },
    { value: "TU", label: "Tuesday" },
    { value: "WE", label: "Wednesday" },
    { value: "TH", label: "Thursday" },
    { value: "FR", label: "Friday" },
    { value: "SA", label: "Saturday" },
];

const MONTH_OPTIONS = [
    { value: "1", label: "January" },
    { value: "2", label: "February" },
    { value: "3", label: "March" },
    { value: "4", label: "April" },
    { value: "5", label: "May" },
    { value: "6", label: "June" },
    { value: "7", label: "July" },
    { value: "8", label: "August" },
    { value: "9", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
];

const END_TYPE_OPTIONS = [
    { value: "never", label: "Never" },
    { value: "count", label: "After number of occurrences" },
    { value: "until", label: "On specific date" },
];

export default function RecurrenceRuleFieldset() {
    const {
        control,
        watch,
        formState: { errors },
    } = useFormContext<RecurrenceFormData>();

    const isRecurring = watch("isRecurring");
    const frequency = watch("recurrenceRule.frequency");
    const endType = watch("endType");

    const generateMonthDayOptions = () => {
        return Array.from({ length: 31 }, (_, i) => ({
            value: (i + 1).toString(),
            label: (i + 1).toString(),
        }));
    };

    const getFrequencyLabel = (frequency: string, value: number) => {
        switch (frequency) {
            case "DAILY":
                return `Repeat every ${value} day${value !== 1 ? "s" : ""}`;
            case "WEEKLY":
                return `Repeat every ${value} week${value !== 1 ? "s" : ""}`;
            case "MONTHLY":
                return `Repeat every ${value} month${value !== 1 ? "s" : ""}`;
            case "YEARLY":
                return `Repeat every ${value} year${value !== 1 ? "s" : ""}`;
            default:
                return "";
        }
    };

    return (
        <Stack gap="sm">
            <Controller
                name="isRecurring"
                control={control}
                render={({ field }) => (
                    <Switch
                        {...field}
                        checked={field.value}
                        value={field.value.toString()}
                        onChange={(event) =>
                            field.onChange(event.target.checked)
                        }
                        label="Recurring event?"
                        size="sm"
                    />
                )}
            />

            {isRecurring && (
                <Stack gap="md">
                    <Group grow>
                        <Controller
                            name="recurrenceRule.frequency"
                            control={control}
                            render={({ field }) => (
                                <Select
                                    {...field}
                                    allowDeselect={false}
                                    label="Frequency"
                                    placeholder="Select frequency"
                                    data={FREQUENCY_OPTIONS}
                                    error={
                                        errors.recurrenceRule?.frequency
                                            ?.message
                                    }
                                />
                            )}
                        />

                        <Controller
                            name="recurrenceRule.interval"
                            control={control}
                            render={({ field }) => (
                                <NumberInput
                                    {...field}
                                    label={getFrequencyLabel(
                                        frequency,
                                        field.value
                                    )}
                                    placeholder="1"
                                    min={1}
                                    max={999}
                                    error={
                                        errors.recurrenceRule?.interval?.message
                                    }
                                />
                            )}
                        />
                    </Group>

                    {frequency === "WEEKLY" && (
                        <Controller
                            name="recurrenceRule.byWeekDay"
                            control={control}
                            render={({ field }) => (
                                <MultiSelect
                                    {...field}
                                    label="Days of the week"
                                    placeholder="Select days"
                                    data={WEEKDAY_OPTIONS}
                                    error={
                                        errors.recurrenceRule?.byWeekDay
                                            ?.message
                                    }
                                />
                            )}
                        />
                    )}

                    {frequency === "MONTHLY" && (
                        <Controller
                            name="recurrenceRule.byMonthDay"
                            control={control}
                            render={({ field }) => (
                                <MultiSelect
                                    {...field}
                                    label="Days of the month"
                                    placeholder="Select days (1-31)"
                                    data={generateMonthDayOptions()}
                                    value={field.value?.map(String) || []}
                                    onChange={(values) =>
                                        field.onChange(values.map(Number))
                                    }
                                    error={
                                        errors.recurrenceRule?.byMonthDay
                                            ?.message
                                    }
                                />
                            )}
                        />
                    )}

                    {frequency === "YEARLY" && (
                        <Controller
                            name="recurrenceRule.byMonth"
                            control={control}
                            render={({ field }) => (
                                <MultiSelect
                                    {...field}
                                    label="Months"
                                    placeholder="Select months"
                                    data={MONTH_OPTIONS}
                                    value={field.value?.map(String) || []}
                                    onChange={(values) =>
                                        field.onChange(values.map(Number))
                                    }
                                    error={
                                        errors.recurrenceRule?.byMonth?.message
                                    }
                                />
                            )}
                        />
                    )}

                    <Controller
                        name="endType"
                        control={control}
                        render={({ field }) => (
                            <Select
                                {...field}
                                allowDeselect={false}
                                label="End recurrence"
                                placeholder="Select end condition"
                                data={END_TYPE_OPTIONS}
                            />
                        )}
                    />

                    {endType === "count" && (
                        <Controller
                            name="recurrenceRule.count"
                            control={control}
                            render={({ field }) => (
                                <NumberInput
                                    {...field}
                                    label="Number of occurrences"
                                    placeholder="10"
                                    min={1}
                                    error={
                                        errors.recurrenceRule?.count?.message
                                    }
                                />
                            )}
                        />
                    )}

                    {endType === "until" && (
                        <Group grow>
                            <Controller
                                name="recurrenceRule.until"
                                control={control}
                                render={({ field }) => (
                                    <TextInput
                                        {...field}
                                        label="End date (recurrence rule)"
                                        placeholder="YYYY-MM-DD"
                                        type="date"
                                        error={
                                            errors.recurrenceRule?.until
                                                ?.message
                                        }
                                    />
                                )}
                            />

                            <Controller
                                name="recurrenceEnd"
                                control={control}
                                render={({ field }) => (
                                    <TextInput
                                        {...field}
                                        label="End date (Prisma field)"
                                        placeholder="YYYY-MM-DDTHH:mm:ss.sssZ"
                                        type="datetime-local"
                                        error={errors.recurrenceEnd?.message}
                                    />
                                )}
                            />
                        </Group>
                    )}
                </Stack>
            )}
        </Stack>
    );
}
