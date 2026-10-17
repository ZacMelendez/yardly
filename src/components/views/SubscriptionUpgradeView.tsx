"use client";
import { useState } from "react";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import {
    Title,
    Text,
    Card,
    Group,
    Button,
    Badge,
    SegmentedControl,
    Paper,
    Center,
    Divider,
    Loader,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconCheck } from "@tabler/icons-react";
import {
    SUBSCRIPTION_PLANS,
    FEATURE_DESCRIPTIONS,
    SubscriptionPlanId,
    BillingCycle,
    getPlanPricing,
} from "@/lib/subscription-types";
import { useSubscription } from "@/hooks/useSubscription";
import PaymentModal from "@/components/ui/PaymentModal";
import styles from "./SubscriptionUpgradeView.module.css";

const PLAN_COLORS = {
    free: "gray",
    basic: "blue",
    pro: "green",
    enterprise: "violet",
} as const;

export default function SubscriptionUpgradeView() {
    const { data: session } = useSession();
    const router = useRouter();
    const {
        subscription: currentSubscription,
        isLoading: subscriptionLoading,
    } = useSubscription();

    const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");
    const [isUpgrading, setIsUpgrading] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlanId | null>(
        null,
    );
    const [paymentModalOpened, setPaymentModalOpened] = useState(false);
    const [paymentPlan, setPaymentPlan] = useState<{
        planId: SubscriptionPlanId;
        planName: string;
        amount: number;
    } | null>(null);

    const handleUpgrade = async (planId: SubscriptionPlanId) => {
        if (!session?.user?.id) {
            notifications.show({
                title: "Authentication Required",
                message: "Please sign in to upgrade your subscription",
                color: "red",
            });
            return;
        }

        // For free plan, handle immediately without payment
        if (planId === "free") {
            setIsUpgrading(true);
            setSelectedPlan(planId);

            try {
                const response = await fetch("/api/subscription/upgrade", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        planId,
                        billingCycle,
                    }),
                });

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(
                        result.error || "Failed to update subscription",
                    );
                }

                notifications.show({
                    title: "Subscription Updated!",
                    message: result.message,
                    color: "green",
                    icon: <IconCheck size={16} />,
                });

                router.push("/dashboard");
            } catch (error) {
                console.error("Upgrade error:", error);
                notifications.show({
                    title: "Update Failed",
                    message:
                        error instanceof Error
                            ? error.message
                            : "An unexpected error occurred",
                    color: "red",
                });
            } finally {
                setIsUpgrading(false);
                setSelectedPlan(null);
            }
            return;
        }

        // For paid plans, show payment modal
        const plan = SUBSCRIPTION_PLANS[planId];
        const pricing = getPlanPricing(planId, billingCycle);

        if (!pricing) {
            notifications.show({
                title: "Error",
                message: "Unable to calculate pricing for selected plan",
                color: "red",
            });
            return;
        }

        const amount =
            billingCycle === "yearly" ? pricing.yearly : pricing.monthly;

        setPaymentPlan({
            planId,
            planName: plan.planName,
            amount,
        });
        setPaymentModalOpened(true);
    };

    const handlePaymentSuccess = async () => {
        if (!paymentPlan) return;

        setIsUpgrading(true);
        setSelectedPlan(paymentPlan.planId);

        try {
            const response = await fetch("/api/subscription/upgrade", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    planId: paymentPlan.planId,
                    billingCycle,
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.error || "Failed to upgrade subscription",
                );
            }

            notifications.show({
                title: "Subscription Upgraded!",
                message: result.message,
                color: "green",
                icon: <IconCheck size={16} />,
            });

            router.push("/dashboard");
        } catch (error) {
            console.error("Upgrade error:", error);
            notifications.show({
                title: "Upgrade Failed",
                message:
                    error instanceof Error
                        ? error.message
                        : "An unexpected error occurred",
                color: "red",
            });
        } finally {
            setIsUpgrading(false);
            setSelectedPlan(null);
            setPaymentPlan(null);
        }
    };

    const renderPlanCard = (planId: SubscriptionPlanId) => {
        const plan = SUBSCRIPTION_PLANS[planId];
        const pricing = getPlanPricing(planId, billingCycle);
        const color = PLAN_COLORS[planId];
        const isCurrentPlan = currentSubscription?.planId === planId;
        const isUpgradingThis = isUpgrading && selectedPlan === planId;

        if (!pricing) return null;

        const monthlyPrice =
            billingCycle === "yearly" ? pricing.yearlyMonthly : pricing.monthly;
        const yearlyTotal = pricing.yearly;
        const savings = pricing.savings;

        return (
            <Card
                key={planId}
                className={`${styles.planCard} ${
                    plan.popular ? styles.planCardPopular : ""
                }`}
                style={
                    {
                        "--plan-color": `var(--mantine-color-${color}-6)`,
                        "--plan-color-light": `var(--mantine-color-${color}-2)`,
                    } as React.CSSProperties
                }
            >
                <div className={styles.planCardContent}>
                    <div className={styles.planHeader}>
                        <Title
                            order={2}
                            className={styles.planName}
                            style={{ color: `var(--mantine-color-${color}-6)` }}
                        >
                            {plan.planName}
                        </Title>
                        <Text className={styles.planDescription}>
                            {plan.description}
                        </Text>

                        <div className={styles.pricingSection}>
                            <div className={styles.priceContainer}>
                                <Text
                                    className={styles.price}
                                    style={{
                                        color: `var(--mantine-color-${color}-6)`,
                                    }}
                                >
                                    ${monthlyPrice.toFixed(0)}
                                </Text>
                                <Text className={styles.priceUnit}>/month</Text>
                            </div>

                            {billingCycle === "yearly" && savings > 0 && (
                                <div className={styles.savingsContainer}>
                                    <Text className={styles.originalPrice}>
                                        ${pricing.monthly.toFixed(0)}/mo
                                    </Text>
                                    <Badge className={styles.savingsBadge}>
                                        Save ${savings.toFixed(0)}/year
                                    </Badge>
                                </div>
                            )}

                            {billingCycle === "yearly" && (
                                <Text className={styles.yearlyBilling}>
                                    Billed ${yearlyTotal.toFixed(0)} annually
                                </Text>
                            )}
                        </div>
                    </div>

                    <div className={styles.planFeatures}>
                        <div className={styles.featureSection}>
                            <Text className={styles.featureSectionTitle}>
                                Plan Limits
                            </Text>
                            <div className={styles.featureList}>
                                <Text className={styles.featureItem}>
                                    {plan.maxCustomers === null
                                        ? "Unlimited customers"
                                        : `${plan.maxCustomers} customers`}
                                </Text>
                                <Text className={styles.featureItem}>
                                    {plan.maxJobs === null
                                        ? "Unlimited jobs"
                                        : `${plan.maxJobs} jobs`}
                                </Text>
                                <Text className={styles.featureItem}>
                                    {plan.maxInvoicesPerMonth === null
                                        ? "Unlimited invoices/month"
                                        : `${plan.maxInvoicesPerMonth} invoices/month`}
                                </Text>
                            </div>
                        </div>

                        <Divider className={styles.divider} />

                        <div className={styles.featureSection}>
                            <Text className={styles.featureSectionTitle}>
                                Features
                            </Text>
                            <div className={styles.featureList}>
                                {plan.features.map((feature) => (
                                    <Text
                                        key={feature}
                                        className={styles.featureItem}
                                    >
                                        {FEATURE_DESCRIPTIONS[
                                            feature as keyof typeof FEATURE_DESCRIPTIONS
                                        ] || feature}
                                    </Text>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div style={{ marginTop: "auto" }}>
                        {isCurrentPlan ? (
                            <Button
                                className={styles.planButton}
                                variant="light"
                                color={color}
                                disabled
                            >
                                Current Plan
                            </Button>
                        ) : (
                            <Button
                                className={styles.planButton}
                                color={color}
                                variant={plan.popular ? "filled" : "outline"}
                                loading={isUpgradingThis}
                                onClick={() => handleUpgrade(planId)}
                                disabled={isUpgrading}
                            >
                                Select
                            </Button>
                        )}
                    </div>
                </div>
            </Card>
        );
    };

    if (subscriptionLoading) {
        return (
            <div className={styles.container}>
                <Center h={200}>
                    <Loader size="md" />
                </Center>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <Title order={1} className={styles.title}>
                    Choose Your Plan
                </Title>
                <Text className={styles.subtitle}>
                    Upgrade your Yardli experience with more features and higher
                    limits
                </Text>

                <Paper
                    p="lg"
                    radius="lg"
                    mb="xl"
                    style={{ display: "inline-block" }}
                    withBorder
                >
                    <Group gap="lg" align="center">
                        <Text size="md" fw={500}>
                            Billing Cycle:
                        </Text>
                        <div className={styles.billingCycleContainer}>
                            <SegmentedControl
                                value={billingCycle}
                                onChange={(value) =>
                                    setBillingCycle(value as BillingCycle)
                                }
                                data={[
                                    { label: "Monthly", value: "monthly" },
                                    { label: "Yearly", value: "yearly" },
                                ]}
                            />
                            <Badge className={styles.billingCycleBadge}>
                                Save 30%
                            </Badge>
                        </div>
                    </Group>
                </Paper>
            </div>

            <div className={styles.plansGrid}>
                {(Object.keys(SUBSCRIPTION_PLANS) as SubscriptionPlanId[]).map(
                    (planId) => renderPlanCard(planId),
                )}
            </div>

            <Paper className={styles.footer}>
                <Title order={3} className={styles.footerTitle}>
                    All Plans Include
                </Title>
                <div className={styles.footerFeatures}>
                    <div className={styles.footerFeature}>
                        <Text className={styles.footerFeatureTitle}>
                            Secure data encryption
                        </Text>
                        <Text className={styles.footerFeatureDescription}>
                            Your data is protected with enterprise-grade
                            security
                        </Text>
                    </div>
                    <div className={styles.footerFeature}>
                        <Text className={styles.footerFeatureTitle}>
                            Email support
                        </Text>
                        <Text className={styles.footerFeatureDescription}>
                            Get help when you need it from our support team
                        </Text>
                    </div>
                    <div className={styles.footerFeature}>
                        <Text className={styles.footerFeatureTitle}>
                            Regular updates
                        </Text>
                        <Text className={styles.footerFeatureDescription}>
                            Continuous improvements and new features
                        </Text>
                    </div>
                </div>
            </Paper>

            <div className={styles.supportText}>
                <Text>
                    Need help choosing a plan? Contact our support team for
                    personalized recommendations.
                </Text>
            </div>

            {paymentPlan && (
                <PaymentModal
                    opened={paymentModalOpened}
                    onClose={() => {
                        setPaymentModalOpened(false);
                        setPaymentPlan(null);
                    }}
                    planId={paymentPlan.planId}
                    planName={paymentPlan.planName}
                    amount={paymentPlan.amount}
                    billingCycle={billingCycle}
                    onSuccess={handlePaymentSuccess}
                />
            )}
        </div>
    );
}
