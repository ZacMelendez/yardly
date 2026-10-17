"use client";

import { IconMoon, IconSun } from "@tabler/icons-react";
import {
    ActionIcon,
    Group,
    useComputedColorScheme,
    useMantineColorScheme,
} from "@mantine/core";
import { useEffect, useState } from "react";

export function ColorSchemeToggle() {
    const { setColorScheme } = useMantineColorScheme();
    const computedColorScheme = useComputedColorScheme("light", {
        getInitialValueInEffect: true,
    });
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return null;
    }

    return (
        <Group justify="center">
            <ActionIcon
                onClick={() =>
                    setColorScheme(
                        computedColorScheme === "light" ? "dark" : "light"
                    )
                }
                variant="default"
                size="lg"
                radius="md"
                aria-label="Toggle color scheme"
            >
                <IconSun
                    style={{
                        width: "18px",
                        height: "18px",
                        display:
                            computedColorScheme === "light" ? "block" : "none",
                    }}
                    stroke={1.5}
                />
                <IconMoon
                    style={{
                        width: "18px",
                        height: "18px",
                        display:
                            computedColorScheme === "light" ? "none" : "block",
                    }}
                    stroke={1.5}
                />
            </ActionIcon>
        </Group>
    );
}
