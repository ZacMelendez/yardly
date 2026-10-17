import { CustomerResponse } from "@/lib/atoms";
import { fetchJSON } from "@/lib/fetchJson";
import { Loader, Select } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { Controller, type Control } from "react-hook-form";

export default function CustomerSelect({
    control,
    name = "customerId",
    customerId,
}: {
    control: Control<any>;
    name?: string;
    customerId?: string;
}) {
    const { data: customers, isLoading } = useQuery({
        queryKey: ["customer-select"],
        queryFn: () => fetchJSON<CustomerResponse>("/api/customers"),
    });

    const customerOptions = customers?.data?.map((customer) => ({
        value: customer.id,
        label: customer.name,
    }));

    return (
        <Controller
            name={name}
            control={control}
            render={({ field, fieldState }) => (
                <Select
                    {...field}
                    label="Customer"
                    placeholder="Select a customer"
                    disabled={!!customerId || isLoading}
                    rightSection={isLoading ? <Loader size="xs" /> : null}
                    required
                    allowDeselect={false}
                    data={customerOptions}
                    searchable
                    error={fieldState.error?.message}
                />
            )}
        />
    );
}
