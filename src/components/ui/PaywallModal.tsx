"use client";
import { useState, useCallback } from "react";
import {
    Modal,
    Stack,
    Text,
    Group,
    Button,
    Alert,
    Paper,
    Badge,
} from "@mantine/core";
import { IconCrown, IconLock, IconArrowRight } from "@tabler/icons-react";
import { useSubscription } from "@/hooks/useSubscription";
import {
    SubscriptionPlanId,
    SUBSCRIPTION_PLANS,
} from "@/lib/subscription-types";

interface PaywallModalProps {
    opened: boolean;
    onClose: () => void;
    requiredPlan: SubscriptionPlanId;
    featureName: string;
    featureDescription?: string;
    onUpgrade?: () => void;
}

export function PaywallModal({
    opened,
    onClose,
    requiredPlan,
    featureName,
    featureDescription,
    onUpgrade,
}: PaywallModalProps) {
    const { subscription } = useSubscription();
    const currentPlan = subscription?.planId || "free";
    const requiredPlanInfo = SUBSCRIPTION_PLANS[requiredPlan];

    const handleUpgrade = () => {
        onUpgrade?.();
        onClose();
    };

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title={
                <Group gap="sm">
                    <IconCrown
                        size={20}
                        color="var(--mantine-color-yellow-6)"
                    />
                    <Text fw={600}>Upgrade Required</Text>
                </Group>
            }
            size="md"
            centered
        >
            <Stack gap="md">
                {/* Feature Info */}
                <Paper p="md" bg="gray.0" radius="md">
                    <Stack gap="xs">
                        <Text fw={500} size="lg">
                            {featureName}
                        </Text>
                        {featureDescription && (
                            <Text size="sm" c="dimmed">
                                {featureDescription}
                            </Text>
                        )}
                    </Stack>
                </Paper>

                {/* Current vs Required Plan */}
                <Alert
                    icon={<IconLock size={16} />}
                    color="orange"
                    variant="light"
                    title="Subscription Upgrade Required"
                >
                    <Stack gap="xs">
                        <Text size="sm">
                            This feature requires a{" "}
                            <strong>{requiredPlanInfo.planName}</strong>{" "}
                            subscription or higher.
                        </Text>
                        <Group gap="xs">
                            <Text size="sm">Current plan:</Text>
                            <Badge color="gray" variant="light">
                                {SUBSCRIPTION_PLANS[
                                    currentPlan as SubscriptionPlanId
                                ]?.planName || "Free"}
                            </Badge>
                            <IconArrowRight size={14} />
                            <Badge color="blue" variant="filled">
                                {requiredPlanInfo.planName}
                            </Badge>
                        </Group>
                    </Stack>
                </Alert>

                {/* Plan Benefits */}
                <Paper p="md" bg="blue.0" radius="md">
                    <Stack gap="xs">
                        <Text fw={500} size="sm">
                            {requiredPlanInfo.planName} includes:
                        </Text>
                        <Stack gap="xs">
                            {requiredPlanInfo.features.map((feature, index) => (
                                <Text key={index} size="sm" c="dimmed">
                                    •{" "}
                                    {feature
                                        .replace(/_/g, " ")
                                        .replace(/\b\w/g, (l) =>
                                            l.toUpperCase()
                                        )}
                                </Text>
                            ))}
                        </Stack>
                        <Group justify="apart" mt="sm">
                            <Text fw={600}>
                                ${requiredPlanInfo.amount}/month
                            </Text>
                            {requiredPlanInfo.yearlyDiscount > 0 && (
                                <Badge color="green" variant="light">
                                    Save {requiredPlanInfo.yearlyDiscount}%
                                    yearly
                                </Badge>
                            )}
                        </Group>
                    </Stack>
                </Paper>

                {/* Actions */}
                <Group justify="flex-end" gap="sm">
                    <Button variant="outline" onClick={onClose}>
                        Maybe Later
                    </Button>
                    <Button
                        onClick={handleUpgrade}
                        leftSection={<IconCrown size={16} />}
                    >
                        Upgrade Now
                    </Button>
                </Group>
            </Stack>
        </Modal>
    );
}

// Hook for paywall functionality
export function usePaywallModal() {
    const [modalState, setModalState] = useState<{
        opened: boolean;
        requiredPlan?: SubscriptionPlanId | null;
        featureName: string;
        featureDescription?: string;
        onUpgrade?: () => void;
    }>({
        opened: false,
        requiredPlan: undefined,
        featureName: "",
    });

    const { subscription } = useSubscription();
    const currentPlan = subscription?.planId || "free";

    const hasAccess = useCallback(
        (requiredPlan: SubscriptionPlanId): boolean => {
            // Define subscription level hierarchy
            const planHierarchy: Record<SubscriptionPlanId, number> = {
                free: 0,
                basic: 1,
                pro: 2,
                enterprise: 3,
            };

            const currentLevel =
                planHierarchy[currentPlan as SubscriptionPlanId] || 0;
            const requiredLevel = planHierarchy[requiredPlan];
            return currentLevel >= requiredLevel;
        },
        [currentPlan]
    );

    const checkAccess = useCallback(
        (
            requiredPlan: SubscriptionPlanId,
            featureName: string,
            featureDescription?: string,
            onUpgrade?: () => void
        ): boolean => {
            if (hasAccess(requiredPlan)) {
                return true;
            }

            // Show paywall modal
            setModalState({
                opened: true,
                requiredPlan,
                featureName,
                featureDescription,
                onUpgrade,
            });

            return false;
        },
        [hasAccess]
    );

    const closeModal = useCallback(() => {
        setModalState((prev) => ({ ...prev, opened: false }));
    }, []);

    const PaywallModalComponent = useCallback(
        () => (
            <PaywallModal
                opened={modalState.opened}
                onClose={closeModal}
                requiredPlan={modalState.requiredPlan!}
                featureName={modalState.featureName}
                featureDescription={modalState.featureDescription}
                onUpgrade={modalState.onUpgrade}
            />
        ),
        [modalState, closeModal]
    );

    return {
        checkAccess,
        hasAccess,
        PaywallModal: PaywallModalComponent,
        currentPlan,
    };
}
