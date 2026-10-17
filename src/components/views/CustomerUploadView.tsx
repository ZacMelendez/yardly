"use client";

import { useState } from "react";
import {
    Container,
    Title,
    Stack,
    Button,
    Group,
    Alert,
    Text,
    Stepper,
    ActionIcon,
} from "@mantine/core";
import {
    IconCheck,
    IconX,
    IconUpload,
    IconMap,
    IconChecklist,
    IconArrowLeft,
} from "@tabler/icons-react";
import CSVUploadStep from "./CustomerUpload/CSVUploadStep";
import ColumnMappingStep from "./CustomerUpload/ColumnMappingStep";
import ReviewStep from "./CustomerUpload/ReviewStep";
import { useTransitionRouter } from "next-view-transitions";
import { fetchJSON } from "@/lib/fetchJson";
import { useSubscriptionLimits } from "@/hooks/useSubscriptionLimits";

export interface CSVRow {
    [key: string]: string;
}

export interface ColumnMapping {
    name: string;
    email: string;
    phone: string;
    address: string;
    notes: string;
}

export interface UploadResult {
    success: boolean;
    message: string;
    createdCount: number;
    errorCount: number;
    errors: string[];
}

export default function CustomerUploadView() {
    const router = useTransitionRouter();
    const { handleLimitError } = useSubscriptionLimits();
    const [currentStep, setCurrentStep] = useState(1);
    const [csvData, setCsvData] = useState<CSVRow[]>([]);
    const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
    const [columnMapping, setColumnMapping] = useState<ColumnMapping>({
        name: "",
        email: "",
        phone: "",
        address: "",
        notes: "",
    });
    const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    const handleCSVUpload = (data: CSVRow[], headers: string[]) => {
        setCsvData(data);
        setCsvHeaders(headers);
        setCurrentStep(2);
    };

    const handleColumnMapping = (mapping: ColumnMapping) => {
        setColumnMapping(mapping);
        setCurrentStep(3);
    };

    const handleUpload = async () => {
        setIsUploading(true);
        try {
            const result = await fetchJSON<UploadResult>(
                "/api/customers/bulk-upload",
                {
                    method: "POST",
                    body: JSON.stringify({
                        data: csvData,
                        columnMapping,
                    }),
                }
            );
            setUploadResult(result);

            if (result.success) {
                // Redirect to customers page after successful upload
                setTimeout(() => {
                    router.push("/customers");
                }, 2000);
            }
        } catch (error) {
            console.error("Upload failed:", error);
            if (!handleLimitError(error)) {
                setUploadResult({
                    success: false,
                    message: "Upload failed. Please try again.",
                    createdCount: 0,
                    errorCount: 0,
                    errors: ["Network error occurred"],
                });
            }
        } finally {
            setIsUploading(false);
        }
    };

    const resetUpload = () => {
        setCurrentStep(1);
        setCsvData([]);
        setCsvHeaders([]);
        setColumnMapping({
            name: "",
            email: "",
            phone: "",
            address: "",
            notes: "",
        });
        setUploadResult(null);
        setIsUploading(false);
    };

    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return (
                    <CSVUploadStep
                        onUpload={handleCSVUpload}
                        onNext={() => setCurrentStep(2)}
                    />
                );
            case 2:
                return (
                    <ColumnMappingStep
                        csvHeaders={csvHeaders}
                        csvData={csvData.slice(0, 5)} // Show first 5 rows for preview
                        columnMapping={columnMapping}
                        onMappingChange={setColumnMapping}
                        onNext={handleColumnMapping}
                        onBack={() => setCurrentStep(1)}
                    />
                );
            case 3:
                return (
                    <ReviewStep
                        csvData={csvData}
                        columnMapping={columnMapping}
                        onUpload={handleUpload}
                        onBack={() => setCurrentStep(2)}
                        isUploading={isUploading}
                        uploadResult={uploadResult}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <Container size="lg" py="xl">
            <Stack gap="lg">
                <ActionIcon
                    variant="subtle"
                    size="lg"
                    onClick={() => router.back()}
                >
                    <IconArrowLeft size={20} />
                </ActionIcon>

                <Title order={1}>Bulk Customer Upload</Title>

                <Text c="dimmed" size="sm">
                    Upload a CSV file to import multiple customers at once.
                    You'll be able to map your CSV columns to the appropriate
                    customer fields.
                </Text>

                {/* Stepper */}
                <Stepper
                    active={currentStep - 1}
                    onStepClick={(step) => {
                        // Allow going back to previous steps only
                        if (step < currentStep - 1) {
                            setCurrentStep(step + 1);
                        }
                    }}
                    allowNextStepsSelect={false}
                    size="md"
                >
                    <Stepper.Step
                        label="Upload CSV"
                        description="Select and upload your CSV file"
                        icon={<IconUpload size={18} />}
                    >
                        {renderStep()}
                    </Stepper.Step>
                    <Stepper.Step
                        label="Map Columns"
                        description="Match CSV columns to customer fields"
                        icon={<IconMap size={18} />}
                    >
                        {renderStep()}
                    </Stepper.Step>
                    <Stepper.Step
                        label="Review & Import"
                        description="Review data and complete import"
                        icon={<IconChecklist size={18} />}
                    >
                        {renderStep()}
                    </Stepper.Step>
                </Stepper>

                {/* Upload result */}
                {uploadResult && (
                    <Alert
                        color={uploadResult.success ? "green" : "red"}
                        icon={uploadResult.success ? <IconCheck /> : <IconX />}
                        title={
                            uploadResult.success
                                ? "Upload Successful!"
                                : "Upload Failed"
                        }
                    >
                        <Stack gap="xs">
                            <Text>{uploadResult.message}</Text>
                            {uploadResult.success && (
                                <Text size="sm">
                                    Successfully created{" "}
                                    {uploadResult.createdCount} customers.
                                    {uploadResult.errorCount > 0 &&
                                        ` ${uploadResult.errorCount} rows had errors and were skipped.`}
                                </Text>
                            )}
                            {uploadResult.errors.length > 0 && (
                                <Stack gap="xs">
                                    <Text size="sm" fw={500}>
                                        Errors:
                                    </Text>
                                    {uploadResult.errors.map((error, index) => (
                                        <Text key={index} size="xs" c="red">
                                            • {error}
                                        </Text>
                                    ))}
                                </Stack>
                            )}
                        </Stack>
                    </Alert>
                )}

                {/* Reset button */}
                {uploadResult && (
                    <Group justify="center">
                        <Button variant="light" onClick={resetUpload}>
                            Upload Another File
                        </Button>
                    </Group>
                )}
            </Stack>
        </Container>
    );
}
