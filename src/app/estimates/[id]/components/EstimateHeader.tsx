"use client";

import React, { useState } from "react";
import { useAtomValue } from "jotai";
import { Group, Title, Button, Badge, ActionIcon } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconArrowLeft, IconFileDownload, IconMail } from "@tabler/icons-react";
import { useTransitionRouter } from "next-view-transitions";
import { useRouter } from "next/navigation";
import { notifications } from "@mantine/notifications";
import { initialEstimateDetailAtom, type EstimateDetail } from "@/lib/atoms";
import { fetchJSON } from "@/lib/fetchJson";
import { useSubscriptionLimits } from "@/hooks/useSubscriptionLimits";
import EstimateEditModal from "./EstimateEditModal";

const statusColors: Record<string, string> = {
    draft: "gray",
    sent: "blue",
    accepted: "green",
    rejected: "red",
};

interface EstimateHeaderProps {
    estimate: EstimateDetail;
}

export default function EstimateHeader({
    estimate: initialEstimate,
}: EstimateHeaderProps) {
    const estimate = useAtomValue(initialEstimateDetailAtom) || initialEstimate;
    const transitionRouter = useTransitionRouter();
    const nextRouter = useRouter();
    const { handleLimitError } = useSubscriptionLimits();
    const [editOpened, { open: openEdit, close: closeEdit }] =
        useDisclosure(false);
    const [sending, setSending] = useState(false);

    const hasCustomerEmail = !!estimate.customer?.email?.trim();

    const handleSend = async () => {
        if (!hasCustomerEmail || sending) return;
        setSending(true);
        try {
            await fetchJSON(`/api/estimates/${estimate.id}/send`, {
                method: "POST",
            });
            notifications.show({
                title: "Estimate sent",
                message: `Estimate sent to ${estimate.customer?.email}`,
                color: "green",
            });
            nextRouter.refresh();
        } catch (err) {
            if (!handleLimitError(err)) {
                notifications.show({
                    title: "Error",
                    message:
                        err instanceof Error
                            ? err.message
                            : "Failed to send estimate",
                    color: "red",
                });
            }
        } finally {
            setSending(false);
        }
    };

    return (
        <>
            <Group justify="space-between" align="center">
                <Group gap="sm">
                    <ActionIcon
                        variant="subtle"
                        size="lg"
                        onClick={() => transitionRouter.back()}
                    >
                        <IconArrowLeft size={20} />
                    </ActionIcon>
                    <Title order={2}>{estimate.title}</Title>
                    <Badge
                        color={statusColors[estimate.status]}
                        variant="light"
                        size="lg"
                    >
                        {estimate.status}
                    </Badge>
                </Group>
                <Group gap="xs">
                    <Button
                        variant="light"
                        component="a"
                        href={`/api/estimates/${estimate.id}/pdf`}
                        target="_blank"
                        rel="noopener noreferrer"
                        leftSection={<IconFileDownload size={16} />}
                    >
                        Download PDF
                    </Button>
                    <Button
                        variant="light"
                        leftSection={<IconMail size={16} />}
                        onClick={handleSend}
                        loading={sending}
                        disabled={!hasCustomerEmail}
                        title={
                            !hasCustomerEmail
                                ? "Add an email to this customer to send the estimate"
                                : "Send estimate by email"
                        }
                    >
                        Send
                    </Button>
                    <Button variant="light" onClick={openEdit}>
                        Edit Details
                    </Button>
                </Group>
            </Group>

            <EstimateEditModal
                estimate={estimate}
                opened={editOpened}
                onClose={closeEdit}
            />
        </>
    );
}
