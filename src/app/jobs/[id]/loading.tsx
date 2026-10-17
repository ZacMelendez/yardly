import { Container, Skeleton, Stack, Group, Divider } from "@mantine/core";

export default function Loading() {
    return (
        <Container size="lg" py="md">
            <Stack gap="lg">
                {/* Header skeleton */}
                <Group justify="space-between" align="center">
                    <Skeleton height={32} width={200} />
                    <Skeleton height={36} width={80} />
                </Group>

                {/* Job info skeleton */}
                <Stack gap="md">
                    <Skeleton height={24} width={150} />
                    <Stack gap="sm">
                        <Skeleton height={36} />
                        <Skeleton height={36} />
                        <Skeleton height={36} />
                        <Skeleton height={36} />
                        <Skeleton height={72} />
                    </Stack>
                </Stack>

                <Divider />

                {/* Jobs section skeleton */}
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

                <Divider />

                {/* Estimates section skeleton */}
                <Stack gap="md">
                    <Group justify="space-between" align="center">
                        <Skeleton height={24} width={120} />
                        <Skeleton height={32} width={100} />
                    </Group>
                    <Stack gap="xs">
                        <Skeleton height={48} />
                        <Skeleton height={48} />
                    </Stack>
                </Stack>
            </Stack>
        </Container>
    );
}
