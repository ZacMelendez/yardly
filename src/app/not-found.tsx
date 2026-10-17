"use client";

import {
    Container,
    Stack,
    Title,
    Text,
    Button,
    Card,
    Center,
    Box,
    Group,
} from "@mantine/core";
import { IconHome, IconArrowLeft, IconSearch } from "@tabler/icons-react";
import { useTransitionRouter } from "next-view-transitions";

export default function NotFoundPage() {
    const router = useTransitionRouter();

    const handleGoHome = () => {
        router.push("/");
    };

    const handleGoBack = () => {
        router.back();
    };

    return (
        <Container size="sm" py="xl" h="100vh">
            <Center h="100%">
                <Card
                    shadow="lg"
                    padding="xl"
                    radius="md"
                    withBorder
                    style={{ width: "100%", maxWidth: 500 }}
                >
                    <Stack gap="xl" align="center">
                        {/* 404 Icon */}
                        <Box ta="center">
                            <IconSearch
                                size={64}
                                color="var(--mantine-color-blue-6)"
                                stroke={1.5}
                            />
                        </Box>

                        {/* 404 Message */}
                        <Box ta="center">
                            <Title order={1} mb="xs" c="blue">
                                404
                            </Title>
                            <Title order={3} mb="xs">
                                Page Not Found
                            </Title>
                            <Text size="sm" c="dimmed" mb="md">
                                The page you're looking for doesn't exist or has
                                been moved.
                            </Text>
                        </Box>

                        {/* Action Buttons */}
                        <Group gap="md" w="100%">
                            <Button
                                onClick={handleGoBack}
                                variant="outline"
                                leftSection={<IconArrowLeft size={16} />}
                                style={{ flex: 1 }}
                            >
                                Go Back
                            </Button>
                            <Button
                                onClick={handleGoHome}
                                leftSection={<IconHome size={16} />}
                                style={{ flex: 1 }}
                            >
                                Go Home
                            </Button>
                        </Group>
                    </Stack>
                </Card>
            </Center>
        </Container>
    );
}
