"use client";
import { useMemo } from "react";
import { Alert, Box, Text, Title } from "@mantine/core";
import {
    MantineReactTable,
    useMantineReactTable,
    type MRT_ColumnDef,
    type MRT_TableOptions,
} from "mantine-react-table";

interface DataTableProps<T extends Record<string, any>> {
    data: T[] | undefined;
    columns: MRT_ColumnDef<T>[];
    isLoading?: boolean;
    isError?: boolean;
    loadingText?: string;
    errorText?: string;
    emptyStateText?: string;
    tableOptions?: Partial<MRT_TableOptions<T>>;
    tableTitle?: string;
    toolbarActions?: React.ReactNode;
}

export default function DataTable<T extends Record<string, any>>({
    data,
    columns,
    isLoading = false,
    isError = false,
    errorText = "Error loading data",
    tableTitle,
    emptyStateText = "No data found",
    tableOptions = {},
    toolbarActions,
}: DataTableProps<T>) {
    const memoizedColumns = useMemo(() => columns, [columns]);
    const memoizedData = useMemo(() => data || [], [data]);

    const table = useMantineReactTable({
        columns: memoizedColumns,
        data: memoizedData,
        enableColumnFilterModes: true,
        enableFacetedValues: true,
        enableGrouping: true,
        enablePinning: true,
        enableRowActions: false,
        initialState: {
            showColumnFilters: false,
            showGlobalFilter: true,
        },
        enableRowSelection: false,
        enableColumnDragging: false,
        enableDensityToggle: false,
        enableFilters: false,
        enableColumnFilters: false,
        enableColumnOrdering: false,
        enableColumnResizing: false,
        enableFullScreenToggle: false,
        renderTopToolbarCustomActions: () => (
            <Box style={{ display: "flex", gap: "16px", padding: "4px" }}>
                <Title order={2}>{tableTitle}</Title>
            </Box>
        ),
        ...(toolbarActions && {
            renderToolbarInternalActions: () => (
                <Box style={{ display: "flex", gap: "16px", padding: "4px" }}>
                    {toolbarActions}
                </Box>
            ),
        }),
        renderEmptyRowsFallback: () => (
            <Alert m="sm" p="md" c="dimmed" ta="center">
                {emptyStateText}
            </Alert>
        ),
        mantinePaperProps: {
            withBorder: false,
            shadow: "none",
        },

        paginationDisplayMode: "pages",
        positionToolbarAlertBanner: "bottom",
        mantineSearchTextInputProps: {
            placeholder: "Search...",
        },
        mantineTableContainerProps: {
            style: {
                height: "calc(100vh - 200px)", // Account for header, navbar, and padding
                overflow: "auto",
            },
        },
        state: {
            isLoading,
        },
        ...tableOptions,
    });

    if (isError) {
        return (
            <Text p="md" c="red">
                {errorText}
            </Text>
        );
    }

    return (
        <Box
            style={{ height: "100%", display: "flex", flexDirection: "column" }}
        >
            <MantineReactTable table={table} />
        </Box>
    );
}
