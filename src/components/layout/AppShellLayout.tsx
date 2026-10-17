"use client";
import {
    AppShell,
    Burger,
    Group,
    NavLink,
    Title,
    Text,
    Avatar,
    Menu,
    UnstyledButton,
    rem,
    Box,
    Anchor,
    Divider,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useSession, signOut } from "@/lib/auth-client";
import { Link, useTransitionRouter } from "next-view-transitions";
import { usePathname } from "next/navigation";
import {
    IconDashboard,
    IconUsers,
    IconFileInvoice,
    IconReceipt,
    IconCalendar,
    IconChevronDown,
    IconLogout,
    IconTree,
    IconSettings,
} from "@tabler/icons-react";
import { ColorSchemeToggle } from "@/components/layout/ColorSchemeToggle";
import { YardliIcon } from "../icons/Yardli";
import { OrganizationSwitcher } from "./OrganizationSwitcher";

interface AppShellLayoutProps {
    children: React.ReactNode;
}

const navigationItems = [
    {
        label: "Dashboard",
        href: "/dashboard",
        icon: IconDashboard,
    },
    {
        label: "Customers",
        href: "/customers",
        icon: IconUsers,
    },
    {
        label: "Estimates",
        href: "/estimates",
        icon: IconFileInvoice,
    },
    {
        label: "Invoices",
        href: "/invoices",
        icon: IconReceipt,
    },
    {
        label: "Jobs",
        href: "/jobs",
        icon: IconCalendar,
    },
    {
        label: "Services",
        href: "/services",
        icon: IconTree,
    },
    {
        label: "Settings",
        href: "/settings",
        icon: IconSettings,
    },
];

export function AppShellLayout({ children }: AppShellLayoutProps) {
    const [opened, { toggle, close }] = useDisclosure();
    const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true);
    const { data: session } = useSession();
    const pathname = usePathname();
    const router = useTransitionRouter();
    const handleSignOut = () => {
        signOut().then(() => {
            window.location.href = "/dashboard";
        });
    };

    return (
        <AppShell
            padding="md"
            header={{ height: 60 }}
            navbar={{
                width: 300,
                breakpoint: "sm",
                collapsed: { mobile: !opened, desktop: !desktopOpened },
            }}
        >
            <AppShell.Header>
                <Group h="100%" px="md" justify="space-between">
                    <Group>
                        <Burger
                            opened={opened}
                            onClick={toggle}
                            hiddenFrom="sm"
                            size="sm"
                        />
                        <Burger
                            opened={desktopOpened}
                            onClick={toggleDesktop}
                            visibleFrom="sm"
                            size="sm"
                        />
                        <Group
                            onClick={() => {
                                router.push("/");
                            }}
                            style={{ cursor: "pointer" }}
                        >
                            <YardliIcon height={20} width={20} fill="#828282" />
                            <Title order={3} c="dimmed">
                                Yardli
                            </Title>
                        </Group>
                    </Group>

                    <Group>
                        {session?.user && <OrganizationSwitcher />}
                        <ColorSchemeToggle />

                        {session?.user && (
                            <Menu shadow="md" width={200}>
                                <Menu.Target>
                                    <UnstyledButton>
                                        <Group gap="sm">
                                            <Avatar
                                                src={session.user.image}
                                                alt={
                                                    session.user.name || "User"
                                                }
                                                radius="xl"
                                                size="sm"
                                            />
                                            <Box
                                                style={{ flex: 1 }}
                                                visibleFrom="sm"
                                            >
                                                <Text size="sm" fw={500}>
                                                    {session.user.name ||
                                                        "User"}
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
            </AppShell.Header>

            <AppShell.Navbar>
                <AppShell.Section grow>
                    {navigationItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <NavLink
                                key={item.href}
                                component={Link}
                                href={item.href}
                                label={item.label}
                                onClick={() => close()}
                                leftSection={
                                    <item.icon
                                        style={{
                                            width: rem(16),
                                            height: rem(16),
                                        }}
                                    />
                                }
                                active={isActive}
                                variant="filled"
                                mb="xs"
                            />
                        );
                    })}
                </AppShell.Section>

                {/* Footer section in navbar */}
                <AppShell.Section>
                    <Divider mb="md" />
                    <Group justify="center" gap="lg" mb="md">
                        <Anchor
                            component={Link}
                            href="/privacy"
                            size="xs"
                            c="dimmed"
                        >
                            Privacy
                        </Anchor>
                        <Anchor
                            component={Link}
                            href="/terms"
                            size="xs"
                            c="dimmed"
                        >
                            Terms
                        </Anchor>
                    </Group>
                    <Text size="xs" c="dimmed" ta="center" mb="sm">
                        © {new Date().getFullYear()} Yardli
                    </Text>
                </AppShell.Section>
            </AppShell.Navbar>

            <AppShell.Main>{children}</AppShell.Main>
        </AppShell>
    );
}
