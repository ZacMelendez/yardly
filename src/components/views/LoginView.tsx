"use client";
import {
    Container,
    Stack,
    Title,
    Card,
    Text,
    Center,
    Box,
    MantineProvider,
} from "@mantine/core";
import LoginClient from "@/components/forms/LoginClient";

export default function LoginView() {
    return (
        <MantineProvider forceColorScheme="dark">
            <Container size="sm" py="xl" h="100vh">
                <Center h="100%">
                    <Card
                        shadow="lg"
                        padding="xl"
                        radius="md"
                        withBorder
                        style={{ width: "100%", maxWidth: 400 }}
                    >
                        <Stack gap="xl" align="center">
                            {/* Header */}
                            <Box ta="center">
                                <Title order={2} mb="xs">
                                    Welcome to Yardli
                                </Title>
                                <Text size="sm" c="dimmed">
                                    Manage your landscaping business
                                </Text>
                            </Box>

                            {/* Sign In Button */}
                            <Box w="100%" ta="center">
                                <LoginClient />
                                <Text size="xs" c="dimmed" mt="lg">
                                    Secure sign-in with Google • New users
                                    welcome
                                </Text>
                            </Box>
                        </Stack>
                    </Card>
                </Center>
            </Container>
        </MantineProvider>
    );
}
