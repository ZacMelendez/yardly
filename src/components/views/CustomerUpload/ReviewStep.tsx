"use client";

import { useState } from "react";
import {
    Stack,
    Button,
    Text,
    Group,
    Table,
    ScrollArea,
    Paper,
    Alert,
    Progress,
    Divider,
    Badge,
} from "@mantine/core";
import { IconAlertCircle, IconCheck, IconUpload } from "@tabler/icons-react";
import { CSVRow, ColumnMapping, UploadResult } from "../CustomerUploadView";

interface ReviewStepProps {
    csvData: CSVRow[];
    columnMapping: ColumnMapping;
    onUpload: () => void;
    onBack: () => void;
    isUploading: boolean;
    uploadResult: UploadResult | null;
}

export default function ReviewStep({
    csvData,
    columnMapping,
    onUpload,
    onBack,
    isUploading,
    uploadResult,
}: ReviewStepProps) {
    const [validationErrors, setValidationErrors] = useState<string[]>([]);

    const getMappedData = () => {
        return csvData.map((row, index) => ({
            rowNumber: index + 1,
            name: row[columnMapping.name] || "",
            email: columnMapping.email ? row[columnMapping.email] || "" : "",
            phone: columnMapping.phone ? row[columnMapping.phone] || "" : "",
            address: columnMapping.address
                ? row[columnMapping.address] || ""
                : "",
            notes: columnMapping.notes ? row[columnMapping.notes] || "" : "",
        }));
    };

    const validateData = () => {
        const errors: string[] = [];
        const mappedData = getMappedData();

        // Check for empty names
        const emptyNames = mappedData.filter((row) => !row.name.trim());
        if (emptyNames.length > 0) {
            errors.push(
                `${emptyNames.length} rows have empty names (rows: ${emptyNames
                    .map((r) => r.rowNumber)
                    .join(", ")})`
            );
        }

        // Check for invalid emails
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const invalidEmails = mappedData.filter(
            (row) => row.email && !emailRegex.test(row.email)
        );
        if (invalidEmails.length > 0) {
            errors.push(
                `${
                    invalidEmails.length
                } rows have invalid email addresses (rows: ${invalidEmails
                    .map((r) => r.rowNumber)
                    .join(", ")})`
            );
        }

        setValidationErrors(errors);
        return errors.length === 0;
    };

    const handleUpload = () => {
        if (validateData()) {
            onUpload();
        }
    };

    const mappedData = getMappedData();
    const validRows = mappedData.filter((row) => row.name.trim());
    const invalidRows = mappedData.filter((row) => !row.name.trim());

    return (
        <Stack gap="lg">
            <Paper withBorder p="md">
                <Stack gap="md">
                    <Group justify="space-between">
                        <Text fw={500}>Import Summary</Text>
                        <Badge color="blue" size="lg">
                            {csvData.length} total rows
                        </Badge>
                    </Group>

                    <Group>
                        <Badge color="green" variant="light">
                            {validRows.length} valid rows
                        </Badge>
                        {invalidRows.length > 0 && (
                            <Badge color="red" variant="light">
                                {invalidRows.length} invalid rows
                            </Badge>
                        )}
                    </Group>

                    <Divider />

                    <Text size="sm" fw={500}>
                        Column Mapping:
                    </Text>
                    <Group gap="md">
                        <Text size="sm">
                            <strong>Name:</strong>{" "}
                            {columnMapping.name || "Not mapped"}
                        </Text>
                        {columnMapping.email && (
                            <Text size="sm">
                                <strong>Email:</strong> {columnMapping.email}
                            </Text>
                        )}
                        {columnMapping.phone && (
                            <Text size="sm">
                                <strong>Phone:</strong> {columnMapping.phone}
                            </Text>
                        )}
                        {columnMapping.address && (
                            <Text size="sm">
                                <strong>Address:</strong>{" "}
                                {columnMapping.address}
                            </Text>
                        )}
                        {columnMapping.notes && (
                            <Text size="sm">
                                <strong>Notes:</strong> {columnMapping.notes}
                            </Text>
                        )}
                    </Group>
                </Stack>
            </Paper>

            {validationErrors.length > 0 && (
                <Alert icon={<IconAlertCircle size={16} />} color="red">
                    <Stack gap="xs">
                        <Text fw={500}>Data Validation Issues:</Text>
                        {validationErrors.map((error, index) => (
                            <Text key={index} size="sm">
                                • {error}
                            </Text>
                        ))}
                        <Text size="sm" c="dimmed">
                            Invalid rows will be skipped during import.
                        </Text>
                    </Stack>
                </Alert>
            )}

            <Paper withBorder p="md">
                <Text size="sm" fw={500} mb="md">
                    Preview of data to be imported (first 10 rows):
                </Text>
                <ScrollArea>
                    <Table striped highlightOnHover>
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th>#</Table.Th>
                                <Table.Th>Name</Table.Th>
                                {columnMapping.email && (
                                    <Table.Th>Email</Table.Th>
                                )}
                                {columnMapping.phone && (
                                    <Table.Th>Phone</Table.Th>
                                )}
                                {columnMapping.address && (
                                    <Table.Th>Address</Table.Th>
                                )}
                                {columnMapping.notes && (
                                    <Table.Th>Notes</Table.Th>
                                )}
                                <Table.Th>Status</Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {mappedData.slice(0, 10).map((row) => (
                                <Table.Tr key={row.rowNumber}>
                                    <Table.Td>{row.rowNumber}</Table.Td>
                                    <Table.Td>{row.name || "-"}</Table.Td>
                                    {columnMapping.email && (
                                        <Table.Td>{row.email || "-"}</Table.Td>
                                    )}
                                    {columnMapping.phone && (
                                        <Table.Td>{row.phone || "-"}</Table.Td>
                                    )}
                                    {columnMapping.address && (
                                        <Table.Td>
                                            {row.address || "-"}
                                        </Table.Td>
                                    )}
                                    {columnMapping.notes && (
                                        <Table.Td>{row.notes || "-"}</Table.Td>
                                    )}
                                    <Table.Td>
                                        <Badge
                                            color={
                                                row.name.trim()
                                                    ? "green"
                                                    : "red"
                                            }
                                            variant="light"
                                            size="xs"
                                        >
                                            {row.name.trim()
                                                ? "Valid"
                                                : "Invalid"}
                                        </Badge>
                                    </Table.Td>
                                </Table.Tr>
                            ))}
                        </Table.Tbody>
                    </Table>
                </ScrollArea>
            </Paper>

            {isUploading && (
                <Paper withBorder p="md">
                    <Stack gap="md">
                        <Group>
                            <IconUpload className="animate-spin" />
                            <Text fw={500}>Uploading customers...</Text>
                        </Group>
                        <Progress value={100} animated />
                        <Text size="sm" c="dimmed">
                            Please wait while we process your data.
                        </Text>
                    </Stack>
                </Paper>
            )}

            {uploadResult && (
                <Alert
                    icon={
                        uploadResult.success ? (
                            <IconCheck size={16} />
                        ) : (
                            <IconAlertCircle size={16} />
                        )
                    }
                    color={uploadResult.success ? "green" : "red"}
                >
                    <Stack gap="xs">
                        <Text fw={500}>{uploadResult.message}</Text>
                        {uploadResult.success && (
                            <Text size="sm">
                                Successfully created {uploadResult.createdCount}{" "}
                                customers.
                                {uploadResult.errorCount > 0 &&
                                    ` ${uploadResult.errorCount} rows had errors and were skipped.`}
                            </Text>
                        )}
                        {uploadResult.errors.length > 0 && (
                            <Stack gap="xs">
                                <Text size="sm" fw={500}>
                                    Errors:
                                </Text>
                                {uploadResult.errors
                                    .slice(0, 5)
                                    .map((error, index) => (
                                        <Text key={index} size="xs">
                                            • {error}
                                        </Text>
                                    ))}
                                {uploadResult.errors.length > 5 && (
                                    <Text size="xs" c="dimmed">
                                        ... and {uploadResult.errors.length - 5}{" "}
                                        more errors
                                    </Text>
                                )}
                            </Stack>
                        )}
                    </Stack>
                </Alert>
            )}

            <Group justify="space-between">
                <Button variant="light" onClick={onBack} disabled={isUploading}>
                    Back
                </Button>
                <Button
                    onClick={handleUpload}
                    loading={isUploading}
                    disabled={isUploading || uploadResult?.success}
                    leftSection={<IconUpload size={16} />}
                >
                    {isUploading ? "Uploading..." : "Import Customers"}
                </Button>
            </Group>
        </Stack>
    );
}
