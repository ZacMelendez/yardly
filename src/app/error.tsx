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
import { IconHome, IconLogout, IconAlertTriangle } from "@tabler/icons-react";
import { signOut } from "@/lib/auth-client";
import { useTransitionRouter } from "next-view-transitions";
import { useEffect } from "react";

interface ErrorPageProps {
    error: Error & { digest?: string };
    reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
    const router = useTransitionRouter();

    // Log the error for debugging
    useEffect(() => {
        console.error("Application error:", error);
    }, [error]);

    const handleGoHome = () => {
        router.push("/");
    };

    const handleSignOut = async () => {
        await signOut();
        window.location.href = "/";
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
                        {/* Error Icon */}
                        <Box ta="center">
                            <IconAlertTriangle
                                size={64}
                                color="var(--mantine-color-red-6)"
                                stroke={1.5}
                            />
                        </Box>

                        {/* Error Message */}
                        <Box ta="center">
                            <Title order={2} mb="xs" c="red">
                                Something went wrong
                            </Title>
                            <Text size="sm" c="dimmed" mb="md">
                                We encountered an unexpected error. This has
                                been logged and we'll look into it.
                            </Text>
                            {process.env.NODE_ENV === "development" && (
                                <Text
                                    size="xs"
                                    c="dimmed"
                                    style={{ fontFamily: "monospace" }}
                                >
                                    {error.message}
                                </Text>
                            )}
                        </Box>

                        {/* Action Buttons */}
                        <Group gap="md" w="100%">
                            <Button
                                onClick={reset}
                                variant="outline"
                                leftSection={<IconAlertTriangle size={16} />}
                                style={{ flex: 1 }}
                            >
                                Try Again
                            </Button>
                            <Button
                                onClick={handleGoHome}
                                leftSection={<IconHome size={16} />}
                                style={{ flex: 1 }}
                            >
                                Go Home
                            </Button>
                        </Group>

                        {/* Sign Out Option */}
                        <Button
                            onClick={handleSignOut}
                            variant="subtle"
                            leftSection={<IconLogout size={16} />}
                            color="gray"
                            size="sm"
                        >
                            Sign Out
                        </Button>
                    </Stack>
                </Card>
            </Center>
        </Container>
    );
}
