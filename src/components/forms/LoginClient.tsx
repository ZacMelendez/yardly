"use client";
import { Button } from "@mantine/core";
import { IconBrandGoogle } from "@tabler/icons-react";
import { signIn } from "@/lib/auth-client";
import { useSearchParams } from "next/navigation";

export default function LoginClient() {
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get("callbackUrl") || "/";

    return (
        <Button
            onClick={() =>
                signIn.social({
                    provider: "google",
                    callbackURL: callbackUrl,
                })
            }
            size="lg"
            radius="md"
            fullWidth
            leftSection={<IconBrandGoogle size={20} />}
            variant="filled"
            color="blue"
            style={{
                backgroundColor: "#4285f4",
                "&:hover": {
                    backgroundColor: "#3367d6",
                },
            }}
        >
            Continue with Google
        </Button>
    );
}
