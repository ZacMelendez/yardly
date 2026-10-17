import { Container, Skeleton, Stack, Group, Divider } from "@mantine/core";

export default function Loading() {
    return (
        <Container size="lg" py="md">
            <Stack gap="lg">
                {/* Header skeleton */}
                <Group justify="space-between" align="center">
                    <Group gap="sm">
                        <Skeleton height={40} width={40} />
                        <Skeleton height={32} width={200} />
                        <Skeleton height={24} width={60} />
                    </Group>
                    <Skeleton height={36} width={120} />
                </Group>

                {/* Estimate info skeleton */}
                <Stack gap="md">
                    <Skeleton height={24} width={150} />
                    <Stack gap="sm">
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
                </Stack>

                <Divider />

                {/* Items section skeleton */}
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

                {/* Delete button skeleton */}
                <Group justify="flex-end">
                    <Skeleton height={36} width={140} />
                </Group>
            </Stack>
        </Container>
    );
}
