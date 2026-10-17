"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, Title, Text, Button, Stack, Loader } from "@mantine/core";
import { IconCheck } from "@tabler/icons-react";
import { Link } from "next-view-transitions";

type AcceptState = "loading" | "success" | "error";

export default function AcceptEstimatePage() {
    const params = useParams();
    const estimateId = params.id as string | undefined;
    const [state, setState] = useState<AcceptState>("loading");
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!estimateId) {
            setError("Missing estimate id.");
            setState("error");
            return;
        }

        const accept = async () => {
            try {
                const res = await fetch(`/api/estimates/${estimateId}/accept`, {
                    method: "POST",
                });

                if (!res.ok) {
                    const data = (await res.json().catch(() => null)) as
                        | { error?: string }
                        | null;
                    setError(
                        data?.error ||
                            "We were unable to accept this quote. Please contact the business directly.",
                    );
                    setState("error");
                    return;
                }

                setState("success");
            } catch (err) {
                console.error(err);
                setError(
                    "We were unable to accept this quote. Please contact the business directly.",
                );
                setState("error");
            }
        };

        void accept();
    }, [estimateId]);

    if (state === "loading") {
        return (
            <div style={{ padding: "2rem", display: "flex", justifyContent: "center" }}>
                <Loader size="lg" />
            </div>
        );
    }

    return (
        <div style={{ padding: "2rem", maxWidth: 480, margin: "0 auto" }}>
            <Card withBorder padding="lg" radius="md">
                <Stack gap="md" align="center">
                    {state === "success" ? (
                        <>
                            <IconCheck
                                style={{ width: 40, height: 40 }}
                                color="green"
                            />
                            <Title order={3}>Quote accepted</Title>
                            <Text c="dimmed" ta="center">
                                Thanks for confirming this quote. The business
                                has been notified and will follow up with you
                                about next steps.
                            </Text>
                        </>
                    ) : (
                        <>
                            <Title order={3}>Unable to accept quote</Title>
                            <Text c="dimmed" ta="center">
                                {error}
                            </Text>
                        </>
                    )}

                    <Button component={Link} href="/" mt="md">
                        Go to Yardli
                    </Button>
                </Stack>
            </Card>
        </div>
    );
}

