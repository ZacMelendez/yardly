import { Skeleton, Stack, Group } from "@mantine/core";

export function JobsLoading() {
    return (
        <Stack gap="md">
            <Group justify="space-between" align="center">
                <Skeleton height={24} width={100} />
                <Skeleton height={32} width={80} />
            </Group>
            <Stack gap="xs">
                <Skeleton height={48} />
                <Skeleton height={48} />
                <Skeleton height={48} />
            </Stack>
        </Stack>
    );
}
