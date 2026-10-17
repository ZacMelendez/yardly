import { Stack, Group, Skeleton } from "@mantine/core";

export default function EstimateItemsLoading() {
    return (
        <Stack gap="md">
            <Group justify="space-between" align="center">
                <Skeleton height={24} width={120} />
                <Skeleton height={32} width={100} />
            </Group>
            <Stack gap="xs">
                {/* Table header skeleton */}
                <Skeleton height={40} />
                {/* Table rows skeleton */}
                <Skeleton height={48} />
                <Skeleton height={48} />
                <Skeleton height={48} />
                {/* Table footer skeleton */}
                <Skeleton height={50} />
            </Stack>
        </Stack>
    );
}
