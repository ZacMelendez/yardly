"use client";

import { useState } from "react";
import {
    Stack,
    Button,
    Alert,
    Text,
    Group,
    Table,
    ScrollArea,
    Paper,
} from "@mantine/core";
import {
    IconUpload,
    IconAlertCircle,
    IconFileText,
    IconX,
} from "@tabler/icons-react";
import { CSVRow } from "../CustomerUploadView";
import Papa from "papaparse";
import { Dropzone, MIME_TYPES } from "@mantine/dropzone";

interface CSVUploadStepProps {
    onUpload: (data: CSVRow[], headers: string[]) => void;
    onNext: () => void;
}

export default function CSVUploadStep({
    onUpload,
    onNext,
}: CSVUploadStepProps) {
    const [file, setFile] = useState<File | null>(null);
    const [previewData, setPreviewData] = useState<CSVRow[]>([]);
    const [headers, setHeaders] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const parseCSV = (
        csvText: string
    ): Promise<{ data: CSVRow[]; headers: string[] }> => {
        return new Promise((resolve, reject) => {
            Papa.parse(csvText, {
                header: true,
                skipEmptyLines: true,
                transformHeader: (header) => header.trim(),
                transform: (value) => value.trim(),
                complete: (results) => {
                    if (results.errors.length > 0) {
                        console.warn("CSV parsing warnings:", results.errors);
                    }

                    if (results.data.length === 0) {
                        reject(
                            new Error(
                                "CSV file is empty or contains no valid data"
                            )
                        );
                        return;
                    }

                    // Convert Papa Parse result to our format
                    const data: CSVRow[] = results.data as CSVRow[];
                    const headers = results.meta.fields || [];

                    console.log({ data, headers });
                    resolve({ data, headers });
                },
                error: (error: any) => {
                    reject(new Error(`Failed to parse CSV: ${error.message}`));
                },
            });
        });
    };

    const handleFileUpload = async (file: File | null) => {
        if (!file) return;

        setError(null);
        setIsProcessing(true);

        try {
            // Validate file type
            if (!file.name.toLowerCase().endsWith(".csv")) {
                throw new Error("Please select a CSV file");
            }

            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                throw new Error("File size must be less than 5MB");
            }

            const text = await file.text();
            const { data, headers } = await parseCSV(text);

            console.log(data, headers);
            if (data.length === 0) {
                throw new Error("No data found in CSV file");
            }

            if (data.length > 1000) {
                throw new Error(
                    "CSV file contains too many rows. Maximum 1000 rows allowed."
                );
            }

            setFile(file);
            setHeaders(headers);
            setPreviewData(data.slice(0, 10)); // Show first 10 rows for preview
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Failed to parse CSV file"
            );
        } finally {
            setIsProcessing(false);
        }
    };

    const handleNext = async () => {
        if (file && headers.length > 0) {
            try {
                // Re-parse the full file for upload
                const text = await file.text();
                const { data } = await parseCSV(text);
                onUpload(data, headers);
                onNext();
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : "Failed to parse CSV file"
                );
            }
        }
    };

    return (
        <Stack gap="lg">
            <Alert
                icon={<IconAlertCircle size={16} />}

                // size="sm"
            >
                <Text>
                    <strong>Valid Fields:</strong> Name (required), Email,
                    Phone, Address, Notes
                </Text>
            </Alert>
            {previewData.length < 1 && (
                <Dropzone
                    onDrop={(files) => {
                        if (files.length > 0) {
                            handleFileUpload(files[0]);
                        }
                    }}
                    onReject={(_files) => {
                        setError("Please select a valid CSV file");
                    }}
                    maxSize={5 * 1024 * 1024} // 5MB
                    accept={[MIME_TYPES.csv]}
                    loading={isProcessing}
                    disabled={isProcessing}
                >
                    <Stack
                        gap="md"
                        mih={300}
                        style={{ pointerEvents: "none" }}
                        justify="center"
                    >
                        <Group justify="center" gap="xl">
                            <Dropzone.Accept>
                                <IconUpload
                                    size={52}
                                    color="var(--mantine-color-blue-6)"
                                    stroke={1.5}
                                />
                            </Dropzone.Accept>
                            <Dropzone.Reject>
                                <IconX
                                    size={52}
                                    color="var(--mantine-color-red-6)"
                                    stroke={1.5}
                                />
                            </Dropzone.Reject>
                            <Dropzone.Idle>
                                <IconFileText
                                    size={52}
                                    color="var(--mantine-color-dimmed)"
                                    stroke={1.5}
                                />
                            </Dropzone.Idle>

                            <Stack gap="sm" justify="center" h="100%">
                                <Text size="xl" inline>
                                    Drag CSV file here or click to select
                                </Text>
                                <Text size="sm" c="dimmed">
                                    <strong>Requirements:</strong> CSV format,
                                    max 5MB, 1000 rows, headers required
                                </Text>
                            </Stack>
                        </Group>
                    </Stack>
                </Dropzone>
            )}

            {error && (
                <Alert icon={<IconX size={16} />} color="red">
                    <Text size="sm">{error}</Text>
                </Alert>
            )}

            {previewData.length > 0 && (
                <Paper withBorder p="md">
                    <Text size="sm" fw={500} mb="md">
                        Preview ({previewData.length} rows shown):
                    </Text>
                    <ScrollArea>
                        <Table striped highlightOnHover>
                            <Table.Thead>
                                <Table.Tr>
                                    {headers.map((header, index) => (
                                        <Table.Th key={index}>
                                            {header}
                                        </Table.Th>
                                    ))}
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {previewData.map((row, rowIndex) => (
                                    <Table.Tr key={rowIndex}>
                                        {headers.map((header, colIndex) => (
                                            <Table.Td key={colIndex}>
                                                {row[header] || "-"}
                                            </Table.Td>
                                        ))}
                                    </Table.Tr>
                                ))}
                            </Table.Tbody>
                        </Table>
                    </ScrollArea>
                </Paper>
            )}

            <Group justify="flex-end">
                <Button
                    onClick={handleNext}
                    disabled={!file || previewData.length === 0 || isProcessing}
                    loading={isProcessing}
                >
                    Next: Map Columns
                </Button>
            </Group>
        </Stack>
    );
}
