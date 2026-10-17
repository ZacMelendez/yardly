import { Service } from "@/lib/atoms";
import { fetchJSON } from "@/lib/fetchJson";
import { Loader, Select } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { Controller, type Control } from "react-hook-form";

export default function ServiceSelect({
    control,
    name = "serviceId",
    serviceId,
}: {
    control: Control<any>;
    name?: string;
    serviceId?: string;
}) {
    const { data: services, isLoading } = useQuery({
        queryKey: ["services-select"],
        queryFn: () => fetchJSON<Service[]>("/api/services"),
    });

    const serviceOptions = services?.map((service) => ({
        value: service.id,
        label: service.name,
    }));

    return (
        <Controller
            name={name}
            control={control}
            render={({ field, fieldState }) => (
                <Select
                    {...field}
                    label="Service"
                    placeholder="Select a service"
                    disabled={!!serviceId || isLoading}
                    rightSection={isLoading ? <Loader size="xs" /> : null}
                    required
                    allowDeselect={false}
                    data={serviceOptions}
                    searchable
                    error={fieldState.error?.message}
                />
            )}
        />
    );
}
