"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, Title, Text, Button, Group, Stack, Loader, Alert } from "@mantine/core";
import { authClient } from "@/lib/auth-client";
import { useSession } from "@/lib/auth-client";
import { IconCheck, IconX } from "@tabler/icons-react";
import { Link } from "next-view-transitions";

export default function InvitePage() {
    const params = useParams();
    const router = useRouter();
    const invitationId = params.invitationId as string;
    const { data: session, isPending: sessionLoading } = useSession();
    const [status, setStatus] = useState<"idle" | "accepting" | "rejecting" | "success" | "error">("idle");
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!sessionLoading && !session?.user && invitationId) {
            router.push(`/login?callbackUrl=${encodeURIComponent(`/invite/${invitationId}`)}`);
        }
    }, [session, sessionLoading, invitationId, router]);

    const handleAccept = async () => {
        if (!invitationId) return;
        setStatus("accepting");
        setError(null);
        try {
            const { error: err } = await authClient.organization.acceptInvitation({
                invitationId,
            });
            if (err) throw new Error(err.message || "Failed to accept invitation");
            setStatus("success");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to accept invitation");
            setStatus("error");
        }
    };

    const handleReject = async () => {
        if (!invitationId) return;
        setStatus("rejecting");
        setError(null);
        try {
            const { error: err } = await authClient.organization.rejectInvitation({
                invitationId,
            });
            if (err) throw new Error(err.message || "Failed to reject invitation");
            setStatus("success");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to reject invitation");
            setStatus("error");
        }
    };

    if (sessionLoading || (!session?.user && invitationId)) {
        return (
            <div style={{ display: "flex", justifyContent: "center", padding: "4rem" }}>
                <Loader size="lg" />
            </div>
        );
    }

    if (!invitationId) {
        return (
            <div style={{ padding: "2rem", maxWidth: 400, margin: "0 auto" }}>
                <Alert color="red" title="Invalid invitation">
                    No invitation ID provided.
                </Alert>
            </div>
        );
    }

    if (status === "success") {
        return (
            <div style={{ padding: "2rem", maxWidth: 400, margin: "0 auto" }}>
                <Card withBorder padding="lg">
                    <Stack gap="md">
                        <Title order={3}>Invitation processed</Title>
                        <Text c="dimmed" size="sm">
                            You can now go to your dashboard or company settings.
                        </Text>
                        <Button component={Link} href="/dashboard">
                            Go to Dashboard
                        </Button>
                    </Stack>
                </Card>
            </div>
        );
    }

    return (
        <div style={{ padding: "2rem", maxWidth: 400, margin: "0 auto" }}>
            <Card withBorder padding="lg">
                <Stack gap="md">
                    <Title order={3}>Organization invitation</Title>
                    <Text c="dimmed" size="sm">
                        You have been invited to join an organization. Would you like to accept?
                    </Text>
                    {error && (
                        <Alert color="red" onClose={() => setError(null)} withCloseButton>
                            {error}
                        </Alert>
                    )}
                    <Group>
                        <Button
                            leftSection={<IconCheck style={{ width: 16 }} />}
                            loading={status === "accepting"}
                            onClick={handleAccept}
                        >
                            Accept
                        </Button>
                        <Button
                            variant="light"
                            color="red"
                            leftSection={<IconX style={{ width: 16 }} />}
                            loading={status === "rejecting"}
                            onClick={handleReject}
                        >
                            Reject
                        </Button>
                    </Group>
                </Stack>
            </Card>
        </div>
    );
}
