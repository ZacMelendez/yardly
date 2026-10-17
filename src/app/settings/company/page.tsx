"use client";

import { useState } from "react";
import {
    Card,
    Title,
    Text,
    Button,
    TextInput,
    Group,
    Stack,
    Table,
    ActionIcon,
    Select,
    Loader,
    Alert,
    Box,
    rem,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { authClient } from "@/lib/auth-client";
import {
    IconBuilding,
    IconPlus,
    IconUserPlus,
    IconTrash,
    IconRefresh,
} from "@tabler/icons-react";

function slugify(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
}

export default function CompanySettingsPage() {
    const [isCreating, setIsCreating] = useState(false);
    const [isInviting, setIsInviting] = useState(false);
    const [inviteError, setInviteError] = useState<string | null>(null);

    const { data: organizations, isPending: orgsLoading } =
        authClient.useListOrganizations();
    const { data: activeOrg, refetch: refetchActive } =
        authClient.useActiveOrganization();

    const createForm = useForm({
        initialValues: { name: "", slug: "" },
        validate: {
            name: (v) => (!v?.trim() ? "Name is required" : null),
            slug: (v) => (!v?.trim() ? "Slug is required" : null),
        },
    });

    const inviteForm = useForm({
        initialValues: { email: "", role: "member" as "owner" | "admin" | "member" },
        validate: {
            email: (v) =>
                !v?.trim()
                    ? "Email is required"
                    : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
                      ? "Invalid email"
                      : null,
        },
    });

    const handleCreateCompany = async (values: {
        name: string;
        slug: string;
    }) => {
        setIsCreating(true);
        try {
            const { data, error } = await authClient.organization.create({
                name: values.name.trim(),
                slug: values.slug.trim(),
                keepCurrentActiveOrganization: false,
            });
            if (error) throw new Error(error.message || "Failed to create company");
            if (data?.id) {
                createForm.reset();
                refetchActive();
                // Provision Resend API key so this org can send emails under its own name
                await fetch("/api/organizations/provision-resend", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ organizationId: data.id }),
                });
            }
        } catch (err) {
            createForm.setFieldError(
                "slug",
                err instanceof Error ? err.message : "Failed to create company"
            );
        } finally {
            setIsCreating(false);
        }
    };

    const handleInviteMember = async (values: {
        email: string;
        role: "owner" | "admin" | "member";
    }) => {
        if (!activeOrg?.id) return;
        setIsInviting(true);
        setInviteError(null);
        try {
            const { error } = await authClient.organization.inviteMember({
                email: values.email.trim(),
                role: values.role,
                organizationId: activeOrg.id,
            });
            if (error) throw new Error(error.message || "Failed to invite");
            inviteForm.reset();
            refetchActive();
        } catch (err) {
            setInviteError(
                err instanceof Error ? err.message : "Failed to invite member"
            );
        } finally {
            setIsInviting(false);
        }
    };

    const handleSetActive = async (orgId: string) => {
        await authClient.organization.setActive({ organizationId: orgId });
        refetchActive();
    };

    const handleRemoveMember = async (memberId: string) => {
        if (!activeOrg?.id) return;
        try {
            await authClient.organization.removeMember({
                organizationId: activeOrg.id,
                memberIdOrEmail: memberId,
            });
            refetchActive();
        } catch (err) {
            console.error("Failed to remove member:", err);
        }
    };

    const handleUpdateRole = async (
        memberId: string,
        newRole: "owner" | "admin" | "member"
    ) => {
        if (!activeOrg?.id) return;
        try {
            await authClient.organization.updateMemberRole({
                organizationId: activeOrg.id,
                memberId,
                role: newRole,
            });
            refetchActive();
        } catch (err) {
            console.error("Failed to update role:", err);
        }
    };

    if (orgsLoading) {
        return (
            <Box py="xl" ta="center">
                <Loader size="lg" />
            </Box>
        );
    }

    return (
        <Stack gap="lg">
            <Title order={2}>Company</Title>

            <Card withBorder padding="lg">
                <Group justify="space-between" mb="md">
                    <Title order={4}>Your companies</Title>
                    <Button
                        size="xs"
                        variant="subtle"
                        leftSection={<IconRefresh style={{ width: rem(14) }} />}
                        onClick={() => refetchActive()}
                    >
                        Refresh
                    </Button>
                </Group>

                {organizations && organizations.length > 0 ? (
                    <Stack gap="sm">
                        {organizations.map((org) => (
                            <Group
                                key={org.id}
                                justify="space-between"
                                p="sm"
                                style={{
                                    borderRadius: 4,
                                    backgroundColor:
                                        activeOrg?.id === org.id
                                            ? "var(--mantine-color-default-hover)"
                                            : undefined,
                                }}
                            >
                                <Group>
                                    <IconBuilding
                                        style={{ width: rem(20), height: rem(20) }}
                                    />
                                    <div>
                                        <Text fw={500}>{org.name}</Text>
                                        <Text size="xs" c="dimmed">
                                            {org.slug}
                                        </Text>
                                    </div>
                                </Group>
                                <Button
                                    size="xs"
                                    variant={
                                        activeOrg?.id === org.id
                                            ? "filled"
                                            : "light"
                                    }
                                    onClick={() => handleSetActive(org.id)}
                                >
                                    {activeOrg?.id === org.id
                                        ? "Active"
                                        : "Switch to this company"}
                                </Button>
                            </Group>
                        ))}
                    </Stack>
                ) : (
                    <Text c="dimmed" size="sm">
                        No companies yet. Create one below.
                    </Text>
                )}
            </Card>

            <Card withBorder padding="lg">
                <Title order={4} mb="md">
                    Create company
                </Title>
                <form
                    onSubmit={createForm.onSubmit((values) => {
                        handleCreateCompany(values);
                    })}
                >
                    <Stack gap="sm">
                        <TextInput
                            label="Company name"
                            placeholder="Acme Landscaping"
                            {...createForm.getInputProps("name")}
                            onChange={(e) => {
                                createForm.setFieldValue(
                                    "name",
                                    e.target.value
                                );
                                if (!createForm.values.slug) {
                                    createForm.setFieldValue(
                                        "slug",
                                        slugify(e.target.value)
                                    );
                                }
                            }}
                        />
                        <TextInput
                            label="Slug (URL-friendly identifier)"
                            placeholder="acme-landscaping"
                            {...createForm.getInputProps("slug")}
                        />
                        <Button
                            type="submit"
                            loading={isCreating}
                            leftSection={
                                <IconPlus style={{ width: rem(16) }} />
                            }
                        >
                            Create company
                        </Button>
                    </Stack>
                </form>
            </Card>

            {activeOrg && (
                <>
                    <Card withBorder padding="lg">
                        <Title order={4} mb="md">
                            Team members
                        </Title>

                        {inviteError && (
                            <Alert
                                color="red"
                                mb="md"
                                onClose={() => setInviteError(null)}
                                withCloseButton
                            >
                                {inviteError}
                            </Alert>
                        )}

                        <form
                            onSubmit={inviteForm.onSubmit((values) => {
                                handleInviteMember(values);
                            })}
                        >
                            <Group align="flex-end" mb="md">
                                <TextInput
                                    placeholder="colleague@example.com"
                                    {...inviteForm.getInputProps("email")}
                                    style={{ flex: 1 }}
                                />
                                <Select
                                    data={[
                                        { value: "member", label: "Member" },
                                        { value: "admin", label: "Admin" },
                                        { value: "owner", label: "Owner" },
                                    ]}
                                    {...inviteForm.getInputProps("role")}
                                    style={{ width: 120 }}
                                />
                                <Button
                                    type="submit"
                                    loading={isInviting}
                                    leftSection={
                                        <IconUserPlus
                                            style={{ width: rem(16) }}
                                        />
                                    }
                                >
                                    Invite
                                </Button>
                            </Group>
                        </form>

                        <Table>
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th>Member</Table.Th>
                                    <Table.Th>Role</Table.Th>
                                    <Table.Th>Actions</Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {activeOrg.members?.map((member) => (
                                    <Table.Tr key={member.id}>
                                        <Table.Td>
                                            <Text size="sm">
                                                {member.user?.name ||
                                                    member.user?.email ||
                                                    "Unknown"}
                                            </Text>
                                            {member.user?.email && (
                                                <Text size="xs" c="dimmed">
                                                    {member.user.email}
                                                </Text>
                                            )}
                                        </Table.Td>
                                        <Table.Td>
                                            <Select
                                                size="xs"
                                                data={[
                                                    {
                                                        value: "member",
                                                        label: "Member",
                                                    },
                                                    {
                                                        value: "admin",
                                                        label: "Admin",
                                                    },
                                                    {
                                                        value: "owner",
                                                        label: "Owner",
                                                    },
                                                ]}
                                                value={member.role}
                                                onChange={(v) =>
                                                    v &&
                                                    handleUpdateRole(
                                                        member.id,
                                                        v as "owner" | "admin" | "member"
                                                    )
                                                }
                                                style={{ width: 100 }}
                                            />
                                        </Table.Td>
                                        <Table.Td>
                                            <ActionIcon
                                                color="red"
                                                variant="subtle"
                                                onClick={() =>
                                                    handleRemoveMember(member.id)
                                                }
                                            >
                                                <IconTrash size={16} />
                                            </ActionIcon>
                                        </Table.Td>
                                    </Table.Tr>
                                ))}
                            </Table.Tbody>
                        </Table>

                        {(!activeOrg.members || activeOrg.members.length === 0) && (
                            <Text c="dimmed" size="sm" py="md">
                                No members yet. Invite someone above.
                            </Text>
                        )}
                    </Card>
                </>
            )}
        </Stack>
    );
}
