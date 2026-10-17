"use client";

import { useState, useEffect, useCallback } from "react";
import {
    Stack,
    Button,
    Select,
    Text,
    Group,
    Table,
    ScrollArea,
    Paper,
    Alert,
    Notification,
} from "@mantine/core";
import { IconAlertCircle, IconCheck } from "@tabler/icons-react";
import { CSVRow, ColumnMapping } from "../CustomerUploadView";

interface ColumnMappingStepProps {
    csvHeaders: string[];
    csvData: CSVRow[];
    columnMapping: ColumnMapping;
    onMappingChange: (mapping: ColumnMapping) => void;
    onNext: (mapping: ColumnMapping) => void;
    onBack: () => void;
}

const CUSTOMER_FIELDS = [
    { value: "name", label: "Name (Required)", required: true },
    { value: "email", label: "Email", required: false },
    { value: "phone", label: "Phone", required: false },
    { value: "address", label: "Address", required: false },
    { value: "notes", label: "Notes", required: false },
];

// Auto-mapping patterns for column detection
const AUTO_MAPPING_PATTERNS = {
    name: [
        "name",
        "full name",
        "fullname",
        "customer name",
        "client name",
        "first name",
        "last name",
        "firstname",
        "lastname",
        "fname",
        "lname",
    ],
    email: ["email", "email address", "e-mail", "e_mail", "emailaddr", "mail"],
    phone: [
        "phone",
        "phone number",
        "telephone",
        "tel",
        "mobile",
        "cell",
        "phone_num",
        "phonenumber",
        "contact number",
    ],
    address: [
        "address",
        "street address",
        "street",
        "location",
        "addr",
        "full address",
        "mailing address",
        "physical address",
    ],
    notes: [
        "notes",
        "note",
        "comments",
        "comment",
        "description",
        "desc",
        "remarks",
        "additional info",
        "special instructions",
        "memo",
    ],
};

export default function ColumnMappingStep({
    csvHeaders,
    csvData,
    columnMapping,
    onMappingChange,
    onNext,
    onBack,
}: ColumnMappingStepProps) {
    const [errors, setErrors] = useState<string[]>([]);
    const [showAutoMapNotification, setShowAutoMapNotification] =
        useState(false);
    const [autoMappedFields, setAutoMappedFields] = useState<string[]>([]);

    // Auto-mapping function
    const performAutoMapping = useCallback((): {
        newMapping: ColumnMapping;
        mappedFields: string[];
    } => {
        const newMapping: ColumnMapping = { ...columnMapping };
        const mappedFields: string[] = [];

        // Check each CSV header against our patterns
        csvHeaders.forEach((header) => {
            const normalizedHeader = header.toLowerCase().trim();

            // Check each field type
            Object.entries(AUTO_MAPPING_PATTERNS).forEach(
                ([fieldType, patterns]) => {
                    const fieldKey = fieldType as keyof ColumnMapping;

                    // Skip if already mapped
                    if (newMapping[fieldKey]) return;

                    // Check if header matches any pattern for this field type
                    const isMatch = patterns.some(
                        (pattern) =>
                            normalizedHeader.includes(pattern) ||
                            pattern.includes(normalizedHeader)
                    );

                    if (isMatch) {
                        newMapping[fieldKey] = header;
                        mappedFields.push(fieldType);
                    }
                }
            );
        });

        return { newMapping, mappedFields };
    }, [columnMapping, csvHeaders]);

    // Auto-mapping effect
    useEffect(() => {
        // Only auto-map if no fields are currently mapped
        const hasAnyMapping = Object.values(columnMapping).some(
            (value) => value !== ""
        );

        if (!hasAnyMapping && csvHeaders.length > 0) {
            const { newMapping, mappedFields } = performAutoMapping();

            if (mappedFields.length > 0) {
                onMappingChange(newMapping);
                setAutoMappedFields(mappedFields);
                setShowAutoMapNotification(true);

                // Hide notification after 10 seconds
                setTimeout(() => {
                    setShowAutoMapNotification(false);
                }, 10000);
            }
        }
    }, [csvHeaders, columnMapping, onMappingChange, performAutoMapping]);

    const handleMappingChange = (field: keyof ColumnMapping, value: string) => {
        const newMapping = { ...columnMapping, [field]: value };
        onMappingChange(newMapping);

        // Clear errors when user makes changes
        if (errors.length > 0) {
            setErrors([]);
        }
    };

    const validateMapping = (): boolean => {
        const newErrors: string[] = [];

        // Check if required field (name) is mapped
        if (!columnMapping.name) {
            newErrors.push(
                "Name field is required and must be mapped to a CSV column"
            );
        }

        // Check for duplicate mappings
        const mappedColumns = Object.values(columnMapping).filter(Boolean);
        const uniqueMappedColumns = [...new Set(mappedColumns)];
        if (mappedColumns.length !== uniqueMappedColumns.length) {
            newErrors.push(
                "Each CSV column can only be mapped to one customer field"
            );
        }

        setErrors(newErrors);
        return newErrors.length === 0;
    };

    const handleNext = () => {
        if (validateMapping()) {
            onNext(columnMapping);
        }
    };

    const getPreviewData = () => {
        if (!columnMapping.name) return [];

        return csvData.map((row) => ({
            ...row,
            _mappedName: row[columnMapping.name] || "",
            _mappedEmail: columnMapping.email
                ? row[columnMapping.email] || ""
                : "",
            _mappedPhone: columnMapping.phone
                ? row[columnMapping.phone] || ""
                : "",
            _mappedAddress: columnMapping.address
                ? row[columnMapping.address] || ""
                : "",
            _mappedNotes: columnMapping.notes
                ? row[columnMapping.notes] || ""
                : "",
        }));
    };

    const previewData = getPreviewData();

    return (
        <Stack gap="lg">
            <Group justify="space-between" align="center">
                <Text size="sm" c="dimmed">
                    Select which CSV column corresponds to each customer field.
                    Only the Name field is required.
                </Text>
                <Button
                    variant="light"
                    size="xs"
                    onClick={() => {
                        const { newMapping, mappedFields } =
                            performAutoMapping();
                        onMappingChange(newMapping);
                        setAutoMappedFields(mappedFields);
                        setShowAutoMapNotification(true);
                        setTimeout(
                            () => setShowAutoMapNotification(false),
                            10000
                        );
                    }}
                >
                    Auto-map Columns
                </Button>
            </Group>

            {showAutoMapNotification && (
                <Notification
                    icon={<IconCheck size={16} />}
                    color="green"
                    title="Auto-mapping Complete!"
                    onClose={() => setShowAutoMapNotification(false)}
                    withCloseButton
                >
                    <Text size="sm">
                        We automatically mapped {autoMappedFields.length} column
                        {autoMappedFields.length !== 1 ? "s" : ""}:{" "}
                        {autoMappedFields.join(", ")}. You can still change
                        these mappings below if needed.
                    </Text>
                </Notification>
            )}

            {errors.length > 0 && (
                <Alert icon={<IconAlertCircle size={16} />} color="red">
                    <Stack gap="xs">
                        {errors.map((error, index) => (
                            <Text key={index} size="sm">
                                • {error}
                            </Text>
                        ))}
                    </Stack>
                </Alert>
            )}

            <Paper withBorder p="md">
                <Stack gap="md">
                    {CUSTOMER_FIELDS.map((field) => (
                        <Group
                            key={field.value}
                            justify="space-between"
                            align="flex-start"
                        >
                            <div style={{ flex: 1 }}>
                                <Group gap="xs" align="center">
                                    <Text size="sm" fw={500}>
                                        {field.label}
                                        {field.required && (
                                            <Text span c="red">
                                                {" "}
                                                *
                                            </Text>
                                        )}
                                    </Text>
                                    {autoMappedFields.includes(field.value) && (
                                        <Text size="xs" c="green" fw={500}>
                                            (Auto-mapped)
                                        </Text>
                                    )}
                                </Group>
                                <Text size="xs" c="dimmed">
                                    {field.value === "name" &&
                                        "Customer's full name"}
                                    {field.value === "email" &&
                                        "Email address (optional)"}
                                    {field.value === "phone" &&
                                        "Phone number (optional)"}
                                    {field.value === "address" &&
                                        "Physical address (optional)"}
                                    {field.value === "notes" &&
                                        "Additional notes (optional)"}
                                </Text>
                            </div>
                            <div style={{ width: 200 }}>
                                <Select
                                    placeholder="Select CSV column..."
                                    data={[
                                        { value: "", label: "Not mapped" },
                                        ...csvHeaders.map((header) => ({
                                            value: header,
                                            label: header,
                                        })),
                                    ]}
                                    value={
                                        columnMapping[
                                            field.value as keyof ColumnMapping
                                        ]
                                    }
                                    onChange={(value) =>
                                        handleMappingChange(
                                            field.value as keyof ColumnMapping,
                                            value || ""
                                        )
                                    }
                                    searchable
                                    clearable={!field.required}
                                />
                            </div>
                        </Group>
                    ))}
                </Stack>
            </Paper>

            {previewData.length > 0 && columnMapping.name && (
                <Paper withBorder p="md">
                    <Text size="sm" fw={500} mb="md">
                        Preview of mapped data (first {previewData.length}{" "}
                        rows):
                    </Text>
                    <ScrollArea>
                        <Table striped highlightOnHover>
                            <Table.Thead>
                                <Table.Tr>
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
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {previewData.map((row, index) => (
                                    <Table.Tr key={index}>
                                        <Table.Td>
                                            {row._mappedName || "-"}
                                        </Table.Td>
                                        {columnMapping.email && (
                                            <Table.Td>
                                                {row._mappedEmail || "-"}
                                            </Table.Td>
                                        )}
                                        {columnMapping.phone && (
                                            <Table.Td>
                                                {row._mappedPhone || "-"}
                                            </Table.Td>
                                        )}
                                        {columnMapping.address && (
                                            <Table.Td>
                                                {row._mappedAddress || "-"}
                                            </Table.Td>
                                        )}
                                        {columnMapping.notes && (
                                            <Table.Td>
                                                {row._mappedNotes || "-"}
                                            </Table.Td>
                                        )}
                                    </Table.Tr>
                                ))}
                            </Table.Tbody>
                        </Table>
                    </ScrollArea>
                </Paper>
            )}

            <Group justify="space-between">
                <Button variant="light" onClick={onBack}>
                    Back
                </Button>
                <Button onClick={handleNext} disabled={!columnMapping.name}>
                    Next: Review & Import
                </Button>
            </Group>
        </Stack>
    );
}
