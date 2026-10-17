"use client";
import { useState } from "react";
import {
    Modal,
    Stack,
    Text,
    TextInput,
    Group,
    Button,
    Divider,
    Alert,
    Select,
    Paper,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { IconCreditCard, IconLock, IconInfoCircle } from "@tabler/icons-react";
import { SubscriptionPlanId, BillingCycle } from "@/lib/subscription-types";

interface PaymentModalProps {
    opened: boolean;
    onClose: () => void;
    planId: SubscriptionPlanId;
    planName: string;
    amount: number;
    billingCycle: BillingCycle;
    onSuccess: () => void;
}

interface PaymentForm {
    cardNumber: string;
    expiryDate: string;
    cvv: string;
    nameOnCard: string;
    email: string;
    billingCountry: string;
}

export default function PaymentModal({
    opened,
    onClose,
    planName,
    amount,
    billingCycle,
    onSuccess,
}: PaymentModalProps) {
    const [isProcessing, setIsProcessing] = useState(false);

    const form = useForm<PaymentForm>({
        initialValues: {
            cardNumber: "",
            expiryDate: "",
            cvv: "",
            nameOnCard: "",
            email: "",
            billingCountry: "US",
        },
        validate: {
            cardNumber: (value) => {
                // Basic card number validation (remove spaces and check length)
                const cleaned = value.replace(/\s/g, "");
                return cleaned.length >= 13 && cleaned.length <= 19
                    ? null
                    : "Please enter a valid card number";
            },
            expiryDate: (value) => {
                const pattern = /^(0[1-9]|1[0-2])\/\d{2}$/;
                return pattern.test(value) ? null : "Please enter MM/YY format";
            },
            cvv: (value) => {
                return value.length >= 3 && value.length <= 4
                    ? null
                    : "Please enter a valid CVV";
            },
            nameOnCard: (value) =>
                value.trim().length > 0 ? null : "Name on card is required",
            email: (value) =>
                /^\S+@\S+$/.test(value) ? null : "Please enter a valid email",
        },
    });

    const handleSubmit = async () => {
        setIsProcessing(true);

        try {
            // Simulate payment processing delay
            await new Promise((resolve) => setTimeout(resolve, 2000));

            // In a real implementation, this is where you would:
            // 1. Create a Stripe payment intent
            // 2. Confirm the payment
            // 3. Handle 3D Secure if needed
            // 4. Update the subscription on success

            // For now, we'll just show a success message and call onSuccess
            notifications.show({
                title: "Payment Successful!",
                message: `Successfully upgraded to ${planName}`,
                color: "green",
            });

            onSuccess();
            onClose();
            form.reset();
        } catch {
            notifications.show({
                title: "Payment Failed",
                message:
                    "There was an issue processing your payment. Please try again.",
                color: "red",
            });
        } finally {
            setIsProcessing(false);
        }
    };

    const formatCardNumber = (value: string) => {
        // Add spaces every 4 digits
        const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
        const matches = v.match(/\d{4,16}/g);
        const match = (matches && matches[0]) || "";
        const parts = [];
        for (let i = 0, len = match.length; i < len; i += 4) {
            parts.push(match.substring(i, i + 4));
        }
        if (parts.length) {
            return parts.join(" ");
        } else {
            return v;
        }
    };

    const formatExpiryDate = (value: string) => {
        const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
        if (v.length >= 2) {
            return v.substring(0, 2) + "/" + v.substring(2, 4);
        }
        return v;
    };

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title={
                <Group gap="sm">
                    <IconCreditCard size={20} />
                    <Text fw={600}>Complete Payment</Text>
                </Group>
            }
            size="md"
            centered
        >
            <Stack gap="md">
                {/* Order Summary */}
                <Paper p="md" bg="gray.0" radius="md">
                    <Stack gap="xs">
                        <Group justify="apart">
                            <Text fw={500}>Plan:</Text>
                            <Text>{planName}</Text>
                        </Group>
                        <Group justify="apart">
                            <Text fw={500}>Billing:</Text>
                            <Text>
                                {billingCycle === "yearly"
                                    ? "Annual"
                                    : "Monthly"}
                            </Text>
                        </Group>
                        <Divider />
                        <Group justify="apart">
                            <Text fw={600} size="lg">
                                Total:
                            </Text>
                            <Text fw={600} size="lg">
                                ${amount.toFixed(2)}
                            </Text>
                        </Group>
                    </Stack>
                </Paper>

                {/* Security Notice */}
                <Alert
                    icon={<IconLock size={16} />}
                    color="blue"
                    variant="light"
                    title="Secure Payment"
                >
                    <Text size="sm">
                        Your payment information is encrypted and secure. This
                        is a demo - no actual charges will be made.
                    </Text>
                </Alert>

                {/* Payment Form */}
                <form onSubmit={form.onSubmit(handleSubmit)}>
                    <Stack gap="md">
                        <TextInput
                            label="Card Number"
                            placeholder="1234 5678 9012 3456"
                            required
                            {...form.getInputProps("cardNumber")}
                            onChange={(event) => {
                                const formatted = formatCardNumber(
                                    event.currentTarget.value
                                );
                                form.setFieldValue("cardNumber", formatted);
                            }}
                            maxLength={19}
                        />

                        <Group grow>
                            <TextInput
                                label="Expiry Date"
                                placeholder="MM/YY"
                                required
                                {...form.getInputProps("expiryDate")}
                                onChange={(event) => {
                                    const formatted = formatExpiryDate(
                                        event.currentTarget.value
                                    );
                                    form.setFieldValue("expiryDate", formatted);
                                }}
                                maxLength={5}
                            />
                            <TextInput
                                label="CVV"
                                placeholder="123"
                                required
                                {...form.getInputProps("cvv")}
                                maxLength={4}
                            />
                        </Group>

                        <TextInput
                            label="Name on Card"
                            placeholder="John Doe"
                            required
                            {...form.getInputProps("nameOnCard")}
                        />

                        <TextInput
                            label="Email"
                            placeholder="john@example.com"
                            type="email"
                            required
                            {...form.getInputProps("email")}
                        />

                        <Select
                            allowDeselect={false}
                            label="Country"
                            required
                            data={[
                                { value: "US", label: "United States" },
                                { value: "CA", label: "Canada" },
                                { value: "GB", label: "United Kingdom" },
                                { value: "AU", label: "Australia" },
                                { value: "DE", label: "Germany" },
                                { value: "FR", label: "France" },
                            ]}
                            {...form.getInputProps("billingCountry")}
                        />

                        <Alert
                            icon={<IconInfoCircle size={16} />}
                            color="yellow"
                            variant="light"
                        >
                            <Text size="sm">
                                This is a demo environment. No actual payment
                                will be processed.
                            </Text>
                        </Alert>

                        <Group justify="apart" mt="md">
                            <Button
                                variant="subtle"
                                onClick={onClose}
                                disabled={isProcessing}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                loading={isProcessing}
                                leftSection={<IconLock size={16} />}
                            >
                                {isProcessing
                                    ? "Processing..."
                                    : `Pay $${amount.toFixed(2)}`}
                            </Button>
                        </Group>
                    </Stack>
                </form>
            </Stack>
        </Modal>
    );
}
