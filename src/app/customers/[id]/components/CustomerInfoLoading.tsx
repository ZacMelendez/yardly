import { Card, Skeleton, Stack } from "@mantine/core";

export function CustomerInfoLoading() {
    return (
        <Card withBorder>
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
        </Card>
    );
}
