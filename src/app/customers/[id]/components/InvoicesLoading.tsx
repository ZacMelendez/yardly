import { Skeleton, Stack, Group } from "@mantine/core";

export function InvoicesLoading() {
    return (
        <Stack gap="md">
            <Group justify="space-between" align="center">
                <Skeleton height={24} width={120} />
            </Group>
            <Stack gap="xs">
                <Skeleton height={48} />
                <Skeleton height={48} />
            </Stack>
        </Stack>
    );
}
