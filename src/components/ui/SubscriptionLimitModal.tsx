"use client";

import {
    Modal,
    Text,
    Button,
    Stack,
    Alert,
    List,
    Group,
    Badge,
} from "@mantine/core";
import {
    IconAlertCircle,
    IconCheck,
    IconX,
    IconArrowUp,
} from "@tabler/icons-react";
import { useSubscription } from "@/hooks/useSubscription";
import { useState } from "react";

interface SubscriptionLimitModalProps {
    opened: boolean;
    onClose: () => void;
    limitType: "customers" | "jobs" | "monthlyInvoices" | "feature";
    currentUsage?: number;
    limit?: number;
    feature?: string;
    onUpgrade?: () => void;
}

export default function SubscriptionLimitModal({
    opened,
    onClose,
    limitType,
    currentUsage,
    limit,
    feature,
    onUpgrade,
}: SubscriptionLimitModalProps) {
    const { subscription, limits } = useSubscription();
    const [isUpgrading, setIsUpgrading] = useState(false);

    const getLimitInfo = () => {
        if (limitType === "feature") {
            return {
                title: "Feature Not Available",
                description: `The ${feature} feature is not available in your current plan.`,
                icon: <IconX size={24} />,
                color: "red",
            };
        }

        const limitData = limits?.[limitType];
        const current = currentUsage ?? limitData?.current ?? 0;
        const maxLimit = limit ?? limitData?.limit ?? 0;
        const isAtLimit = limitData?.isAtLimit ?? false;

        return {
            title: `${
                limitType.charAt(0).toUpperCase() + limitType.slice(1)
            } Limit Reached`,
            description: `You have reached your limit of ${maxLimit} ${limitType}.`,
            current,
            maxLimit,
            isAtLimit,
            icon: isAtLimit ? (
                <IconX size={24} />
            ) : (
                <IconAlertCircle size={24} />
            ),
            color: isAtLimit ? "red" : "yellow",
        };
    };

    const limitInfo = getLimitInfo();

    const handleUpgrade = async () => {
        if (onUpgrade) {
            setIsUpgrading(true);
            try {
                await onUpgrade();
            } finally {
                setIsUpgrading(false);
            }
        }
    };

    const getPlanComparison = () => {
        const plans = [
            { name: "Free", customers: 5, jobs: 10, invoices: 5, price: "$0" },
            {
                name: "Basic",
                customers: 50,
                jobs: 100,
                invoices: 50,
                price: "$29.99",
            },
            {
                name: "Pro",
                customers: 200,
                jobs: 500,
                invoices: 200,
                price: "$79.99",
            },
            {
                name: "Enterprise",
                customers: "Unlimited",
                jobs: "Unlimited",
                invoices: "Unlimited",
                price: "$199.99",
            },
        ];

        return plans.map((plan) => {
            const isCurrentPlan = subscription?.planName
                ?.toLowerCase()
                .includes(plan.name.toLowerCase());
            const isRecommended = plan.name === "Pro";

            return (
                <div
                    key={plan.name}
                    style={{
                        padding: "12px",
                        border: isCurrentPlan
                            ? "2px solid #228be6"
                            : "1px solid #e9ecef",
                        borderRadius: "8px",
                        backgroundColor: isCurrentPlan ? "#f8f9fa" : "white",
                        position: "relative",
                    }}
                >
                    {isCurrentPlan && (
                        <Badge
                            color="blue"
                            size="sm"
                            style={{
                                position: "absolute",
                                top: "-8px",
                                right: "8px",
                            }}
                        >
                            Current Plan
                        </Badge>
                    )}
                    {isRecommended && !isCurrentPlan && (
                        <Badge
                            color="green"
                            size="sm"
                            style={{
                                position: "absolute",
                                top: "-8px",
                                right: "8px",
                            }}
                        >
                            Recommended
                        </Badge>
                    )}

                    <Group justify="space-between" mb="xs">
                        <Text fw={600}>{plan.name}</Text>
                        <Text fw={700} c="blue">
                            {plan.price}/mo
                        </Text>
                    </Group>

                    <List size="sm" spacing="xs">
                        <List.Item icon={<IconCheck size={16} />}>
                            {plan.customers} customers
                        </List.Item>
                        <List.Item icon={<IconCheck size={16} />}>
                            {plan.jobs} jobs
                        </List.Item>
                        <List.Item icon={<IconCheck size={16} />}>
                            {plan.invoices} invoices/month
                        </List.Item>
                    </List>
                </div>
            );
        });
    };

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title={limitInfo.title}
            size="lg"
            centered
        >
            <Stack gap="md">
                <Alert
                    icon={limitInfo.icon}
                    color={limitInfo.color}
                    title={limitInfo.description}
                >
                    {limitType !== "feature" &&
                        limitInfo.current !== undefined && (
                            <Text size="sm">
                                Current usage: {limitInfo.current} /{" "}
                                {limitInfo.maxLimit}
                            </Text>
                        )}
                </Alert>

                {limitType === "feature" && (
                    <Text size="sm" c="dimmed">
                        Upgrade your plan to access advanced features like{" "}
                        {feature}.
                    </Text>
                )}

                <div>
                    <Text fw={600} mb="sm">
                        Available Plans
                    </Text>
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns:
                                "repeat(auto-fit, minmax(200px, 1fr))",
                            gap: "12px",
                        }}
                    >
                        {getPlanComparison()}
                    </div>
                </div>

                <Group justify="flex-end" gap="sm">
                    <Button variant="outline" onClick={onClose}>
                        Maybe Later
                    </Button>
                    <Button
                        leftSection={<IconArrowUp size={16} />}
                        onClick={handleUpgrade}
                        loading={isUpgrading}
                        disabled={!onUpgrade}
                    >
                        Upgrade Plan
                    </Button>
                </Group>
            </Stack>
        </Modal>
    );
}
