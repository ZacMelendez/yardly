"use client";

import { Container, Stack, Anchor, Text, Button } from "@mantine/core";
import Link from "next/link";
import { IconArrowLeft } from "@tabler/icons-react";
import { useTransitionRouter } from "next-view-transitions";

interface LegalLayoutProps {
    children: React.ReactNode;
}

export function LegalLayout({ children }: LegalLayoutProps) {
    const router = useTransitionRouter();

    return (
        <Container size="md" py="xl">
            <Stack gap="lg">
                <Button
                    variant="subtle"
                    leftSection={<IconArrowLeft />}
                    onClick={() => router.back()}
                    w="fit-content"
                >
                    Back
                </Button>

                {children}

                <Container
                    py="xl"
                    mt="xl"
                    w="100%"
                    style={{
                        borderTop: "1px solid var(--mantine-color-gray-7)",
                    }}
                >
                    <Stack gap="md" align="center">
                        <Text size="sm" c="dimmed" ta="center">
                            Legal Documents
                        </Text>
                        <Stack gap="xs" align="center">
                            <Anchor component={Link} href="/privacy" size="sm">
                                Privacy Policy
                            </Anchor>
                            <Anchor component={Link} href="/terms" size="sm">
                                Terms of Service
                            </Anchor>
                        </Stack>
                        <Text size="xs" c="dimmed" ta="center">
                            © {new Date().getFullYear()} Yardli. All rights
                            reserved.
                        </Text>
                    </Stack>
                </Container>
            </Stack>
        </Container>
    );
}
