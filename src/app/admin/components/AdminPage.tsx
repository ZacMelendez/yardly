"use client";

import AdminPanel from "./AdminPanel";
import {
    Avatar,
    Box,
    Group,
    Menu,
    rem,
    Text,
    Title,
    UnstyledButton,
} from "@mantine/core";
import {
    IconChevronDown,
    //  IconCrown,
    IconLogout,
} from "@tabler/icons-react";
import { useTransitionRouter } from "next-view-transitions";
import { ColorSchemeToggle } from "@/components/layout/ColorSchemeToggle";
import { YardliIcon } from "@/components/icons/Yardli";
import type { Session } from "@/lib/auth";
import { signOut } from "@/lib/auth-client";

export default function AdminPage({ session }: { session: Session }) {
    const router = useTransitionRouter();
    const handleSignOut = () => {
        signOut().then(() => {
            window.location.href = "/";
        });
    };

    return (
        <Box mx="auto" w="100%">
            <Group
                style={{ borderBottom: "1px solid rgb(82, 82, 82)" }}
                h="100%"
                p="lg"
                justify="space-between"
                align="center"
            >
                <Group>
                    <Group
                        onClick={() => {
                            router.push("/");
                        }}
                        style={{ cursor: "pointer" }}
                    >
                        <YardliIcon height={24} width={24} fill="#828282" />
                        <Title order={3} c="dimmed">
                            Yardli
                        </Title>
                    </Group>
                </Group>

                <Group>
                    <ColorSchemeToggle />

                    {session?.user && (
                        <Menu shadow="md" width={200}>
                            <Menu.Target>
                                <UnstyledButton>
                                    <Group gap="sm">
                                        <Avatar
                                            src={session.user.image}
                                            alt={session.user.name || "User"}
                                            radius="xl"
                                            size="sm"
                                        />
                                        <Box
                                            style={{ flex: 1 }}
                                            visibleFrom="sm"
                                        >
                                            <Text size="sm" fw={500}>
                                                {session.user.name || "User"}
                                            </Text>
                                            <Text c="dimmed" size="xs">
                                                {session.user.email}
                                            </Text>
                                        </Box>
                                        <IconChevronDown
                                            style={{
                                                width: rem(14),
                                                height: rem(14),
                                            }}
                                        />
                                    </Group>
                                </UnstyledButton>
                            </Menu.Target>

                            <Menu.Dropdown>
                                {/* <Menu.Item
                                    component={Link}
                                    href="/purchase"
                                    leftSection={
                                        <IconCrown
                                            style={{
                                                width: rem(14),
                                                height: rem(14),
                                            }}
                                        />
                                    }
                                >
                                    Upgrade Plan
                                </Menu.Item>
                                <Menu.Divider /> */}
                                <Menu.Item
                                    leftSection={
                                        <IconLogout
                                            style={{
                                                width: rem(14),
                                                height: rem(14),
                                            }}
                                        />
                                    }
                                    onClick={handleSignOut}
                                >
                                    Sign out
                                </Menu.Item>
                            </Menu.Dropdown>
                        </Menu>
                    )}
                </Group>
            </Group>
            <Box px="lg">
                <Title order={1} mt="md" mb="lg" px="lg">
                    Admin Panel
                </Title>
                <AdminPanel />
            </Box>
        </Box>
    );
}
