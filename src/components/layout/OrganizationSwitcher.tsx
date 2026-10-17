"use client";

import { Menu, Group, Text, Box, rem } from "@mantine/core";
import { authClient } from "@/lib/auth-client";
import { IconBuilding } from "@tabler/icons-react";

export function OrganizationSwitcher() {
    const { data: organizations, isPending } =
        authClient.useListOrganizations();
    const { data: activeOrg, refetch } = authClient.useActiveOrganization();

    if (isPending || !organizations?.length) return null;

    const handleSetActive = async (orgId: string) => {
        await authClient.organization.setActive({ organizationId: orgId });
        refetch();
        window.location.reload();
    };

    return (
        <Menu shadow="md" width={220}>
            <Menu.Target>
                <Box
                    style={{
                        cursor: "pointer",
                        padding: "4px 8px",
                        borderRadius: 4,
                    }}
                >
                    <Group gap="xs">
                        <IconBuilding
                            style={{ width: rem(16), height: rem(16) }}
                        />
                        <Text size="sm" fw={500} lineClamp={1} maw={140}>
                            {activeOrg?.name ?? "Personal"}
                        </Text>
                    </Group>
                </Box>
            </Menu.Target>
            <Menu.Dropdown>
                {organizations.map((org) => (
                    <Menu.Item
                        key={org.id}
                        leftSection={
                            <IconBuilding
                                style={{ width: rem(14), height: rem(14) }}
                            />
                        }
                        onClick={() => handleSetActive(org.id)}
                    >
                        {org.name}
                        {activeOrg?.id === org.id && " (active)"}
                    </Menu.Item>
                ))}
                <Menu.Divider />
                <Menu.Item
                    component="a"
                    href="/settings/company"
                >
                    Manage companies
                </Menu.Item>
            </Menu.Dropdown>
        </Menu>
    );
}
