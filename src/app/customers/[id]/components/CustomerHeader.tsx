"use client";

import React from "react";
import { Group, Title, ActionIcon, Button } from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";
import { useTransitionRouter } from "next-view-transitions";
import { Customer } from "@/lib/atoms";
import CustomersClient from "@/components/forms/CustomersClient";

export function CustomerHeader({ customer }: { customer: Customer }) {
    const router = useTransitionRouter();

    return (
        <Group justify="space-between" align="center">
            <Group gap="sm">
                <ActionIcon
                    variant="subtle"
                    size="lg"
                    onClick={() => router.back()}
                >
                    <IconArrowLeft size={20} />
                </ActionIcon>
                <Title order={2}>{customer.name}</Title>
            </Group>
            <CustomersClient
                customer={customer}
                trigger={<Button variant="light">Edit Customer</Button>}
            />
        </Group>
    );
}
