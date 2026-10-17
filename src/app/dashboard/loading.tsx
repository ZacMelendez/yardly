import React from "react";
import { LoadingOverlay } from "@mantine/core";

export default function DashboardLoading() {
    return (
        <LoadingOverlay
            visible
            zIndex={1000}
            loaderProps={{
                size: "lg",
            }}
            overlayProps={{ radius: "sm", blur: 2 }}
        />
    );
}
