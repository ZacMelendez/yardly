import { Estimate } from "@/lib/atoms";
import { fetchJSON } from "@/lib/fetchJson";
import { Loader, Select } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { Controller, type Control } from "react-hook-form";

export default function EstimateSelect({
    control,
    name = "estimateId",
    estimateId,
    customerId,
}: {
    control: Control<any>;
    name?: string;
    estimateId?: string;
    customerId?: string;
}) {
    const { data: estimates, isLoading } = useQuery<Estimate[]>({
        queryKey: ["estimates", customerId],
        queryFn: () =>
            fetchJSON<Estimate[]>(`/api/estimates/customer/${customerId}`),
        enabled: !!customerId,
    });

    const estimateOptions = estimates?.map((estimate) => ({
        value: estimate.id,
        label: estimate.title,
    }));

    return (
        <Controller
            name={name}
            control={control}
            render={({ field, fieldState }) => (
                <Select
                    {...field}
                    label="Estimate"
                    placeholder={"Select an estimate"}
                    disabled={
                        !!estimateId ||
                        isLoading ||
                        !customerId ||
                        !estimateOptions?.length
                    }
                    rightSection={isLoading ? <Loader size="xs" /> : null}
                    required
                    allowDeselect={false}
                    data={estimateOptions}
                    searchable
                    error={fieldState.error?.message}
                />
            )}
        />
    );
}
