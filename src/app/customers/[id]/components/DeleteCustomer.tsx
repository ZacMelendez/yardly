"use client";

import { fetchJSON } from "@/lib/fetchJson";
import { Button } from "@mantine/core";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { IconTrash } from "@tabler/icons-react";
import { useMutation } from "@tanstack/react-query";
import { useTransitionRouter } from "next-view-transitions";
import { useSubscriptionLimits } from "@/hooks/useSubscriptionLimits";

export function DeleteCustomer({ id }: { id: string }) {
    const router = useTransitionRouter();
    const { handleLimitError } = useSubscriptionLimits();
    const deleteCustomerMutation = useMutation({
        mutationFn: (id: string) =>
            fetchJSON(`/api/customers/${id}`, {
                method: "DELETE",
            }),
        onSuccess: () => {
            router.push("/customers");
        },
        onError: (err) => {
            if (!handleLimitError(err)) {
                notifications.show({
                    title: "Error",
                    message: "Failed to delete customer",
                    color: "red",
                });
            }
        },
    });

    return (
        <Button
            variant="light"
            color="red"
            leftSection={<IconTrash size={16} />}
            w="fit-content"
            ml="auto"
            onClick={() => {
                modals.openConfirmModal({
                    title: "Delete Customer",
                    children: "Are you sure you want to delete this customer?",
                    centered: true,
                    labels: {
                        confirm: "Delete",
                        cancel: "Cancel",
                    },
                    onConfirm: () => {
                        deleteCustomerMutation.mutate(id);
                    },
                });
            }}
        >
            Delete Customer
        </Button>
    );
}
