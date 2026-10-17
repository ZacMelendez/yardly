import { Card, Stack, Group, Skeleton } from "@mantine/core";

export default function EstimateInfoLoading() {
    return (
        <Card withBorder>
            <Stack gap="md">
                <Skeleton height={24} width={150} />
                <Group grow>
                    <Stack gap="xs">
                        <Skeleton height={16} width={80} />
                        <Skeleton height={20} width={120} />
                    </Stack>
                    <Stack gap="xs">
                        <Skeleton height={16} width={100} />
                        <Skeleton height={24} width={80} />
                    </Stack>
                </Group>
                <Group grow>
                    <Stack gap="xs">
                        <Skeleton height={16} width={60} />
                        <Skeleton height={20} width={100} />
                    </Stack>
                    <Stack gap="xs">
                        <Skeleton height={16} width={90} />
                        <Skeleton height={20} width={100} />
                    </Stack>
                </Group>
                <Stack gap="xs">
                    <Skeleton height={16} width={110} />
                    <Skeleton height={20} width={150} />
                </Stack>
                <Stack gap="xs">
                    <Skeleton height={16} width={120} />
                    <Skeleton height={20} width={200} />
                </Stack>
            </Stack>
        </Card>
    );
}
